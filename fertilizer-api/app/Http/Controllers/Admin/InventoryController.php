<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::select('id', 'name', 'stock_qty', 'price', 'is_active');

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $products = $query->orderBy('stock_qty', 'asc')->paginate(20);
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

        // Create log
        InventoryLog::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'quantity_changed' => $request->stock - $oldStock,
            'new_stock' => $request->stock,
            'reason' => $request->reason ?? 'Manual adjustment'
        ]);

        return response()->json(['message' => 'Stock updated successfully', 'product' => $product]);
    }

    public function logs($id)
    {
        $logs = InventoryLog::with('user')->where('product_id', $id)->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($logs);
    }
}
