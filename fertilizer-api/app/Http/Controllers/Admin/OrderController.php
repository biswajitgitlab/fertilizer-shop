<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $status = $request->input('status', '');
        $paymentStatus = $request->input('payment_status', '');
        $search = strtolower(trim($request->get('search', '')));

        $cacheKey = "orders:p{$page}:pp{$perPage}:st{$status}:ps{$paymentStatus}:s{$search}";

        try {
            $cacheStore = Cache::store('redis');
        } catch (\Throwable $e) {
            $cacheStore = Cache::store();
        }

        $result = $cacheStore->remember($cacheKey, 180, function () use ($page, $perPage, $status, $paymentStatus, $search) {
            $query = Order::with(['user', 'items.product', 'payment']);

            if (!empty($status)) {
                $query->where('status', strtoupper($status));
            }

            if (!empty($paymentStatus)) {
                $query->where('payment_status', strtoupper($paymentStatus));
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

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

        if (!$request->has('page') && !$request->has('search') && !$request->has('per_page')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
    }

    public function show($id)
    {
        $order = Cache::remember("admin_order_{$id}", 300, function () use ($id) {
            return Order::with(['user', 'items.product', 'payment'])->findOrFail($id);
        });
        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|in:PENDING,CONFIRMED,SHIPPED,DELIVERED,CANCELLED,REFUNDED',
            'tracking_number' => 'sometimes|nullable|string'
        ]);

        if ($request->has('status')) {
            $order->status = $request->status;
        }

        if ($request->has('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
        }

        $order->save();

        Cache::forget("admin_order_{$id}");
        Cache::forget('admin_dashboard_stats');
        Cache::forget('admin_analytics_metrics');

        \App\Services\NotificationService::notifyOrderStatusUpdated($order);

        try {
            $order->load('user');
            \Illuminate\Support\Facades\Http::post(env('N8N_ORDER_WEBHOOK_URL', 'http://localhost:5678/webhook/order-status'), [
                'order_id' => $order->id,
                'status' => $order->status,
                'tracking_number' => $order->tracking_number,
                'user_phone' => $order->user->phone ?? 'Unknown',
            ]);
        } catch (\Exception $e) {
            // Fail silently if webhook server is unreachable
        }

        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'status' => 'required|in:PENDING,CONFIRMED,SHIPPED,DELIVERED,CANCELLED,REFUNDED'
        ]);

        Order::whereIn('id', $request->order_ids)->update(['status' => $request->status]);

        Cache::forget('admin_dashboard_stats');
        Cache::forget('admin_analytics_metrics');
        foreach ($request->order_ids as $id) {
            Cache::forget("admin_order_{$id}");
        }

        return response()->json(['message' => 'Orders updated successfully']);
    }
}

