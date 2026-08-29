<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('date_range')) {
            $dates = explode(',', $request->date_range);
            if (count($dates) == 2) {
                $query->whereBetween('created_at', [$dates[0], $dates[1]]);
            }
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);
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

        return response()->json(['message' => 'Orders updated successfully']);
    }
}
