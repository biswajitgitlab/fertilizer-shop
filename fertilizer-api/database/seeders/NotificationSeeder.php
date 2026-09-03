<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $admin = Admin::where('email', 'superadmin@fertilizershop.com')->first() ?? Admin::first();

        if ($users->isEmpty()) {
            return;
        }

        // Farmer Notifications
        $farmerNotifications = [
            [
                'user_index' => 0,
                'type' => 'ORDER_STATUS',
                'title' => 'Order Delivered! 🎉',
                'body' => 'Your order #ORD-2026-1001 containing IFFCO NPK 19:19:19 has been delivered successfully.',
                'link' => '/orders/ORD-2026-1001',
                'data_json' => ['order_number' => 'ORD-2026-1001'],
                'read_at' => now()->subDays(1),
            ],
            [
                'user_index' => 0,
                'type' => 'DIAGNOSIS_REVIEWED',
                'title' => 'Crop Diagnosis Report Ready 🌿',
                'body' => 'Pathologist Dr. Sharma verified your Paddy diagnosis: Bacterial Leaf Blight. View dosage guidelines.',
                'link' => '/krishi-sahayak/diagnoses',
                'data_json' => ['crop' => 'Paddy (Rice)'],
                'read_at' => null,
            ],
            [
                'user_index' => 1,
                'type' => 'KCC_VERIFIED',
                'title' => 'PM-PRANAM KCC Direct Subsidy Verified ✅',
                'body' => 'Your KCC card #KCC-2026-99014 has been biometric verified for Category A Subsidies.',
                'link' => '/account',
                'data_json' => ['kcc_number' => 'KCC-2026-99014'],
                'read_at' => now()->subDays(2),
            ],
        ];

        foreach ($farmerNotifications as $notif) {
            $user = $users[$notif['user_index'] % count($users)];
            unset($notif['user_index']);
            $notif['user_id'] = $user->id;
            Notification::create($notif);
        }

        // Admin Staff Notifications (Role Based Alert)
        $adminNotifications = [
            [
                'admin_id' => $admin?->id,
                'required_permission' => 'orders.fulfill',
                'type' => 'NEW_ORDER_ALERT',
                'title' => 'New Order #ORD-2026-1005 Pending Fulfillment',
                'body' => 'Customer Ramesh Patel placed an order for ₹980.00 requiring warehouse allocation.',
                'link' => '/admin/orders',
                'data_json' => ['order_number' => 'ORD-2026-1005'],
                'read_at' => null,
            ],
            [
                'admin_id' => $admin?->id,
                'required_permission' => 'inventory.manage',
                'type' => 'LOW_STOCK_WARNING',
                'title' => 'Low Stock Warning: Excel Glycel Herbicide',
                'body' => 'Stock quantity for Glycel 41% SL has dropped below 45 units in Zone C.',
                'link' => '/admin/inventory',
                'data_json' => ['product_slug' => 'excel-glycel-41sl-glyphosate-herbicide'],
                'read_at' => null,
            ]
        ];

        foreach ($adminNotifications as $aNotif) {
            Notification::create($aNotif);
        }
    }
}
