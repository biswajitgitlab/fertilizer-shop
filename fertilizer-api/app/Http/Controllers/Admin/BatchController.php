<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductBatch;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $batches = ProductBatch::with('product')
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json($batches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_code' => 'required|string|unique:product_batches,batch_code',
            'manufactured_date' => 'required|date',
            'expiry_date' => 'required|date|after:manufactured_date',
            'moisture_pct' => 'required|numeric|min:0|max:100',
            'stock_qty' => 'required|integer|min:1',
            'warehouse_zone' => 'required|string',
        ]);

        $daysToExpiry = Carbon::now()->diffInDays(Carbon::parse($validated['expiry_date']), false);
        $status = 'SAFE';
        if ($daysToExpiry < 30) {
            $status = 'CRITICAL_EXPIRY_RISK';
        } elseif ($daysToExpiry < 60) {
            $status = 'FEFO_DISPATCH_PRIORITY';
        }

        $validated['status'] = $status;
        $batch = ProductBatch::create($validated);

        return response()->json([
            'message' => 'Product batch created successfully',
            'batch' => $batch->load('product'),
        ], 201);
    }
}
