<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CouponController extends Controller
{
    private function clearCouponCache()
    {
        try {
            if (config('cache.default') === 'redis') {
                $redis = Cache::redis();
                foreach ($redis->keys('*coupons:*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {}
        Cache::forget('admin_coupons_list');
    }

    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));

        $cacheKey = "coupons:p{$page}:pp{$perPage}:s{$search}";

        $fetchData = function () use ($page, $perPage, $search) {
            $query = Coupon::query();

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('type', 'like', "%{$search}%");
                });
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('created_at', 'desc')
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
        };

        try {
            $result = Cache::remember($cacheKey, 300, $fetchData);
        } catch (\Throwable $e) {
            $result = $fetchData();
        }

        if (!$request->has('page') && !$request->has('search') && !$request->has('per_page')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:PERCENT,FIXED',
            'value' => 'required|numeric|min:0',
            'min_order' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
            'is_new_customer_only' => 'boolean'
        ]);

        $coupon = Coupon::create($request->all());
        $this->clearCouponCache();
        app(\App\Contracts\NotificationServiceInterface::class)->notifyCouponCreated($coupon);
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
            'is_active' => 'boolean',
            'is_new_customer_only' => 'boolean'
        ]);

        $coupon->update($request->all());
        $this->clearCouponCache();
        Cache::forget("admin_coupon_{$id}");

        return response()->json(['message' => 'Coupon updated successfully', 'coupon' => $coupon]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        $this->clearCouponCache();
        Cache::forget("admin_coupon_{$id}");

        return response()->json(['message' => 'Coupon deleted successfully']);
    }
}
