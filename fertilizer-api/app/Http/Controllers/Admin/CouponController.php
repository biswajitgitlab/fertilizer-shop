<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Cache::remember('admin_coupons_list', 600, function () {
            return Coupon::orderBy('created_at', 'desc')->paginate(20);
        });
        return response()->json($coupons);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:PERCENT,FIXED',
            'value' => 'required|numeric|min:0',
            'min_order' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean'
        ]);

        $coupon = Coupon::create($request->all());
        Cache::forget('admin_coupons_list');
        return response()->json(['message' => 'Coupon created successfully', 'coupon' => $coupon], 201);
    }

    public function show($id)
    {
        $coupon = Cache::remember("admin_coupon_{$id}", 600, function () use ($id) {
            return Coupon::findOrFail($id);
        });
        return response()->json($coupon);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => 'required|string|unique:coupons,code,'.$id,
            'type' => 'required|in:PERCENT,FIXED',
            'value' => 'required|numeric|min:0',
            'min_order' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean'
        ]);

        $coupon->update($request->all());
        Cache::forget('admin_coupons_list');
        Cache::forget("admin_coupon_{$id}");

        return response()->json(['message' => 'Coupon updated successfully', 'coupon' => $coupon]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        Cache::forget('admin_coupons_list');
        Cache::forget("admin_coupon_{$id}");

        return response()->json(['message' => 'Coupon deleted successfully']);
    }
}

