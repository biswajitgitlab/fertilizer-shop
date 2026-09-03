<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductBundle;
use Illuminate\Database\Seeder;

class ProductBundleSeeder extends Seeder
{
    public function run(): void
    {
        $bundlesData = [
            [
                'name' => 'Paddy High-Yield Booster Kit',
                'slug' => 'paddy-high-yield-booster-kit',
                'description' => 'Complete solution for Paddy farmers featuring Basmati 1121 seeds, NPK 19:19:19 soluble fertilizer, and Chelated Zinc for Khaira disease protection.',
                'image_url' => 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
                'price' => 1290.00,
                'discount_percentage' => 15,
                'is_active' => true,
                'products' => [
                    'nuziveedu-pusa-basmati-1121-paddy-seeds' => 1,
                    'iffco-npk-19-19-19-water-soluble' => 1,
                    'aries-chelated-zinc-edta-12-micronutrient' => 1,
                ]
            ],
            [
                'name' => 'Bio-Organic Soil Health Pack',
                'slug' => 'bio-organic-soil-health-pack',
                'description' => 'Combines Vermicompost Granules, Humic Acid 98%, and Seaweed Kelp Booster for complete organic soil enrichment and microbial activation.',
                'image_url' => 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
                'price' => 1180.00,
                'discount_percentage' => 12,
                'is_active' => true,
                'products' => [
                    'tatva-vermicompost-bio-organic-granules' => 1,
                    'humic-acid-98-bio-organic-granules' => 1,
                    'biovita-seaweed-kelp-plant-growth-booster' => 1,
                ]
            ],
            [
                'name' => 'Complete Crop Protection Combo',
                'slug' => 'complete-crop-protection-combo',
                'description' => 'All-in-one disease & pest shield featuring Bayer Confidor Insecticide, PI Saaf Fungicide, and Bio-Neem Oil.',
                'image_url' => 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop&q=80',
                'price' => 990.00,
                'discount_percentage' => 10,
                'is_active' => true,
                'products' => [
                    'bayer-confidor-200sl-imidacloprid' => 1,
                    'pi-saaf-fungicide-carbendazim-mancozeb' => 1,
                    'bio-neem-oil-10000-ppm-insecticide' => 1,
                ]
            ],
        ];

        foreach ($bundlesData as $bundleInfo) {
            $productMap = $bundleInfo['products'];
            unset($bundleInfo['products']);

            $bundle = ProductBundle::updateOrCreate(
                ['slug' => $bundleInfo['slug']],
                $bundleInfo
            );

            $attachData = [];
            foreach ($productMap as $productSlug => $qty) {
                $product = Product::where('slug', $productSlug)->first();
                if ($product) {
                    $attachData[$product->id] = ['quantity' => $qty];
                }
            }

            if (!empty($attachData)) {
                $bundle->products()->sync($attachData);
            }
        }
    }
}
