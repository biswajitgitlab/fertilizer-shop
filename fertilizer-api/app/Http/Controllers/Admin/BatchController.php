<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductBatch;
use App\Models\Product;
use App\Models\InventoryLog;
use App\Models\WarehouseZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));
        $status = $request->get('status', '');

        $cacheKey = "batches:p{$page}:pp{$perPage}:s{$search}:st{$status}";

        try {
            $cacheStore = \Illuminate\Support\Facades\Cache::store('redis');
        } catch (\Throwable $e) {
            $cacheStore = \Illuminate\Support\Facades\Cache::store();
        }

        $result = $cacheStore->remember($cacheKey, 300, function () use ($page, $perPage, $search, $status) {
            $query = ProductBatch::with(['product', 'warehouseZone']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('batch_code', 'like', "%{$search}%")
                      ->orWhere('warehouse_zone', 'like', "%{$search}%")
                      ->orWhereHas('product', function ($pq) use ($search) {
                          $pq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('expiry_date', 'asc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->toArray();

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

        // If simple array requested without page param, return data for legacy callers
        if (!$request->has('page') && !$request->has('search')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
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

        // Capacity Validation Check
        $zone = WarehouseZone::where('code', $validated['warehouse_zone'])->first();
        if ($zone) {
            $currentZoneStock = ProductBatch::where('warehouse_zone', $zone->code)->sum('stock_qty');
            if (($currentZoneStock + $validated['stock_qty']) > $zone->capacity_units) {
                return response()->json([
                    'message' => "Warehouse Zone Capacity Exceeded! Zone {$zone->code} ({$zone->name}) capacity limit is " . number_format($zone->capacity_units) . " units. Currently storing " . number_format($currentZoneStock) . " units. Cannot add " . number_format($validated['stock_qty']) . " additional units.",
                    'errors' => [
                        'warehouse_zone' => ["Capacity limit exceeded for zone {$zone->code} (Max: " . number_format($zone->capacity_units) . " units)"]
                    ]
                ], 422);
            }
        }

        $validated['status'] = $status;

        $batch = DB::transaction(function () use ($validated) {
            $createdBatch = ProductBatch::create($validated);

            // Sync main Product catalog stock_qty
            $product = Product::findOrFail($validated['product_id']);
            $product->increment('stock_qty', $validated['stock_qty']);

            // Create Inventory Audit Log
            InventoryLog::create([
                'product_id' => $product->id,
                'type' => 'RESTOCK',
                'qty' => $validated['stock_qty'],
                'reason' => "Inbound Batch #{$createdBatch->batch_code} received into Warehouse Zone {$createdBatch->warehouse_zone}",
                'admin_id' => auth()->id() ?? 1,
            ]);

            return $createdBatch;
        });

        $this->clearBatchCache();

        return response()->json([
            'message' => 'Product batch created and inventory synchronized successfully',
            'batch' => $batch->load(['product', 'warehouseZone']),
        ], 201);
    }

    private function clearBatchCache()
    {
        try {
            if (\Illuminate\Support\Facades\Cache::config('cache.default') === 'redis') {
                $redis = \Illuminate\Support\Facades\Cache::redis();
                foreach ($redis->keys('*batches:*') as $key) {
                    $redis->del($key);
                }
                foreach ($redis->keys('*fefo:*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {}
        \Illuminate\Support\Facades\Cache::flush();
    }

    public function update(Request $request, $id)
    {
        $batch = ProductBatch::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:SAFE,FEFO_DISPATCH_PRIORITY,CRITICAL_EXPIRY_RISK,QUARANTINED,EXPIRED',
            'warehouse_zone' => 'sometimes|string|exists:warehouse_zones,code',
            'stock_qty' => 'sometimes|integer|min:0',
            'expiry_date' => 'sometimes|date',
            'moisture_pct' => 'sometimes|numeric|min:0',
        ]);

        DB::transaction(function () use ($batch, $validated) {
            if (isset($validated['stock_qty']) && $validated['stock_qty'] !== $batch->stock_qty) {
                $qtyDiff = $validated['stock_qty'] - $batch->stock_qty;
                $product = Product::findOrFail($batch->product_id);

                if ($qtyDiff > 0) {
                    $product->increment('stock_qty', $qtyDiff);
                } else {
                    $product->decrement('stock_qty', abs($qtyDiff));
                }

                InventoryLog::create([
                    'product_id' => $product->id,
                    'type' => 'AUDIT_ADJUSTMENT',
                    'qty' => $qtyDiff,
                    'reason' => "Batch #{$batch->batch_code} stock quantity manually adjusted to {$validated['stock_qty']}",
                    'admin_id' => auth()->id() ?? 1,
                ]);
            }

            $batch->update($validated);
        });

        $this->clearBatchCache();

        return response()->json([
            'message' => 'Product batch updated successfully',
            'batch' => $batch->fresh(['product', 'warehouseZone']),
        ]);
    }
}
