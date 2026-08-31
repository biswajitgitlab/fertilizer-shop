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
        $product->stock_qty = $request->stock;
        $product->save();

        // Synchronize batch lot stock
        $batch = \App\Models\ProductBatch::where('product_id', $product->id)->first();
        if ($batch) {
            $batch->stock_qty = $request->stock;
            $batch->save();
        }

        // Create log
        InventoryLog::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'quantity_changed' => $request->stock - $oldStock,
            'new_stock' => $request->stock,
            'reason' => $request->reason ?? 'Manual adjustment'
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

