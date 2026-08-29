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
        $status = $request->input('status', '');
        $paymentStatus = $request->input('payment_status', '');
        $page = $request->input('page', 1);
        $dateRange = $request->input('date_range', '');

        $cacheKey = "admin_orders_p{$page}_st_{$status}_pay_{$paymentStatus}_d_" . md5($dateRange);

        $orders = Cache::remember($cacheKey, 180, function () use ($request) {
            $query = Order::with(['user', 'items.product', 'payment']);

            if ($request->filled('status')) {
                $query->where('status', strtoupper($request->status));
            }

            if ($request->filled('payment_status')) {
                $query->where('payment_status', strtoupper($request->payment_status));
            }

            if ($request->filled('date_range')) {
                $dates = explode(',', $request->date_range);
                if (count($dates) == 2) {
                    $query->whereBetween('created_at', [$dates[0], $dates[1]]);
                }
            }

            return $query->orderBy('created_at', 'desc')->paginate(50);
        });

        return response()->json($orders);
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

