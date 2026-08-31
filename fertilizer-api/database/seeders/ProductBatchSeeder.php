<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductBatch;

class ProductBatchSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $zones = ['ZONE-A', 'ZONE-B', 'ZONE-C', 'ZONE-D'];

        foreach ($products as $p) {
            $hasBatch = ProductBatch::where('product_id', $p->id)->exists();
            if (!$hasBatch) {
                $zone = $zones[$p->id % count($zones)];
                $slugPart = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $p->name), 0, 4));
                ProductBatch::create([
                    'product_id' => $p->id,
                    'batch_code' => 'LOT-2026-' . sprintf('%03d', $p->id) . '-' . ($slugPart ?: 'AGRI'),
                    'manufactured_date' => now()->subMonths(rand(1, 3))->format('Y-m-d'),
                    'expiry_date' => now()->addMonths(rand(8, 20))->format('Y-m-d'),
                    'moisture_pct' => round(rand(140, 320) / 100, 2),
                    'stock_qty' => $p->stock_qty > 0 ? $p->stock_qty : 150,
                    'warehouse_zone' => $zone,
                    'status' => 'SAFE',
                ]);
            }
        }
    }
}
