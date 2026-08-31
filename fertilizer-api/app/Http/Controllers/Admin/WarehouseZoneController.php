<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WarehouseZone;
use Illuminate\Http\Request;

class WarehouseZoneController extends Controller
{
    public function index(Request $request)
    {
        $zones = WarehouseZone::withCount('batches')->orderBy('code', 'asc')->get();
        return response()->json($zones);
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
        return response()->json(['message' => 'Warehouse zone deleted successfully']);
    }
}
