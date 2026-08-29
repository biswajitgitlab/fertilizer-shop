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
    private function calculateCart(Cart $cart, $couponCode = null)
    {
        $items = $cart->items_json ?? [];
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
                if ($bundle) {
                    if ($bundle->discount_percentage) {
                        $price = $price - ($price * ($bundle->discount_percentage / 100));
                    }
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
        $request->validate([
            'shipping_address' => 'required|array',
            'billing_address' => 'nullable|array',
            'payment_method' => 'required|in:COD,ONLINE',
            'coupon_code' => 'nullable|string'
        ]);

        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || empty($cart->items_json)) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $calculation = $this->calculateCart($cart, $request->coupon_code);
        
        if (empty($calculation['items'])) {
            return response()->json(['message' => 'Cart is empty or invalid items'], 400);
        }

        $summary = $calculation['summary'];
        $orderNumber = 'ORD-' . strtoupper(Str::random(10));

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => $orderNumber,
            'status' => 'PENDING',
            'subtotal' => $summary['subtotal'],
            'discount' => $summary['discount'],
            'tax' => $summary['tax'],
            'shipping_cost' => $summary['shipping'],
            'total' => $summary['total'],
            'payment_method' => $request->payment_method,
            'payment_status' => 'PENDING',
            'shipping_address_json' => $request->shipping_address,
            'billing_address_json' => $request->billing_address ?? $request->shipping_address,
            'notes' => $request->notes,
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

        // Clear cart
        $cart->update(['items_json' => []]);

        $paymentLink = null;
        if ($request->payment_method === 'ONLINE') {
            // Mock payment link generation
            $paymentLink = url('/api/webhooks/payment/mock?order_id=' . $order->id);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('items'),
            'payment_link' => $paymentLink
        ], 201);
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['items.product'])->where('user_id', auth()->id())->findOrFail($id);
        
        // Define timeline based on status
        $timeline = [
            ['status' => 'PENDING', 'label' => 'Placed', 'date' => $order->created_at],
        ];

        // Add dummy logic for timeline progression
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
        $order = Order::with(['items.product', 'user'])->where('user_id', auth()->id())->findOrFail($id);
        
        // Create a simple PDF view (assuming resources/views/pdf/invoice.blade.php exists, if not we will create it)
        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order]);
        
        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }
}
