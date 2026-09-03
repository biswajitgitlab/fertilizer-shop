<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        if ($users->isEmpty() || $products->isEmpty()) {
            return;
        }

        $packerAdmin = Admin::where('role', 'Warehouse Packer')->first() ?? Admin::where('email', 'warehouse@fertilizershop.com')->first() ?? Admin::first();
        $driverAdmin = Admin::where('role', 'Logistics Driver')->first() ?? Admin::where('email', 'driver@fertilizershop.com')->first() ?? Admin::first();

        $ordersSample = [
            [
                'order_number' => 'ORD-2026-1001',
                'user_index' => 0,
                'status' => 'DELIVERED',
                'payment_method' => 'COD',
                'payment_status' => 'PAID',
                'coupon_code' => 'PMPRANAM100',
                'discount' => 100.00,
                'notes' => 'Deliver near Karnal Grain Market warehouse door 2',
                'packer_id' => $packerAdmin?->id,
                'driver_id' => $driverAdmin?->id,
                'packed_at' => now()->subDays(4),
                'shipped_at' => now()->subDays(3),
                'delivered_at' => now()->subDays(2),
                'items' => [
                    ['product_index' => 0, 'qty' => 2], // NPK 19:19:19 @ 320 = 640
                    ['product_index' => 1, 'qty' => 1], // Vermicompost @ 450 = 450
                ],
            ],
            [
                'order_number' => 'ORD-2026-1002',
                'user_index' => 1,
                'status' => 'DELIVERED',
                'payment_method' => 'CASH_ON_DELIVERY',
                'payment_status' => 'PAID',
                'coupon_code' => 'KISAAN50',
                'discount' => 50.00,
                'notes' => 'Call farmer before arrival at Burdwan Agri Farm',
                'packer_id' => $packerAdmin?->id,
                'driver_id' => $driverAdmin?->id,
                'packed_at' => now()->subDays(3),
                'shipped_at' => now()->subDays(2),
                'delivered_at' => now()->subDays(1),
                'items' => [
                    ['product_index' => 2, 'qty' => 1], // Bayer Confidor @ 380
                    ['product_index' => 4, 'qty' => 2], // PI Saaf @ 290 = 580
                ],
            ],
            [
                'order_number' => 'ORD-2026-1003',
                'user_index' => 2,
                'status' => 'SHIPPED',
                'payment_method' => 'UPI',
                'payment_status' => 'PAID',
                'coupon_code' => null,
                'discount' => 0.00,
                'notes' => 'Express dispatch for insect outbreak',
                'packer_id' => $packerAdmin?->id,
                'driver_id' => $driverAdmin?->id,
                'packed_at' => now()->subDays(1),
                'shipped_at' => now()->subHours(12),
                'delivered_at' => null,
                'items' => [
                    ['product_index' => 7, 'qty' => 1], // Pusa Basmati Seeds @ 850
                    ['product_index' => 6, 'qty' => 2], // Chelated Zinc @ 260 = 520
                ],
            ],
            [
                'order_number' => 'ORD-2026-1004',
                'user_index' => 3,
                'status' => 'CONFIRMED',
                'payment_method' => 'RAZORPAY',
                'payment_status' => 'PAID',
                'coupon_code' => 'WELCOME200',
                'discount' => 200.00,
                'notes' => 'PM-PRANAM Subsidized order verification attached',
                'packer_id' => $packerAdmin?->id,
                'driver_id' => null,
                'packed_at' => now()->subHours(4),
                'shipped_at' => null,
                'delivered_at' => null,
                'items' => [
                    ['product_index' => 8, 'qty' => 5], // Neem Coated Urea @ 266 = 1330
                    ['product_index' => 9, 'qty' => 1], // DAP @ 1350 = 1350
                ],
            ],
            [
                'order_number' => 'ORD-2026-1005',
                'user_index' => 4,
                'status' => 'PENDING',
                'payment_method' => 'COD',
                'payment_status' => 'PENDING',
                'coupon_code' => null,
                'discount' => 0.00,
                'notes' => 'New order awaiting warehouse confirmation',
                'packer_id' => null,
                'driver_id' => null,
                'packed_at' => null,
                'shipped_at' => null,
                'delivered_at' => null,
                'items' => [
                    ['product_index' => 5, 'qty' => 2], // Bio-Vita Seaweed @ 490 = 980
                ],
            ],
            [
                'order_number' => 'ORD-2026-1006',
                'user_index' => 5,
                'status' => 'CANCELLED',
                'payment_method' => 'COD',
                'payment_status' => 'CANCELLED',
                'coupon_code' => null,
                'discount' => 0.00,
                'notes' => 'Cancelled by customer due to double order',
                'packer_id' => null,
                'driver_id' => null,
                'packed_at' => null,
                'shipped_at' => null,
                'delivered_at' => null,
                'items' => [
                    ['product_index' => 3, 'qty' => 1], // Glycel Herbicide @ 520
                ],
            ],
        ];

        foreach ($ordersSample as $orderData) {
            $user = $users[$orderData['user_index'] % count($users)];

            // Calculate totals
            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($orderData['items'] as $itemData) {
                $product = $products[$itemData['product_index'] % count($products)];
                $unitPrice = $product->price;
                $lineTotal = $unitPrice * $itemData['qty'];
                $subtotal += $lineTotal;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'qty' => $itemData['qty'],
                    'unit_price' => $unitPrice,
                    'total' => $lineTotal,
                ];
            }

            $discount = $orderData['discount'];
            $shippingCost = $subtotal > 1000 ? 0.00 : 50.00;
            $tax = round(($subtotal - $discount) * 0.05, 2); // 5% GST on fertilizers
            if ($tax < 0) $tax = 0;
            $total = max(0, $subtotal - $discount + $shippingCost + $tax);

            $shippingAddress = [
                'name' => $user->name,
                'phone' => $user->phone,
                'address_line' => $user->farm_location ?? 'Village Farm Sector 4',
                'city' => explode(',', $user->farm_location ?? 'District HQ')[0],
                'state' => 'Haryana',
                'pincode' => '132001',
            ];

            $order = Order::updateOrCreate(
                ['order_number' => $orderData['order_number']],
                [
                    'user_id' => $user->id,
                    'packer_id' => $orderData['packer_id'],
                    'driver_id' => $orderData['driver_id'],
                    'status' => $orderData['status'],
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'coupon_code' => $orderData['coupon_code'],
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'total' => $total,
                    'payment_method' => $orderData['payment_method'],
                    'payment_status' => $orderData['payment_status'],
                    'shipping_address_json' => $shippingAddress,
                    'billing_address_json' => $shippingAddress,
                    'tracking_number' => 'TRK-' . strtoupper(substr(md5($orderData['order_number']), 0, 10)),
                    'notes' => $orderData['notes'],
                    'packed_at' => $orderData['packed_at'],
                    'shipped_at' => $orderData['shipped_at'],
                    'delivered_at' => $orderData['delivered_at'],
                    'cancelled_at' => $orderData['status'] === 'CANCELLED' ? now()->subDays(1) : null,
                    'cancelled_by' => $orderData['status'] === 'CANCELLED' ? 'CUSTOMER' : null,
                    'cancellation_reason' => $orderData['status'] === 'CANCELLED' ? 'Duplicate order' : null,
                ]
            );

            // Seed order items
            $order->items()->delete();
            foreach ($itemsToCreate as $item) {
                $order->items()->create($item);
            }

            // Seed payment if paid
            if ($orderData['payment_status'] === 'PAID') {
                Payment::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'gateway' => $orderData['payment_method'],
                        'transaction_id' => 'TXN-' . strtoupper(substr(md5($order->id . time()), 0, 12)),
                        'amount' => $total,
                        'status' => 'SUCCESS',
                        'response_json' => ['code' => '200', 'status' => 'SUCCESS', 'gateway' => $orderData['payment_method']],
                    ]
                );
            }
        }
    }
}
