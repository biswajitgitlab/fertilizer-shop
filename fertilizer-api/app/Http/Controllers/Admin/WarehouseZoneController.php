<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WarehouseZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WarehouseZoneController extends Controller
{
    private function clearZoneCache()
    {
        try {
            if (config('cache.default') === 'redis') {
                $redis = Cache::redis();
                foreach ($redis->keys('*zones:*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {}
        Cache::flush();
    }

    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));

        $cacheKey = "zones:p{$page}:pp{$perPage}:s{$search}";

        try {
            $cacheStore = Cache::store('redis');
        } catch (\Throwable $e) {
            $cacheStore = Cache::store();
        }

        $result = $cacheStore->remember($cacheKey, 300, function () use ($page, $perPage, $search) {
            $query = WarehouseZone::withCount('batches');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%")
                      ->orWhere('category_type', 'like', "%{$search}%");
                });
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('code', 'asc')
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

        if (!$request->has('page') && !$request->has('search')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:warehouse_zones,code|max:50',
            'name' => 'required|string|max:255',
            'category_type' => 'nullable|string|max:255',
            'temperature_controlled' => 'boolean',
            'capacity_units' => 'required|integer|min:1',
        ]);

        $zone = WarehouseZone::create($validated);
        $this->clearZoneCache();

        return response()->json($zone, 201);
    }

    public function show($id)
    {
        $zone = WarehouseZone::with('batches.product')->findOrFail($id);
        return response()->json($zone);
    }

    public function update(Request $request, $id)
    {
        $zone = WarehouseZone::findOrFail($id);

        $validated = $request->validate([
            'code' => 'string|max:50|unique:warehouse_zones,code,' . $zone->id,
            'name' => 'string|max:255',
            'category_type' => 'nullable|string|max:255',
            'temperature_controlled' => 'boolean',
            'capacity_units' => 'integer|min:1',
        ]);

        $zone->update($validated);
        $this->clearZoneCache();

        return response()->json($zone);
    }

    public function destroy($id)
    {
        $zone = WarehouseZone::findOrFail($id);
        if ($zone->batches()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete warehouse zone with active assigned product batches.'
            ], 422);
        }
        $zone->delete();
        $this->clearZoneCache();

        return response()->json(['message' => 'Warehouse zone deleted successfully']);
    }
}
