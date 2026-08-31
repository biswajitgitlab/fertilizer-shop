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
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $cacheKey = "admin_inventory_list_p{$page}_s_" . md5($search);

        $products = Cache::remember($cacheKey, 180, function () use ($request) {
            $query = Product::select('id', 'name', 'stock_qty', 'price', 'is_active');

            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', "%{$request->search}%");
            }

            return $query->orderBy('stock_qty', 'asc')->paginate(20);
        });

        return response()->json($products);
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
            \App\Services\NotificationService::notifyLowStock($product);
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

