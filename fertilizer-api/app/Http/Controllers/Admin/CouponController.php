<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->paginate(20);
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
        return response()->json(['message' => 'Coupon created successfully', 'coupon' => $coupon], 201);
    }

    public function show($id)
    {
        $coupon = Coupon::findOrFail($id);
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
        return response()->json(['message' => 'Coupon updated successfully', 'coupon' => $coupon]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted successfully']);
    }
}
