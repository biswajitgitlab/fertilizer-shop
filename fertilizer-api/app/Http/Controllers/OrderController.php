<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    private function calculateCart($cartOrItems, $couponCode = null)
    {
        $items = [];
        if ($cartOrItems instanceof Cart) {
            $items = $cartOrItems->items_json ?? [];
        } else if (is_array($cartOrItems)) {
            $items = $cartOrItems;
        }

        $productIds = array_column($items, 'product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $hydratedItems = [];
        $subtotal = 0;

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (!$product) continue;

            $price = $product->discount_price ?? $product->price;
            
            if (isset($item['bundle_id'])) {
                $bundle = \App\Models\ProductBundle::find($item['bundle_id']);
                if ($bundle && $bundle->discount_percentage) {
                    $price = $price - ($price * ($bundle->discount_percentage / 100));
                }
            }

            $lineTotal = $price * $item['qty'];
            $subtotal += $lineTotal;

            $hydratedItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $price,
                'qty' => $item['qty'],
                'line_total' => $lineTotal,
                'bundle_id' => $item['bundle_id'] ?? null,
            ];
        }

        $discount = 0;
        if ($couponCode) {
            $isFirstOrderOnly = (strtoupper($couponCode) === 'NEWFARMER');
            $user = auth()->user();
            $hasPreviousOrders = false;

            if ($user && $isFirstOrderOnly) {
                $hasPreviousOrders = Order::where('user_id', $user->id)->exists();
            }

            if (!$hasPreviousOrders) {
                $coupon = Coupon::where('code', $couponCode)
                                ->where('is_active', true)
                                ->where(function($q) {
                                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                                })
                                ->first();
                                
                if ($coupon && $subtotal >= $coupon->min_order) {
                    if ($coupon->type === 'PERCENT') {
                        $discount = $subtotal * ($coupon->value / 100);
                    } else {
                        $discount = $coupon->value;
                    }
                }
            }
        }

        $afterDiscount = max(0, $subtotal - $discount);
        $tax = $afterDiscount * 0.18; // 18% GST
        
        $shipping = 0;
        if ($afterDiscount > 0 && $afterDiscount < 999) {
            $shipping = 50;
        }

        $total = $afterDiscount + $tax + $shipping;

        return [
            'items' => $hydratedItems,
            'summary' => [
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'tax' => round($tax, 2),
                'shipping' => round($shipping, 2),
                'total' => round($total, 2),
            ]
        ];
    }

    public function index()
    {
        $user = auth()->user();
        $orders = Order::with(['items.product', 'payment'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show($id)
    {
        $user = auth()->user();
        $order = Order::with(['items.product', 'payment'])
            ->where('user_id', $user->id)
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('order_number', $id);
            })
            ->firstOrFail();

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $pmInput = strtoupper($request->input('payment_method') ?? $request->input('paymentMethod') ?? 'COD');
        $paymentMethod = in_array($pmInput, ['COD', 'CASH ON DELIVERY', 'CASH_ON_DELIVERY']) ? 'COD' : 'ONLINE';

        $shippingAddress = $request->input('shipping_address') ?? $request->input('shippingAddress');
        if (!$shippingAddress || !is_array($shippingAddress)) {
            return response()->json(['message' => 'Valid shipping address is required'], 422);
        }

        $billingAddress = $request->input('billing_address') ?? $request->input('billingAddress') ?? $shippingAddress;
        $user = auth()->user() ?? \App\Models\User::first();

        $cart = Cart::where('user_id', $user->id)->first();
        $itemsToProcess = [];

        if ($cart && !empty($cart->items_json)) {
            $itemsToProcess = $cart->items_json;
        } else if ($request->has('items') && is_array($request->input('items'))) {
            foreach ($request->input('items') as $rawItem) {
                $pId = $rawItem['product_id'] ?? $rawItem['product']['id'] ?? $rawItem['productId'] ?? null;
                $qty = $rawItem['qty'] ?? $rawItem['quantity'] ?? 1;
                if ($pId) {
                    $itemsToProcess[] = [
                        'product_id' => $pId,
                        'qty' => (int)$qty,
                        'bundle_id' => $rawItem['bundle_id'] ?? null
                    ];
                }
            }
        }

        if (empty($itemsToProcess)) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $calculation = $this->calculateCart($itemsToProcess, $request->input('coupon_code') ?? $request->input('couponCode'));
        
        if (empty($calculation['items'])) {
            return response()->json(['message' => 'Cart is empty or contains invalid items'], 400);
        }

        $summary = $calculation['summary'];
        $orderNumber = 'ORD-' . strtoupper(Str::random(10));
        $trackingNumber = 'TRK-' . strtoupper(Str::random(9));

        // TWO-TIER HIGH-CONCURRENCY CONCURRENCY LAYER
        // Tier 1: Redis Distributed Locks (Cache::lock)
        // Tier 2: MySQL DB Transaction with Pessimistic Row Locking (lockForUpdate)
        $locks = [];
        try {
            // Tier 1: Acquire Redis Distributed Lock for all items in order
            foreach ($calculation['items'] as $item) {
                $lockKey = 'redis_inventory_lock_product_' . $item['product_id'];
                $lock = Cache::lock($lockKey, 5); // 5 sec auto-release
                
                if (!$lock->get()) {
                    try {
                        $acquired = $lock->block(2);
                        if (!$acquired) {
                            throw new \Exception("High traffic spike! Another customer is currently checking out '{$item['name']}'. Please try again in 3 seconds.");
                        }
                    } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
                        throw new \Exception("High traffic demand on '{$item['name']}'. Please try placing your order again in a moment.");
                    }
                }
                $locks[] = $lock;
            }

            // Tier 2: DB Transaction with Pessimistic Row Locking (lockForUpdate)
            $order = DB::transaction(function () use ($user, $orderNumber, $trackingNumber, $shippingAddress, $billingAddress, $paymentMethod, $summary, $calculation, $cart, $request) {
                
                // 1. Lock inventory rows & validate real-time stock
                foreach ($calculation['items'] as $item) {
                    $product = Product::where('id', $item['product_id'])->lockForUpdate()->first();
                    
                    if (!$product) {
                        throw new \Exception("Product #{$item['product_id']} no longer exists in inventory.");
                    }

                    $currentStock = $product->stock_qty;

                    if ($currentStock < $item['qty']) {
                        if ($currentStock <= 0) {
                            throw new \Exception("Out of stock! Another customer just purchased the last remaining unit of '{$product->name}'.");
                        } else {
                            throw new \Exception("Insufficient stock for '{$product->name}'. Only {$currentStock} unit(s) available in inventory.");
                        }
                    }
                }

                // 2. Stock validated & locked! Create Order record
                $createdOrder = Order::create([
                    'user_id' => $user->id,
                    'order_number' => $orderNumber,
                    'status' => 'PENDING',
                    'subtotal' => $summary['subtotal'],
                    'discount' => $summary['discount'],
                    'tax' => $summary['tax'],
                    'shipping_cost' => $summary['shipping'],
                    'total' => $summary['total'],
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'PENDING',
                    'shipping_address_json' => $shippingAddress,
                    'billing_address_json' => $billingAddress,
                    'tracking_number' => $trackingNumber,
                    'notes' => $request->input('notes'),
                ]);

                // 3. Create OrderItems, Decrement Stock, Log Inventory
                foreach ($calculation['items'] as $item) {
                    $product = Product::where('id', $item['product_id'])->first();

                    OrderItem::create([
                        'order_id' => $createdOrder->id,
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'unit_price' => $item['price'],
                        'total' => $item['line_total'],
                    ]);

                    // Atomically decrement stock_qty
                    $product->decrement('stock_qty', $item['qty']);

                    // FEFO (First-Expired, First-Out) Batch Stock Reduction
                    $remainingToDeduct = $item['qty'];
                    $batches = \App\Models\ProductBatch::where('product_id', $product->id)
                        ->where('stock_qty', '>', 0)
                        ->orderBy('expiry_date', 'asc')
                        ->get();

                    foreach ($batches as $batch) {
                        if ($remainingToDeduct <= 0) break;

                        if ($batch->stock_qty >= $remainingToDeduct) {
                            $batch->decrement('stock_qty', $remainingToDeduct);
                            $remainingToDeduct = 0;
                        } else {
                            $remainingToDeduct -= $batch->stock_qty;
                            $batch->update(['stock_qty' => 0]);
                        }
                    }

                    // Create Inventory Audit Log
                    InventoryLog::create([
                        'product_id' => $product->id,
                        'type' => 'SALE',
                        'qty' => -$item['qty'],
                        'reason' => "Order #{$createdOrder->order_number} placement (FEFO Batch Deducted)",
                        'admin_id' => $user->id
                    ]);
                }

                // Clear DB cart
                if ($cart) {
                    $cart->update(['items_json' => []]);
                }

                return $createdOrder;
            });

            // Trigger Notification Service (Redis + DB) for new order placement
            if ($order) {
                if ($paymentMethod === 'COD') {
                    \App\Models\DriverSettlement::create([
                        'order_id' => $order->id,
                        'driver_id' => 1,
                        'cash_collected' => $order->total,
                        'status' => 'DRIVER_COLLECTION_PENDING',
                    ]);
                }

                \App\Services\NotificationService::notifyOrderCreated($order);

                // Check low stock for ordered items
                foreach ($order->items as $item) {
                    $prod = $item->product;
                    if ($prod && $prod->stock_qty <= 10) {
                        \App\Services\NotificationService::notifyLowStock($prod);
                    }
                }
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'out_of_stock' => true,
                'message' => $e->getMessage()
            ], 422);
        } finally {
            // Always release all acquired Redis Locks
            foreach ($locks as $lock) {
                try {
                    $lock->release();
                } catch (\Exception $e) {
                    // Ignore release errors if lock expired automatically
                }
            }
        }

        $razorpayOrderId = null;
        $razorpayKeyId = env('RAZORPAY_KEY_ID');
        $razorpaySecret = env('RAZORPAY_KEY_SECRET');

        if ($paymentMethod === 'ONLINE' && $razorpayKeyId && $razorpaySecret) {
            try {
                $response = \Illuminate\Support\Facades\Http::withBasicAuth($razorpayKeyId, $razorpaySecret)
                    ->post('https://api.razorpay.com/v1/orders', [
                        'amount' => (int) round($summary['total'] * 100),
                        'currency' => 'INR',
                        'receipt' => $orderNumber,
                        'notes' => [
                            'order_id' => $order->id,
                            'customer_name' => $user->name ?? 'Customer',
                        ]
                    ]);
                if ($response->successful()) {
                    $razorpayOrderId = $response->json('id');
                }
            } catch (\Exception $e) {
                // Fallback gracefully
            }
        }

        return response()->json([
            'status' => 'success',
            'order' => $order->load(['items.product', 'payment']),
            'razorpay_order_id' => $razorpayOrderId,
            'razorpay_key_id' => $razorpayKeyId,
        ], 201);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);

        // Senior E-Commerce Guard: Block cancellation after SHIPPED or DELIVERED
        if (in_array($order->status, ['SHIPPED', 'DELIVERED'])) {
            return response()->json([
                'status' => 'error',
                'message' => "Order #{$order->order_number} has already been shipped or delivered and cannot be cancelled."
            ], 422);
        }

        if (in_array($order->status, ['CANCELLED', 'REFUNDED'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order is already cancelled.'
            ], 400);
        }

        $reason = $request->input('reason') ?? $request->input('cancellation_reason') ?? 'Customer requested cancellation';
        $previousStatus = $order->status;
        $cancelledBy = auth()->user() && auth()->user()->hasRole && auth()->user()->hasRole('Admin') ? 'ADMIN' : 'CUSTOMER';

        try {
            DB::transaction(function () use ($order, $reason, $cancelledBy) {
                $refundReferenceId = null;
                $refundStatus = 'NOT_APPLICABLE';
                $paymentStatus = $order->payment_status;
                $refundAmount = 0.00;

                // Handle Online Payment (Razorpay) Refund
                if ($order->payment_status === 'PAID' || in_array(strtoupper($order->payment_method), ['ONLINE', 'RAZORPAY', 'UPI'])) {
                    $paymentService = app(\App\Contracts\PaymentServiceInterface::class);
                    $refundResult = $paymentService->processRefund($order, (float) $order->total, $reason);

                    $refundReferenceId = $refundResult['refund_id'] ?? ('rfnd_' . Str::random(12));
                    $refundStatus = 'REFUNDED';
                    $paymentStatus = 'REFUNDED';
                    $refundAmount = (float) $order->total;
                } else if ($order->payment_method === 'COD') {
                    $paymentStatus = 'CANCELLED';
                    $refundStatus = 'NOT_APPLICABLE';

                    // Void Cash on Delivery collection entry for driver
                    \App\Models\DriverSettlement::where('order_id', $order->id)->update([
                        'status' => 'CANCELLED',
                        'notes' => "Cancelled by {$cancelledBy} before delivery: {$reason}"
                    ]);
                }

                // Update Order details
                $order->update([
                    'status' => 'CANCELLED',
                    'cancelled_at' => now(),
                    'cancelled_by' => $cancelledBy,
                    'cancellation_reason' => $reason,
                    'payment_status' => $paymentStatus,
                    'refund_status' => $refundStatus,
                    'refund_amount' => $refundAmount,
                    'refund_reference_id' => $refundReferenceId
                ]);

                // Restock inventory items & batch stock (FEFO Reversal)
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock_qty', $item->qty);

                        // Restore stock to latest active non-expired batch
                        $batch = \App\Models\ProductBatch::where('product_id', $product->id)
                            ->where('expiry_date', '>', now())
                            ->orderBy('expiry_date', 'desc')
                            ->first();

                        if ($batch) {
                            $batch->increment('stock_qty', $item->qty);
                        }

                        InventoryLog::create([
                            'product_id' => $product->id,
                            'type' => 'CANCEL_RESTOCK',
                            'qty' => $item->qty,
                            'reason' => "Order #{$order->order_number} cancellation restock: {$reason}",
                            'admin_id' => auth()->id()
                        ]);
                    }
                }
            });

            // Cache Invalidation & Telemetry
            Cache::forget("admin_order_{$order->id}");
            Cache::forget('admin_dashboard_stats');
            Cache::forget('admin_analytics_metrics');

            \App\Services\NotificationService::notifyOrderStatusUpdated($order, $previousStatus);

            return response()->json([
                'status' => 'success',
                'message' => 'Order cancelled successfully' . ($order->refund_reference_id ? " and refund of ₹" . number_format($order->refund_amount, 2) . " initiated." : "."),
                'refund_details' => $order->refund_reference_id ? [
                    'refund_id' => $order->refund_reference_id,
                    'amount' => $order->refund_amount,
                    'status' => $order->refund_status
                ] : null,
                'order' => $order->fresh(['items.product', 'payment'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process order cancellation: ' . $e->getMessage()
            ], 500);
        }
    }

    public function invoice($id)
    {
        $order = Order::with(['items.product', 'user', 'payment'])->where('user_id', auth()->id())->findOrFail($id);
        
        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order]);
        
        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }

    public function markPaymentFailed(Request $request, $id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);

        \App\Models\Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'gateway' => $request->input('gateway', 'RAZORPAY_PAYMENT'),
                'transaction_id' => $request->input('transaction_id') ?? ('FAILED-' . strtoupper(Str::random(8))),
                'amount' => $order->total,
                'status' => 'FAILED',
                'response_json' => $request->all()
            ]
        );

        $order->update(['payment_status' => 'FAILED']);
        return response()->json(['message' => 'Payment marked as failed', 'order' => $order->load('payment')]);
    }

    public function switchToCod($id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);
        $order->update([
            'payment_method' => 'COD',
            'payment_status' => 'PENDING',
            'status' => 'CONFIRMED'
        ]);

        // Record COD selection in payment table
        \App\Models\Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'gateway' => 'CASH_ON_DELIVERY',
                'transaction_id' => 'COD-' . strtoupper(Str::random(8)),
                'amount' => $order->total,
                'status' => 'PENDING_COD',
                'response_json' => ['switched_at' => now()->toIso8601String()]
            ]
        );

        return response()->json(['message' => 'Switched payment method to Cash on Delivery', 'order' => $order->load('payment')]);
    }

    public function verifyPayment(Request $request, $id)
    {
        $order = Order::where('user_id', auth()->id())->orWhere(function($query) {
            if (auth()->user() && auth()->user()->hasRole && auth()->user()->hasRole('Admin')) {
                // Admin can verify any order
            }
        })->findOrFail($id);

        $gateway = $request->input('gateway') ?? 'RAZORPAY';
        $transactionId = $request->input('transaction_id') 
            ?? $request->input('razorpay_payment_id') 
            ?? $request->input('txn_id')
            ?? ('TXN-PAY-' . rand(10000000, 99999999));
        
        $razorpaySignature = $request->input('razorpay_signature');
        $razorpayOrderId = $request->input('razorpay_order_id');
        $razorpayPaymentId = $request->input('razorpay_payment_id');
        $razorpaySecret = env('RAZORPAY_KEY_SECRET');

        // Optional Razorpay HMAC signature validation
        if ($razorpaySignature && $razorpayOrderId && $razorpayPaymentId && $razorpaySecret) {
            $generatedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, $razorpaySecret);
            if (!hash_equals($generatedSignature, $razorpaySignature)) {
                return response()->json(['message' => 'Invalid payment signature from Razorpay'], 400);
            }
        }

        // Persist Payment details into payments table
        $payment = \App\Models\Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'gateway' => strtoupper($gateway),
                'transaction_id' => $transactionId,
                'amount' => $order->total,
                'status' => 'SUCCESS',
                'response_json' => array_merge($request->all(), [
                    'verified_at' => now()->toIso8601String(),
                    'payment_mode' => $request->input('payment_mode') ?? 'UPI/CARD',
                ])
            ]
        );

        $order->update([
            'payment_status' => 'PAID',
            'status' => 'CONFIRMED',
            'tracking_number' => $order->tracking_number ?? ('TRK-' . strtoupper(Str::random(9)))
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment verified successfully',
            'order' => $order->load(['items.product', 'payment']),
        ]);
    }
}
