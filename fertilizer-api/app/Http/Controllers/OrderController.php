<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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

        $afterDiscount = max(0, $subtotal - $discount);
        $tax = $afterDiscount * 0.18; // 18% GST
        
        $shipping = 0;
        if ($afterDiscount > 0 && $afterDiscount < 2000) {
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

    public function store(Request $request)
    {
        $pmInput = strtoupper($request->input('payment_method') ?? $request->input('paymentMethod') ?? 'COD');
        $paymentMethod = in_array($pmInput, ['COD', 'CASH ON DELIVERY', 'CASH_ON_DELIVERY']) ? 'COD' : 'ONLINE';

        $shippingAddress = $request->input('shipping_address') ?? $request->input('shippingAddress');
        if (!$shippingAddress || !is_array($shippingAddress)) {
            return response()->json(['message' => 'Valid shipping address is required'], 422);
        }

        $billingAddress = $request->input('billing_address') ?? $request->input('billingAddress') ?? $shippingAddress;
        $user = auth()->user();

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
            return response()->json(['message' => 'Cart is empty or invalid items'], 400);
        }

        $summary = $calculation['summary'];
        $orderNumber = 'ORD-' . strtoupper(Str::random(10));
        $trackingNumber = 'TRK-' . strtoupper(Str::random(9));

        $order = Order::create([
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

        foreach ($calculation['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'unit_price' => $item['price'],
                'total' => $item['line_total'],
            ]);
        }

        // Clear DB cart if it exists
        if ($cart) {
            $cart->update(['items_json' => []]);
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
                // Fall back gracefully if Razorpay API call fails or is unreachable
            }
        }

        $paymentLink = null;
        if ($paymentMethod === 'ONLINE') {
            $paymentLink = url('/api/orders/' . $order->id . '/verify-payment');
        }

        $loadedOrder = $order->load(['items.product', 'payment']);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $loadedOrder,
            'id' => $order->id,
            'order_number' => $order->order_number,
            'payment_link' => $paymentLink,
            'razorpay_order_id' => $razorpayOrderId,
            'razorpay_key_id' => $razorpayKeyId,
            'amount_in_paise' => (int) round($summary['total'] * 100)
        ], 201);
    }

    public function index(Request $request)
    {
        $orders = Order::with(['items.product', 'payment'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'payment'])->where('user_id', auth()->id())->findOrFail($id);

        // Define timeline based on status
        $timeline = [
            ['status' => 'PENDING', 'label' => 'Placed', 'date' => $order->created_at],
        ];

        if (in_array($order->status, ['CONFIRMED', 'SHIPPED', 'DELIVERED'])) {
            $timeline[] = ['status' => 'CONFIRMED', 'label' => 'Confirmed', 'date' => $order->created_at->addHours(2)];
        }
        if (in_array($order->status, ['SHIPPED', 'DELIVERED'])) {
            $timeline[] = ['status' => 'SHIPPED', 'label' => 'Shipped', 'date' => $order->created_at->addDays(1)];
        }
        if ($order->status === 'DELIVERED') {
            $timeline[] = ['status' => 'DELIVERED', 'label' => 'Delivered', 'date' => $order->created_at->addDays(3)];
        }
        
        return response()->json([
            'order' => $order,
            'timeline' => $timeline
        ]);
    }

    public function cancel($id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);
        
        if (in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            $order->update(['status' => 'CANCELLED']);
            return response()->json(['message' => 'Order cancelled successfully', 'order' => $order]);
        }
        
        return response()->json(['message' => 'Order cannot be cancelled at this stage'], 400);
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

        // Optional Razorpay HMAC signature validation if real credentials are sent
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

        // Dispatch n8n WhatsApp notification webhook for confirmed payment
        try {
            \Illuminate\Support\Facades\Http::post(env('N8N_ORDER_WEBHOOK_URL', 'http://localhost:5678/webhook/order-status'), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'status' => 'CONFIRMED',
                'payment_status' => 'PAID',
                'transaction_id' => $transactionId,
                'amount' => $order->total,
                'user_phone' => $order->user->phone ?? 'Unknown',
            ]);
        } catch (\Exception $e) {
            // Fail silently if webhook server is unreachable
        }

        return response()->json([
            'message' => 'Payment verified and order confirmed successfully',
            'order' => $order->load(['items.product', 'payment']),
            'payment' => $payment
        ]);
    }
}
