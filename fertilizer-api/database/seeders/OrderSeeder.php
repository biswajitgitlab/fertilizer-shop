<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\DriverSettlement;
use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $users = User::all();
        $packer = Admin::where('role', 'Warehouse Packer')->first() ?? Admin::first();
        $driver = Admin::where('role', 'Logistics Driver')->first() ?? Admin::first();

        if ($products->isEmpty() || $users->isEmpty()) {
            return;
        }

        // Divide products into chunks of 3-4 so every single product is matched to at least 1-2 orders
        $productChunks = $products->chunk(4);

        $orderStatuses = ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING', 'DELIVERED', 'DELIVERED'];
        $paymentMethods = ['COD', 'RAZORPAY', 'UPI', 'COD', 'NET_BANKING', 'COD'];

        $orderIndex = 1001;

        foreach ($productChunks as $chunkIdx => $chunkProducts) {
            $user = $users[$chunkIdx % $users->count()];
            $status = $orderStatuses[$chunkIdx % count($orderStatuses)];
            $paymentMethod = $paymentMethods[$chunkIdx % count($paymentMethods)];
            $isPaid = in_array($status, ['DELIVERED', 'SHIPPED', 'CONFIRMED']);

            $subtotal = 0;
            $itemsData = [];

            foreach ($chunkProducts as $prod) {
                $qty = rand(2, 6);
                $unitPrice = $prod->discount_price > 0 ? $prod->discount_price : $prod->price;
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product' => $prod,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $discount = $chunkIdx % 2 === 0 ? round($subtotal * 0.05, 2) : 0;
            $tax = round(($subtotal - $discount) * 0.05, 2); // 5% GST
            $shippingCost = $subtotal > 1500 ? 0 : 99.00;
            $total = round(($subtotal - $discount) + $tax + $shippingCost, 2);

            $shippingAddress = [
                'name' => $user->name,
                'phone' => $user->phone,
                'address_line' => 'Plot #' . rand(12, 180) . ', Krishi Vikas Farm Mandi Road',
                'city' => Str::after($user->farm_location ?? 'Karnal', ', ') ?: 'Karnal',
                'state' => Str::before($user->farm_location ?? 'Haryana', ',') ?: 'Haryana',
                'pincode' => '132' . sprintf('%03d', rand(1, 99)),
            ];

            $orderNum = 'ORD-2026-' . sprintf('%04d', $orderIndex);

            $order = Order::updateOrCreate(
                ['order_number' => $orderNum],
                [
                    'user_id' => $user->id,
                    'packer_id' => in_array($status, ['SHIPPED', 'DELIVERED']) ? $packer->id : null,
                    'driver_id' => in_array($status, ['SHIPPED', 'DELIVERED']) ? $driver->id : null,
                    'status' => $status,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'coupon_code' => $discount > 0 ? 'KCC500' : null,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'total' => $total,
                    'payment_method' => $paymentMethod,
                    'payment_status' => $isPaid ? 'COMPLETED' : 'PENDING',
                    'shipping_address_json' => $shippingAddress,
                    'billing_address_json' => $shippingAddress,
                    'tracking_number' => 'TRK-IND-' . rand(100000, 999999),
                    'notes' => 'Branch Warehouse Auto-Dispatched under PM-PRANAM scheme.',
                    'packed_at' => in_array($status, ['SHIPPED', 'DELIVERED']) ? now()->subDays(2) : null,
                    'shipped_at' => in_array($status, ['SHIPPED', 'DELIVERED']) ? now()->subDays(1) : null,
                    'delivered_at' => $status === 'DELIVERED' ? now() : null,
                ]
            );

            // Create Order Items & match with Inventory Logs
            foreach ($itemsData as $item) {
                OrderItem::updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'product_id' => $item['product']->id,
                    ],
                    [
                        'qty' => $item['qty'],
                        'unit_price' => $item['unit_price'],
                        'total' => $item['line_total'],
                    ]
                );

                // Fetch matching product batch to display zone info
                $batch = ProductBatch::where('product_id', $item['product']->id)->first();
                $zoneCode = $batch ? $batch->warehouse_zone : 'ZONE-A';

                // Log inventory movement for branch warehouse dispatch
                if (in_array($status, ['SHIPPED', 'DELIVERED', 'CONFIRMED'])) {
                    InventoryLog::create([
                        'product_id' => $item['product']->id,
                        'type' => 'DISPATCH',
                        'qty' => -$item['qty'],
                        'reason' => "Order #{$order->order_number} FEFO auto-deduction from {$zoneCode}",
                        'admin_id' => $packer->id,
                    ]);
                }
            }

            // Create Driver Settlement if COD and shipped/delivered
            if ($paymentMethod === 'COD' && in_array($status, ['SHIPPED', 'DELIVERED'])) {
                DriverSettlement::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'driver_id' => $driver->id,
                        'cash_collected' => $total,
                        'status' => $status === 'DELIVERED' ? 'SETTLED_TO_BANK' : 'DRIVER_COLLECTION_PENDING',
                        'notes' => "COD collection by {$driver->name} for {$order->order_number}",
                    ]
                );
            }

            $orderIndex++;
        }
    }
}
