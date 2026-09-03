<?php

namespace Database\Seeders;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventoryLogSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $user = User::first();

        if ($products->isEmpty() || !$user) {
            return;
        }

        $logsData = [
            [
                'product_slug' => 'iffco-npk-19-19-19-water-soluble',
                'type' => 'IN',
                'qty' => 200,
                'reason' => 'Initial Stocking from IFFCO Plant Dispatch Lot #402',
            ],
            [
                'product_slug' => 'iffco-npk-19-19-19-water-soluble',
                'type' => 'OUT',
                'qty' => 50,
                'reason' => 'Fulfillment for Storefront Orders ORD-2026-1001 & direct counter sale',
            ],
            [
                'product_slug' => 'tatva-vermicompost-bio-organic-granules',
                'type' => 'IN',
                'qty' => 100,
                'reason' => 'Organic Batch Arrival from Tatva Composting Unit',
            ],
            [
                'product_slug' => 'bayer-confidor-200sl-imidacloprid',
                'type' => 'IN',
                'qty' => 80,
                'reason' => 'Stock Refill from Bayer Crop Science Regional Hub',
            ],
            [
                'product_slug' => 'bayer-confidor-200sl-imidacloprid',
                'type' => 'OUT',
                'qty' => 20,
                'reason' => 'Outbreak Emergency Dispatch to Bhatinda Center',
            ],
            [
                'product_slug' => 'pi-saaf-fungicide-carbendazim-mancozeb',
                'type' => 'IN',
                'qty' => 150,
                'reason' => 'Seasonal Blight Preparedness Stock Inward',
            ],
        ];

        foreach ($logsData as $log) {
            $product = $products->firstWhere('slug', $log['product_slug']);
            if ($product) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'type' => $log['type'],
                    'qty' => $log['qty'],
                    'reason' => $log['reason'],
                    'admin_id' => $user->id,
                ]);
            }
        }
    }
}
