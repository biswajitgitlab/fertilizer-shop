<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'PMPRANAM100',
                'type' => 'FIXED',
                'value' => 100.00,
                'min_order' => 500.00,
                'max_uses' => 500,
                'used_count' => 42,
                'expires_at' => now()->addDays(60),
                'is_active' => true,
            ],
            [
                'code' => 'KISAAN50',
                'type' => 'FIXED',
                'value' => 50.00,
                'min_order' => 300.00,
                'max_uses' => 1000,
                'used_count' => 128,
                'expires_at' => now()->addDays(90),
                'is_active' => true,
            ],
            [
                'code' => 'HARVEST10',
                'type' => 'PERCENT',
                'value' => 10.00,
                'min_order' => 1000.00,
                'max_uses' => 200,
                'used_count' => 15,
                'expires_at' => now()->addDays(30),
                'is_active' => true,
            ],
            [
                'code' => 'WELCOME200',
                'type' => 'FIXED',
                'value' => 200.00,
                'min_order' => 1500.00,
                'max_uses' => 300,
                'used_count' => 88,
                'expires_at' => now()->addDays(45),
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(['code' => $coupon['code']], $coupon);
        }
    }
}
