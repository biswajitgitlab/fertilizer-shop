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
        $packerId = $request->get('packer_id');
        $driverId = $request->get('driver_id');
        $assignedToMe = $request->boolean('assigned_to_me');

        $currentUser = auth('admin')->user() ?: auth()->user();
        $currentUserId = $currentUser ? $currentUser->id : 0;
        $currentRoles = $currentUser && method_exists($currentUser, 'getRoleNames') ? implode(',', $currentUser->getRoleNames()->toArray()) : 'all';

        $cacheKey = "orders:u{$currentUserId}:r{$currentRoles}:p{$page}:pp{$perPage}:st{$status}:ps{$paymentStatus}:s{$search}:pk{$packerId}:dr{$driverId}:atm{$assignedToMe}";

        try {
            $cacheStore = Cache::store('redis');
        } catch (\Throwable $e) {
            $cacheStore = Cache::store();
        }

        $result = $cacheStore->remember($cacheKey, 180, function () use ($page, $perPage, $status, $paymentStatus, $search, $packerId, $driverId, $assignedToMe, $currentUser) {
            $query = Order::with(['user', 'packer', 'driver', 'items.product', 'payment']);

            // 1. Role-Based Scoping & Assigned-To Filtering
            if ($currentUser && method_exists($currentUser, 'hasRole')) {
                if ($currentUser->hasRole('Warehouse Packer')) {
                    $query->where(function ($q) use ($currentUser) {
                        $q->where('packer_id', $currentUser->id)->orWhereNull('packer_id');
                    });
                } else if ($currentUser->hasRole('Logistics Driver')) {
                    $query->where(function ($q) use ($currentUser) {
                        $q->where('driver_id', $currentUser->id);
                    });
                }
            }

            if ($assignedToMe && $currentUser) {
                if ($currentUser->hasRole('Warehouse Packer')) {
                    $query->where('packer_id', $currentUser->id);
                } else if ($currentUser->hasRole('Logistics Driver')) {
                    $query->where('driver_id', $currentUser->id);
                } else {
                    $query->where(function ($q) use ($currentUser) {
                        $q->where('packer_id', $currentUser->id)->orWhere('driver_id', $currentUser->id);
                    });
                }
            }

            if (!empty($packerId)) {
                $query->where('packer_id', $packerId);
            }

            if (!empty($driverId)) {
                $query->where('driver_id', $driverId);
            }

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

            $formattedItems = $items->map(function ($order) {
                $customerName = $order->user ? $order->user->name : (is_array($order->shipping_address_json) ? ($order->shipping_address_json['name'] ?? 'Valued Customer') : 'Valued Customer');
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'user_id' => $order->user_id,
                    'customer_name' => $customerName,
                    'user' => $order->user ? [
                        'id' => $order->user->id,
                        'name' => $order->user->name,
                        'phone' => $order->user->phone,
                        'email' => $order->user->email,
                    ] : null,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'subtotal' => (float)$order->subtotal,
                    'shipping_cost' => (float)$order->shipping_cost,
                    'tax' => (float)$order->tax,
                    'discount' => (float)$order->discount,
                    'total' => (float)$order->total,
                    'shipping_address_json' => $order->shipping_address_json,
                    'tracking_number' => $order->tracking_number,
                    'packer_id' => $order->packer_id,
                    'packer' => $order->packer ? ['id' => $order->packer->id, 'name' => $order->packer->name] : null,
                    'driver_id' => $order->driver_id,
                    'driver' => $order->driver ? ['id' => $order->driver->id, 'name' => $order->driver->name] : null,
                    'items' => $order->items->map(function ($item) {
                        $effectiveUnitPrice = (float)($item->unit_price ?: ($item->product->price ?? 0));
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'qty' => $item->qty,
                            'unit_price' => $effectiveUnitPrice,
                            'total_price' => (float)($item->total_price ?: ($effectiveUnitPrice * $item->qty)),
                            'product' => $item->product ? [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'slug' => $item->product->slug,
                                'price' => $effectiveUnitPrice,
                                'unit' => $item->product->unit,
                                'images_json' => $item->product->images_json,
                            ] : null,
                        ];
                    })->values()->toArray(),
                    'created_at' => $order->created_at ? (is_string($order->created_at) ? $order->created_at : $order->created_at->toISOString()) : null,
                    'updated_at' => $order->updated_at ? (is_string($order->updated_at) ? $order->updated_at : $order->updated_at->toISOString()) : null,
                ];
            })->values()->toArray();

            return [
                'data' => $formattedItems,
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
        $orderData = Cache::remember("admin_order_{$id}", 300, function () use ($id) {
            $order = Order::with(['user', 'packer', 'driver', 'items.product', 'payment'])
                ->where('id', $id)
                ->orWhere('order_number', $id)
                ->firstOrFail();

            $customerName = $order->user ? $order->user->name : (is_array($order->shipping_address_json) ? ($order->shipping_address_json['name'] ?? 'Valued Customer') : 'Valued Customer');

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'customer_name' => $customerName,
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'phone' => $order->user->phone,
                    'email' => $order->user->email,
                ] : null,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'subtotal' => (float)$order->subtotal,
                'shipping_cost' => (float)$order->shipping_cost,
                'tax' => (float)$order->tax,
                'discount' => (float)$order->discount,
                'total' => (float)$order->total,
                'shipping_address_json' => $order->shipping_address_json,
                'tracking_number' => $order->tracking_number,
                'packer_id' => $order->packer_id,
                'packer' => $order->packer ? ['id' => $order->packer->id, 'name' => $order->packer->name] : null,
                'driver_id' => $order->driver_id,
                'driver' => $order->driver ? ['id' => $order->driver->id, 'name' => $order->driver->name] : null,
                'items' => $order->items->map(function ($item) {
                    $effectiveUnitPrice = (float)($item->unit_price ?: ($item->product->price ?? 0));
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'qty' => $item->qty,
                        'unit_price' => $effectiveUnitPrice,
                        'total_price' => (float)($item->total_price ?: ($effectiveUnitPrice * $item->qty)),
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'slug' => $item->product->slug,
                            'price' => $effectiveUnitPrice,
                            'unit' => $item->product->unit,
                            'images_json' => $item->product->images_json,
                        ] : null,
                    ];
                })->values()->toArray(),
                'created_at' => $order->created_at ? (is_string($order->created_at) ? $order->created_at : $order->created_at->toISOString()) : null,
                'updated_at' => $order->updated_at ? (is_string($order->updated_at) ? $order->updated_at : $order->updated_at->toISOString()) : null,
            ];
        });
        return response()->json($orderData);
        return response()->json($orderData);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|in:PENDING,CONFIRMED,PROCESSING,READY_FOR_PICKUP,SHIPPED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED,REFUNDED',
            'packer_id' => 'sometimes|nullable|exists:admins,id',
            'driver_id' => 'sometimes|nullable|exists:admins,id',
            'tracking_number' => 'sometimes|nullable|string',
            'cancellation_reason' => 'sometimes|nullable|string',
        ]);

        $newStatus = $request->input('status');

        if ($newStatus === 'CANCELLED' && $order->status !== 'CANCELLED') {
            // Guard: Cannot cancel shipped/delivered orders
            if (in_array($order->status, ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Order #{$order->order_number} has already been shipped/delivered and cannot be cancelled."
                ], 422);
            }

            $reason = $request->input('cancellation_reason') ?? 'Admin initiated cancellation';
            
            \Illuminate\Support\Facades\DB::transaction(function() use ($order, $reason) {
                $refundReferenceId = null;
                $refundStatus = 'NOT_APPLICABLE';
                $paymentStatus = $order->payment_status;
                $refundAmount = 0.00;

                if ($order->payment_status === 'PAID' || in_array(strtoupper($order->payment_method), ['ONLINE', 'RAZORPAY', 'UPI'])) {
                    $paymentService = app(\App\Contracts\PaymentServiceInterface::class);
                    $refundResult = $paymentService->processRefund($order, (float) $order->total, $reason);

                    $refundReferenceId = $refundResult['refund_id'] ?? ('rfnd_' . \Illuminate\Support\Str::random(12));
                    $refundStatus = 'REFUNDED';
                    $paymentStatus = 'REFUNDED';
                    $refundAmount = (float) $order->total;
                } else if ($order->payment_method === 'COD') {
                    $paymentStatus = 'CANCELLED';
                    $refundStatus = 'NOT_APPLICABLE';

                    \App\Models\DriverSettlement::where('order_id', $order->id)->update([
                        'status' => 'CANCELLED',
                        'notes' => "Cancelled by ADMIN: {$reason}"
                    ]);
                }

                $order->update([
                    'status' => 'CANCELLED',
                    'cancelled_at' => now(),
                    'cancelled_by' => 'ADMIN',
                    'cancellation_reason' => $reason,
                    'payment_status' => $paymentStatus,
                    'refund_status' => $refundStatus,
                    'refund_amount' => $refundAmount,
                    'refund_reference_id' => $refundReferenceId
                ]);

                // Restock products & batches
                foreach ($order->items as $item) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock_qty', $item->qty);

                        $batch = \App\Models\ProductBatch::where('product_id', $product->id)
                            ->where('expiry_date', '>', now())
                            ->orderBy('expiry_date', 'desc')
                            ->first();

                        if ($batch) {
                            $batch->increment('stock_qty', $item->qty);
                        }

                        \App\Models\InventoryLog::create([
                            'product_id' => $product->id,
                            'type' => 'CANCEL_RESTOCK',
                            'qty' => $item->qty,
                            'reason' => "Order #{$order->order_number} admin cancellation restock: {$reason}",
                            'admin_id' => auth()->id()
                        ]);
                    }
                }
            });
        } else {
            if ($request->has('status')) {
                $order->status = strtoupper($request->status);

                if (in_array($order->status, ['PROCESSING', 'READY_FOR_PICKUP', 'PACKED']) && !$order->packed_at) {
                    $order->packed_at = now();
                }
                if (in_array($order->status, ['SHIPPED', 'OUT_FOR_DELIVERY']) && !$order->shipped_at) {
                    $order->shipped_at = now();
                }
                if ($order->status === 'DELIVERED') {
                    $order->delivered_at = now();
                    $order->payment_status = 'PAID';

                    \App\Models\DriverSettlement::updateOrCreate(
                        ['order_id' => $order->id],
                        [
                            'driver_id' => $order->driver_id,
                            'cash_collected' => (float)$order->total,
                            'status' => 'SETTLED_TO_BANK',
                            'settled_at' => now(),
                            'notes' => 'Order marked DELIVERED - Payment collected & settled to bank.'
                        ]
                    );
                }
            }
        }

        // 1. Warehouse Packer Assignment -> Automatic Status Transition to PROCESSING / PACKED
        if ($request->has('packer_id') && $request->packer_id) {
            $order->packer_id = $request->packer_id;
            if (in_array($order->status, ['PENDING', 'CONFIRMED'])) {
                $order->status = 'PROCESSING';
            }
            if (!$order->packed_at) {
                $order->packed_at = now();
            }
        }

        // 2. Logistics Driver Assignment -> Automatic Status Transition to OUT_FOR_DELIVERY
        if ($request->has('driver_id') && $request->driver_id) {
            $order->driver_id = $request->driver_id;
            if (in_array($order->status, ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'])) {
                $order->status = 'OUT_FOR_DELIVERY';
            }
            if (!$order->shipped_at) {
                $order->shipped_at = now();
            }

            \App\Models\DriverSettlement::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'driver_id' => $request->driver_id,
                    'cash_collected' => (float)$order->total,
                    'status' => $order->status === 'DELIVERED' ? 'SETTLED_TO_BANK' : 'DRIVER_COLLECTION_PENDING',
                    'notes' => "Assigned to driver #{$request->driver_id} for order delivery."
                ]
            );
        }

        if ($request->has('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
        }

        $order->save();

        Cache::forget("admin_order_{$id}");
        $this->clearOrderCaches();

        app(\App\Contracts\NotificationServiceInterface::class)->notifyOrderStatusUpdated($order);

        try {
            $order->load(['user', 'packer', 'driver']);
            \Illuminate\Support\Facades\Http::post(env('N8N_ORDER_WEBHOOK_URL', 'http://localhost:5678/webhook/order-status'), [
                'order_id' => $order->id,
                'status' => $order->status,
                'packer_name' => $order->packer->name ?? null,
                'driver_name' => $order->driver->name ?? null,
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
            'status' => 'required|in:PENDING,CONFIRMED,PROCESSING,READY_FOR_PICKUP,SHIPPED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED,REFUNDED'
        ]);

        Order::whereIn('id', $request->order_ids)->update(['status' => $request->status]);

        $this->clearOrderCaches();
        foreach ($request->order_ids as $id) {
            Cache::forget("admin_order_{$id}");
        }

        return response()->json(['message' => 'Orders updated successfully']);
    }

    private function clearOrderCaches()
    {
        try {
            Cache::forget('admin_dashboard_stats');
            Cache::forget('admin_analytics_metrics');

            try {
                $redis = Cache::store('redis')->getRedis();
                $keys = $redis->keys('*orders:*');
                foreach ($keys as $key) {
                    $redis->del($key);
                }
                $sKeys = $redis->keys('*settlements:*');
                foreach ($sKeys as $key) {
                    $redis->del($key);
                }
            } catch (\Throwable $e) {
                Cache::flush();
            }
        } catch (\Throwable $e) {
            Cache::flush();
        }
    }
}

