<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));

        $cacheKey = "inventory:p{$page}:pp{$perPage}:s{$search}";

        try {
            $cacheStore = Cache::store('redis');
        } catch (\Throwable $e) {
            $cacheStore = Cache::store();
        }

        $result = $cacheStore->remember($cacheKey, 180, function () use ($page, $perPage, $search) {
            $query = Product::with('category')->select('id', 'name', 'category_id', 'stock_qty', 'price', 'is_active');

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('stock_qty', 'asc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            return [
                'data' => $items,
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        });

        if (!$request->has('page') && !$request->has('search')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'stock' => 'required|integer|min:0',
            'reason' => 'nullable|string'
        ]);

        $product = Product::findOrFail($id);
        $oldStock = $product->stock_qty;
        $newStock = (int) $request->stock;
        $delta = $newStock - $oldStock;

        if ($delta > 0) {
            return response()->json([
                'message' => 'Direct inventory restocking without batch metadata is disabled for agricultural compliance.',
                'errors' => [
                    'stock' => [
                        "Inbound inventory restocks must be registered through the Batch Management module (/admin/batches) with mandatory Lot Number, Manufactured Date, Expiry Date, Moisture %, and Warehouse Zone."
                    ]
                ]
            ], 422);
        }

        if ($delta < 0) {
            // Stock reduction / audit write-off: Deduct from batches using FEFO order (earliest expiring batch first)
            $remainingToDeduct = abs($delta);
            $batches = \App\Models\ProductBatch::where('product_id', $product->id)
                ->where('stock_qty', '>', 0)
                ->orderBy('expiry_date', 'asc')
                ->get();

            foreach ($batches as $batch) {
                if ($remainingToDeduct <= 0) break;

                if ($batch->stock_qty >= $remainingToDeduct) {
                    $batch->decrement('stock_qty', $remainingToDeduct);
                    $remainingToDeduct = 0;
                } else {
                    $remainingToDeduct -= $batch->stock_qty;
                    $batch->update(['stock_qty' => 0]);
                }
            }
        }

        // Set Product stock_qty equal to actual sum of active product batches (or newStock)
        $product->stock_qty = \App\Models\ProductBatch::where('product_id', $product->id)->sum('stock_qty');
        if ($product->stock_qty == 0 && $newStock > 0) {
            $product->stock_qty = $newStock;
        }
        $product->save();

        // Create Audit Log
        InventoryLog::create([
            'product_id' => $product->id,
            'type' => $delta >= 0 ? 'RESTOCK' : 'ADJUSTMENT_OUT',
            'qty' => $delta,
            'reason' => $request->reason ?? 'Manual stock update via inventory control',
            'admin_id' => auth()->id() ?? 1,
        ]);

        // Invalidate admin dashboard & inventory caches
        Cache::forget('admin_dashboard_stats');
        Cache::forget('products_featured');
        Cache::forget('products_trending');
        if ($product->slug) {
            Cache::forget("product_{$product->slug}");
        }

        if ($product->stock_qty <= 10) {
            app(\App\Contracts\NotificationServiceInterface::class)->notifyLowStock($product);
        }

        return response()->json(['message' => 'Stock updated successfully', 'product' => $product]);
    }

    public function logs($id)
    {
        $logs = Cache::remember("admin_inventory_logs_{$id}", 300, function () use ($id) {
            return InventoryLog::with('user')->where('product_id', $id)->orderBy('created_at', 'desc')->paginate(20);
        });
        return response()->json($logs);
    }
}

