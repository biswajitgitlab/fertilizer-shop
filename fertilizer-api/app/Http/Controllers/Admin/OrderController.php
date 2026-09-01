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

        $currentUser = auth()->user();
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
                    $query->whereNotIn('status', ['PENDING', 'CONFIRMED'])
                          ->where(function ($q) use ($currentUser) {
                              $q->where('driver_id', $currentUser->id)
                                ->orWhere(function ($q2) {
                                    $q2->where('status', 'PACKED')->whereNull('driver_id');
                                });
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

            $items = $query->orderByRaw("CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 2 END")
                ->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            $formattedItems = $items->map(function ($order) {
                $customerName = (is_array($order->shipping_address_json) && !empty($order->shipping_address_json['name'])) ? $order->shipping_address_json['name'] : ($order->user ? $order->user->name : 'Valued Customer');
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
                        $earliestBatch = \App\Models\ProductBatch::where('product_id', $item->product_id)->where('stock_qty', '>', 0)->orderBy('expiry_date', 'asc')->first();
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'qty' => $item->qty,
                            'unit_price' => $effectiveUnitPrice,
                            'total_price' => (float)($item->total_price ?: ($effectiveUnitPrice * $item->qty)),
                            'assigned_batch' => $earliestBatch ? $earliestBatch->batch_code : 'AUTO-BATCH',
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
        $currentUser = auth()->user();

        $orderData = Cache::remember("admin_order_{$id}", 300, function () use ($id) {
            $order = Order::with(['user', 'packer', 'driver', 'items.product', 'payment'])
                ->where('id', $id)
                ->orWhere('order_number', $id)
                ->firstOrFail();

            $customerName = (is_array($order->shipping_address_json) && !empty($order->shipping_address_json['name'])) ? $order->shipping_address_json['name'] : ($order->user ? $order->user->name : 'Valued Customer');

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
                    $earliestBatch = \App\Models\ProductBatch::where('product_id', $item->product_id)->where('stock_qty', '>', 0)->orderBy('expiry_date', 'asc')->first();
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'qty' => $item->qty,
                        'unit_price' => $effectiveUnitPrice,
                        'total_price' => (float)($item->total_price ?: ($effectiveUnitPrice * $item->qty)),
                        'assigned_batch' => $earliestBatch ? $earliestBatch->batch_code : 'AUTO-BATCH',
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

        if ($currentUser && method_exists($currentUser, 'hasRole')) {
            if ($currentUser->hasRole('Warehouse Packer')) {
                if ($orderData['packer_id'] !== null && $orderData['packer_id'] !== $currentUser->id) {
                    abort(403, 'Unauthorized access to this order.');
                }
            } else if ($currentUser->hasRole('Logistics Driver')) {
                if (in_array($orderData['status'], ['PENDING', 'CONFIRMED'])) {
                    abort(403, 'Unauthorized access to this order.');
                }
                if ($orderData['driver_id'] !== null && $orderData['driver_id'] !== $currentUser->id) {
                    abort(403, 'Unauthorized access to this order.');
                }
                if ($orderData['driver_id'] === null && $orderData['status'] !== 'PACKED') {
                    abort(403, 'Unauthorized access to this order.');
                }
            }
        }

        return response()->json($orderData);
    }

    public function update(Request $request, $id)
    {
        $currentUserId = auth()->id();

        if ($request->has('status') && is_string($request->status)) {
            $request->merge(['status' => str_replace(' ', '_', strtoupper($request->status))]);
        }

        $request->validate([
            'status' => 'sometimes|in:PENDING,CONFIRMED,PROCESSING,PACKED,READY_FOR_PICKUP,SHIPPED,OUT_FOR_DELIVERY,OUT FOR DELIVERY,DELIVERED,CANCELLED,REFUNDED',
            'packer_id' => 'sometimes|nullable',
            'driver_id' => 'sometimes|nullable',
            'tracking_number' => 'sometimes|nullable|string',
            'cancellation_reason' => 'sometimes|nullable|string',
        ]);

        $newStatus = $request->input('status');

        try {
            $response = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $id, $currentUserId, $newStatus) {
                // 1. Pessimistic Row Lock on Order
                $order = Order::with(['packer', 'driver'])->where('id', $id)->lockForUpdate()->firstOrFail();

                // 2. Packer Concurrency Lock Validation
                $requestedPackerId = $request->input('packer_id');
                $isPackingAction = in_array($newStatus, ['PROCESSING', 'PACKED', 'READY_FOR_PICKUP']) || !is_null($requestedPackerId);

                if ($isPackingAction) {
                    if ($order->packer_id !== null && $order->packer_id != $currentUserId && ($requestedPackerId !== null && $order->packer_id != $requestedPackerId)) {
                        $packerName = $order->packer ? $order->packer->name : "Packer #{$order->packer_id}";
                        return response()->json([
                            'status' => 'error',
                            'conflict' => true,
                            'message' => "Concurrency Conflict: Order #{$order->order_number} is already locked & being packed by {$packerName}."
                        ], 409);
                    }
                }

                // 3. Driver Concurrency & Role Lock Validation
                $requestedDriverId = $request->input('driver_id');
                $isShippingAction = in_array($newStatus, ['SHIPPED', 'OUT_FOR_DELIVERY']) || !is_null($requestedDriverId);

                if ($isShippingAction) {
                    $currentUserModel = auth()->user();
                    $isDriverOrAdmin = $currentUserModel && method_exists($currentUserModel, 'hasRole')
                        ? ($currentUserModel->hasRole('Logistics Driver') || $currentUserModel->hasRole('Super Admin') || $currentUserModel->hasRole('Admin'))
                        : true;

                    if (!$isDriverOrAdmin) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Forbidden: Shipping and dispatching parcels can only be performed by assigned Logistics Drivers.'
                        ], 403);
                    }

                    if ($order->driver_id !== null && $order->driver_id != $currentUserId && ($requestedDriverId !== null && $order->driver_id != $requestedDriverId)) {
                        $driverName = $order->driver ? $order->driver->name : "Driver #{$order->driver_id}";
                        return response()->json([
                            'status' => 'error',
                            'conflict' => true,
                            'message' => "Concurrency Conflict: Order #{$order->order_number} has already been claimed & assigned to driver {$driverName}."
                        ], 409);
                    }
                }

                // 4. Cancellation Logic
                if ($newStatus === 'CANCELLED' && $order->status !== 'CANCELLED') {
                    if (in_array($order->status, ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'])) {
                        return response()->json([
                            'status' => 'error',
                            'message' => "Order #{$order->order_number} has already been shipped/delivered and cannot be cancelled."
                        ], 422);
                    }

                    $reason = $request->input('cancellation_reason') ?? 'Admin initiated cancellation';
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
                                'admin_id' => $currentUserId
                            ]);
                        }
                    }
                } else {
                    if ($request->has('status')) {
                        $order->status = strtoupper($request->status);

                        if (in_array($order->status, ['PROCESSING', 'PACKED', 'READY_FOR_PICKUP'])) {
                            if (!$order->packed_at) {
                                $order->packed_at = now();
                            }
                            if (!$order->packer_id && $currentUserId) {
                                $order->packer_id = $currentUserId;
                            }
                        }
                        
                        if (in_array($order->status, ['SHIPPED', 'OUT_FOR_DELIVERY'])) {
                            if (!$order->shipped_at) {
                                $order->shipped_at = now();
                            }
                            if (!$order->driver_id && $currentUserId) {
                                $order->driver_id = $currentUserId;
                            }
                            if (!$order->tracking_number && $order->status === 'SHIPPED') {
                                $order->tracking_number = 'TRACK-' . strtoupper(\Illuminate\Support\Str::random(8));
                            }
                        }
                        
                        if ($order->status === 'DELIVERED') {
                            $order->delivered_at = now();
                            $order->payment_status = 'PAID';
                        }
                    }
                }

                if ($request->has('packer_id') && $request->packer_id) {
                    $order->packer_id = $request->packer_id;
                    if (in_array($order->status, ['PENDING', 'CONFIRMED'])) {
                        $order->status = 'PROCESSING';
                    }
                    if (!$order->packed_at) {
                        $order->packed_at = now();
                    }
                }

                if ($request->has('driver_id') && $request->driver_id) {
                    $order->driver_id = $request->driver_id;
                    if (in_array($order->status, ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'])) {
                        $order->status = 'OUT_FOR_DELIVERY';
                    }
                    if (!$order->shipped_at) {
                        $order->shipped_at = now();
                    }
                }

                if ($order->isDirty('driver_id') && $order->driver_id) {
                    \App\Models\DriverSettlement::updateOrCreate(
                        ['order_id' => $order->id],
                        [
                            'driver_id' => $order->driver_id,
                            'cash_collected' => (float)$order->total,
                            'status' => $order->status === 'DELIVERED' ? 'SETTLED_TO_BANK' : 'DRIVER_COLLECTION_PENDING',
                            'notes' => "Assigned to driver #{$order->driver_id} for order delivery."
                        ]
                    );
                }

                if ($request->has('tracking_number')) {
                    $order->tracking_number = $request->tracking_number;
                }

                $order->save();
                return $order;
            });

            if ($response instanceof \Illuminate\Http\JsonResponse) {
                return $response;
            }

            $order = $response;
            Cache::forget("admin_order_{$id}");
            Cache::forget("admin_order_{$order->order_number}");
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
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/orders/{id}/claim-packing
     * Atomically lock & claim an order for packing by current packer.
     */
    public function claimPacking(Request $request, $id)
    {
        $currentUserId = auth()->id();

        try {
            $result = \Illuminate\Support\Facades\DB::transaction(function () use ($id, $currentUserId) {
                $order = Order::with('packer')->where('id', $id)->lockForUpdate()->firstOrFail();

                if ($order->packer_id !== null && $order->packer_id != $currentUserId) {
                    $packerName = $order->packer ? $order->packer->name : "Packer #{$order->packer_id}";
                    return response()->json([
                        'status' => 'error',
                        'conflict' => true,
                        'message' => "Order #{$order->order_number} is already locked & being packed by {$packerName}."
                    ], 409);
                }

                $order->packer_id = $currentUserId;
                if (in_array($order->status, ['PENDING', 'CONFIRMED'])) {
                    $order->status = 'PROCESSING';
                }
                $order->packed_at = now();
                $order->save();

                return $order;
            });

            if ($result instanceof \Illuminate\Http\JsonResponse) {
                return $result;
            }

            $this->clearOrderCaches();
            return response()->json(['message' => 'Order packing claimed successfully', 'order' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/orders/{id}/claim-delivery
     * Atomically lock & claim an order for shipping/delivery by current driver.
     */
    public function claimDelivery(Request $request, $id)
    {
        $currentUserId = auth()->id();

        try {
            $result = \Illuminate\Support\Facades\DB::transaction(function () use ($id, $currentUserId) {
                $order = Order::with('driver')->where('id', $id)->lockForUpdate()->firstOrFail();

                if ($order->driver_id !== null && $order->driver_id != $currentUserId) {
                    $driverName = $order->driver ? $order->driver->name : "Driver #{$order->driver_id}";
                    return response()->json([
                        'status' => 'error',
                        'conflict' => true,
                        'message' => "Order #{$order->order_number} is already claimed & assigned to driver {$driverName}."
                    ], 409);
                }

                $order->driver_id = $currentUserId;
                if (in_array($order->status, ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'])) {
                    $order->status = 'OUT_FOR_DELIVERY';
                }
                if (!$order->shipped_at) {
                    $order->shipped_at = now();
                }
                if (!$order->tracking_number) {
                    $order->tracking_number = 'TRACK-' . strtoupper(\Illuminate\Support\Str::random(8));
                }
                $order->save();

                \App\Models\DriverSettlement::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'driver_id' => $order->driver_id,
                        'cash_collected' => (float)$order->total,
                        'status' => 'DRIVER_COLLECTION_PENDING',
                        'notes' => "Claimed by driver #{$currentUserId} for order delivery."
                    ]
                );

                return $order;
            });

            if ($result instanceof \Illuminate\Http\JsonResponse) {
                return $result;
            }

            $this->clearOrderCaches();
            return response()->json(['message' => 'Order delivery claimed successfully', 'order' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'status' => 'required|in:PENDING,CONFIRMED,PROCESSING,PACKED,READY_FOR_PICKUP,SHIPPED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED,REFUNDED'
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
            Cache::flush();
            
            if (config('cache.default') === 'redis') {
                $redis = \Illuminate\Support\Facades\Redis::connection();
                foreach ($redis->keys('*orders*') as $key) {
                    $redis->del($key);
                }
                foreach ($redis->keys('*settlements*') as $key) {
                    $redis->del($key);
                }
                foreach ($redis->keys('*report*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {
            try {
                Cache::flush();
            } catch (\Throwable $ex) {}
        }
    }
}

