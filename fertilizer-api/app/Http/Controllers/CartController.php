<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCart()
    {
        return Cart::firstOrCreate(
            ['user_id' => auth()->id()],
            ['items_json' => []]
        );
    }

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
                if ($bundle && $bundle->discount_percentage) {
                    $price = $price - ($price * ($bundle->discount_percentage / 100));
                }
            }

            $lineTotal = $price * $item['qty'];
            $subtotal += $lineTotal;

            $hydratedItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float)$price,
                'original_price' => (float)($product->price ?? $price),
                'image' => $product->images_json[0] ?? null,
                'images' => $product->images_json ?? [],
                'qty' => $item['qty'],
                'stock' => $product->stock_qty,
                'is_out_of_stock' => $product->stock_qty <= 0,
                'exceeds_stock' => $item['qty'] > $product->stock_qty,
                'line_total' => $lineTotal,
                'bundle_id' => $item['bundle_id'] ?? null,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float)$price,
                    'originalPrice' => (float)($product->price ?? $price),
                    'stock' => $product->stock_qty,
                    'category' => $product->category,
                    'images' => $product->images_json ?? [],
                    'unit' => $product->unit ?? '1 Pack',
                    'rating' => $product->rating ?? 5.0,
                    'reviewsCount' => $product->reviews_count ?? 0,
                    'suitableCrops' => $product->suitable_crops_json ?? [],
                ]
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

    public function index(Request $request)
    {
        $cart = $this->getCart();
        return response()->json($this->calculateCart($cart, $request->query('coupon')));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1',
            'bundle_id' => 'nullable|exists:product_bundles,id'
        ]);

        $cart = $this->getCart();
        $items = $cart->items_json ?? [];
        
        $found = false;
        foreach ($items as &$item) {
            if ($item['product_id'] == $request->product_id && ($item['bundle_id'] ?? null) == $request->bundle_id) {
                $item['qty'] += $request->qty;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $items[] = [
                'product_id' => $request->product_id,
                'qty' => $request->qty,
                'bundle_id' => $request->bundle_id
            ];
        }

        $cart->update(['items_json' => array_values($items)]);

        return response()->json($this->calculateCart($cart, $request->input('coupon')));
    }

    public function updateItem(Request $request, $item_id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1'
        ]);

        $cart = $this->getCart();
        $items = $cart->items_json ?? [];

        foreach ($items as &$item) {
            if ($item['product_id'] == $item_id) {
                $item['qty'] = $request->qty;
                break;
            }
        }

        $cart->update(['items_json' => array_values($items)]);

        return response()->json($this->calculateCart($cart, $request->input('coupon')));
    }

    public function remove($item_id, Request $request)
    {
        $cart = $this->getCart();
        $items = $cart->items_json ?? [];

        $items = array_filter($items, function($item) use ($item_id) {
            return $item['product_id'] != $item_id;
        });

        $cart->update(['items_json' => array_values($items)]);

        return response()->json($this->calculateCart($cart, $request->query('coupon')));
    }

    public function clear()
    {
        $cart = $this->getCart();
        $cart->update(['items_json' => []]);
        return response()->json(['message' => 'Cart cleared']);
    }

    public function applyCoupon(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $coupon = Coupon::where('code', $request->code)
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();
            
        if (!$coupon) {
            return response()->json(['message' => 'Invalid or expired coupon'], 400);
        }

        if ($coupon->is_new_customer_only) {
            $userId = auth()->id() ?? $request->input('user_id');
            if ($userId) {
                $hasPastOrders = \App\Models\Order::where('user_id', $userId)
                    ->whereIn('status', ['CONFIRMED', 'DELIVERED', 'COMPLETED', 'SHIPPED'])
                    ->exists();
                if ($hasPastOrders) {
                    return response()->json([
                        'message' => 'Coupon ' . $coupon->code . ' is valid for first-time buyers with no previous orders.'
                    ], 400);
                }
            }
        }

        $cart = $this->getCart();
        $calculation = $this->calculateCart($cart, $request->code);
        
        if ($calculation['summary']['subtotal'] < $coupon->min_order) {
            return response()->json([
                'message' => 'Minimum order amount of ₹' . $coupon->min_order . ' required for this coupon'
            ], 400);
        }

        return response()->json([
            'message' => 'Coupon applied successfully',
            'cart' => $calculation
        ]);
    }

    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.bundle_id' => 'nullable|exists:product_bundles,id'
        ]);

        $cart = $this->getCart();
        $existingItems = collect($cart->items_json ?? []);
        $newItems = $request->input('items', []);

        foreach ($newItems as $newItem) {
            $bundleId = $newItem['bundle_id'] ?? null;
            $found = $existingItems->first(function ($item) use ($newItem, $bundleId) {
                return $item['product_id'] == $newItem['product_id'] && ($item['bundle_id'] ?? null) == $bundleId;
            });

            if ($found) {
                $existingItems = $existingItems->map(function($item) use ($newItem, $bundleId) {
                    if ($item['product_id'] == $newItem['product_id'] && ($item['bundle_id'] ?? null) == $bundleId) {
                        return [
                            'product_id' => $item['product_id'], 
                            'qty' => max($item['qty'], $newItem['qty']),
                            'bundle_id' => $bundleId
                        ];
                    }
                    return $item;
                });
            } else {
                $existingItems->push([
                    'product_id' => $newItem['product_id'], 
                    'qty' => $newItem['qty'],
                    'bundle_id' => $bundleId
                ]);
            }
        }

        $cart->update(['items_json' => $existingItems->values()->toArray()]);
        return response()->json($this->calculateCart($cart, $request->input('coupon')));
    }

    public function abandoned()
    {
        $carts = Cart::whereNotNull('items_json')
            ->where('updated_at', '<', now()->subHours(2))
            ->get();
        
        $abandoned = $carts->filter(function($cart) {
            return !empty($cart->items_json);
        });
        
        return response()->json($abandoned->values());
    }
}
