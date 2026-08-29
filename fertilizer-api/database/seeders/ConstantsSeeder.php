<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConstantsSeeder extends Seeder
{
    public function run(): void
    {
        // Verified 200 OK bright agricultural photos matching each category
        $categories = [
            [
                'name' => 'Chemical Fertilizers',
                'slug' => 'chemical-fertilizers',
                'icon' => 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Organic & Bio-Fertilizers',
                'slug' => 'organic-bio-fertilizers',
                'icon' => 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Insecticides',
                'slug' => 'insecticides',
                'icon' => 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Herbicides & Weedicides',
                'slug' => 'herbicides',
                'icon' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Fungicides & Pesticides',
                'slug' => 'pesticides',
                'icon' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Plant Growth Vitamins & Bio-Stimulants',
                'slug' => 'vitamins-bio-stimulants',
                'icon' => 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Micronutrients & Zinc',
                'slug' => 'micronutrients',
                'icon' => 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
            ],
            [
                'name' => 'Seeds & Farm Tools',
                'slug' => 'seeds-tools',
                'icon' => 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($categories as $index => $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], [
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'sort_order' => $index,
            ]);
        }

        $products = [
            [
                'name' => 'IFFCO NPK 19:19:19 Fully Water Soluble Fertilizer',
                'slug' => 'iffco-npk-19-19-19-water-soluble',
                'category_slug' => 'chemical-fertilizers',
                'price' => 320,
                'discount_price' => 400,
                'unit' => '1 kg',
                'stock_qty' => 150,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 19, 'p' => 19, 'k' => 19],
                'suitable_crops_json' => ["Rice", "Wheat", "Tomato", "Cotton", "Sugarcane", "Potato"],
                'short_desc' => 'Premium balanced NPK for vegetative growth, flowering, and root strength. 100% water-soluble.',
                'description' => 'IFFCO NPK 19:19:19 is a fully water-soluble, balanced fertilizer that provides Nitrogen, Phosphorus, and Potassium in equal parts. Ideal for foliar spray and drip irrigation. Accelerates root development, enhances chlorophyll production, and maximizes grain and fruit formation. Government-approved formulation certified by Fertilizer Control Order (FCO).',
                'usage_instructions' => 'Dissolve 5g per liter of water. Apply via foliar spray in early morning or late evening every 12-15 days during vegetative and flowering stage. For drip irrigation, use 3-4 kg per acre per application.',
            ],
            [
                'name' => 'Tatva Pure Vermicompost Bio-Organic Granules',
                'slug' => 'tatva-vermicompost-bio-organic-granules',
                'category_slug' => 'organic-bio-fertilizers',
                'price' => 450,
                'discount_price' => 550,
                'unit' => '25 kg Bag',
                'stock_qty' => 85,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 3, 'p' => 2, 'k' => 2],
                'suitable_crops_json' => ["Vegetables", "Paddy", "Wheat", "Maize", "Pulses", "Fruits"],
                'short_desc' => 'Enriched with earthworm castings, mycorrhiza, and soil beneficial microbes. 100% organic.',
                'description' => 'Pure organic vermicompost processed from cow dung, crop residue, and botanical wastes through controlled earthworm composting. Rich in humic acid, fulvic acid, beneficial bacteria (Azotobacter, PSB), and growth hormones. Restores natural soil fertility, retains moisture for 30% longer, and eliminates need for chemical fertilizers by up to 40%.',
                'usage_instructions' => 'Apply 200-250 kg per acre during soil preparation as basal dose. For top dressing, apply 50-75 kg near root zone after irrigation. Mix with 10x soil volume before transplanting.',
            ],
            [
                'name' => 'Bayer Confidor 200 SL Insecticide (Imidacloprid)',
                'slug' => 'bayer-confidor-200sl-imidacloprid',
                'category_slug' => 'insecticides',
                'price' => 380,
                'discount_price' => 450,
                'unit' => '250 ml',
                'stock_qty' => 60,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 0, 'p' => 0, 'k' => 0],
                'suitable_crops_json' => ["Cotton", "Paddy", "Chilli", "Tomato", "Okra", "Mango"],
                'short_desc' => 'Systemic chloro-nicotinyl insecticide. Highly effective against sucking pests — aphids, whitefly, thrips, jassids.',
                'description' => 'Bayer Confidor 200 SL contains Imidacloprid 17.8% SL — a systemic neonicotinoid insecticide that interferes with nerve signal transmission in sucking pests. Rapidly absorbed through roots and leaves, providing long-lasting (up to 3-4 weeks) protection. Registered under CIB & RC. Controls BPH (Brown Plant Hopper) in paddy effectively.',
                'usage_instructions' => 'Mix 0.5-1 ml per liter of water for foliar spray. For soil drench, use 2ml per liter near root zone. Apply at first sighting of pest. Do not mix with alkaline pesticides. Re-entry interval: 24 hours.',
            ],
            [
                'name' => 'Excel Glycel 41% SL Glyphosate Systemic Herbicide',
                'slug' => 'excel-glycel-41sl-glyphosate-herbicide',
                'category_slug' => 'herbicides',
                'price' => 520,
                'discount_price' => 620,
                'unit' => '1 Litre',
                'stock_qty' => 40,
                'is_featured' => false,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 0, 'p' => 0, 'k' => 0],
                'suitable_crops_json' => ["Tea", "Sugarcane", "Non-crop weed management", "Orchards"],
                'short_desc' => 'Non-selective, broad-spectrum systemic herbicide for controlling annual and perennial weeds.',
                'description' => 'Excel Glycel 41% SL (Glyphosate IPA salt 41%) is a post-emergent non-selective herbicide that is translocated from foliage through phloem into the root system to eliminate stubborn broadleaf weeds and grassy weeds completely. Does not leave residual soil activity, making it safe for use before new crop planting. Approved by Ministry of Agriculture for controlled weed management.',
                'usage_instructions' => 'Spray 8-10 ml per liter of water directly on actively growing weed foliage on a calm, dry day. Avoid contact with desired crop. Do not spray if rain is expected within 6 hours. Use flat fan nozzle for even coverage.',
            ],
            [
                'name' => 'PI Industries Saaf Fungicide (Carbendazim 12% + Mancozeb 63% WP)',
                'slug' => 'pi-saaf-fungicide-carbendazim-mancozeb',
                'category_slug' => 'pesticides',
                'price' => 290,
                'discount_price' => 350,
                'unit' => '500 g',
                'stock_qty' => 120,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 0, 'p' => 0, 'k' => 0],
                'suitable_crops_json' => ["Potato", "Tomato", "Grape", "Paddy", "Groundnut", "Apple"],
                'short_desc' => 'Dual-action systemic + contact fungicide. Controls blast, blight, leaf spot, and powdery mildew.',
                'description' => 'PI Industries Saaf is a unique combination fungicide containing Carbendazim 12% (systemic action) and Mancozeb 63% (contact action). The dual mode of action provides complete preventive and curative control against blast (Pyricularia), blight (Alternaria, Phytophthora), leaf spot, and powdery mildew across 35+ crops. Approved by CIB & RC. Resistance management product.',
                'usage_instructions' => 'Mix 2g per liter of water. Spray at 10-day intervals during humid weather or at first disease appearance. Apply 3-4 sprays per season. Avoid application during rain or strong winds. PHI: 5-7 days.',
            ],
            [
                'name' => 'Bio-Vita Seaweed Kelp Plant Growth Booster & Amino Tonic',
                'slug' => 'biovita-seaweed-kelp-plant-growth-booster',
                'category_slug' => 'vitamins-bio-stimulants',
                'price' => 490,
                'discount_price' => 600,
                'unit' => '500 ml',
                'stock_qty' => 75,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 5, 'p' => 2, 'k' => 5],
                'suitable_crops_json' => ["Cotton", "Chilli", "Onion", "Banana", "Wheat", "Paddy", "Vegetables"],
                'short_desc' => 'Natural seaweed kelp extract with Vitamin B-complex, gibberellins, cytokinins, and amino acids.',
                'description' => 'Bio-Vita is a concentrated bio-stimulant derived from Ascophyllum nodosum (cold-pressed seaweed). Rich in natural cytokinins, auxins, gibberellins, mannitol, betaine, and 18 amino acids. Boosts photosynthesis efficiency by 25%, prevents flower drop, improves fruit setting, and increases stress tolerance against drought, frost, and salinity. Compatible with all pesticides and fertilizers.',
                'usage_instructions' => 'Foliar spray: Mix 2ml per liter of water. Apply at branching (30 days), pre-flowering, and fruit formation stages. For drip irrigation, use 500ml per acre diluted in 200 liters. 3-4 applications per crop cycle recommended.',
            ],
            [
                'name' => 'Aries Chelated Zinc EDTA 12% Micronutrient Fertilizer',
                'slug' => 'aries-chelated-zinc-edta-12-micronutrient',
                'category_slug' => 'micronutrients',
                'price' => 260,
                'discount_price' => 320,
                'unit' => '500 g',
                'stock_qty' => 95,
                'is_featured' => false,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 0, 'p' => 0, 'k' => 0],
                'suitable_crops_json' => ["Rice", "Paddy", "Corn", "Citrus", "Sugarcane", "Wheat"],
                'short_desc' => 'Fast-absorbing 12% Chelated Zinc (EDTA). Prevents Khaira disease in paddy and leaf whitening in maize.',
                'description' => 'Aries Chelated Zinc EDTA 12% is a highly stable, fully water-soluble zinc supplement that remains bioavailable across all soil pH levels (4.5 to 9.0). Unlike zinc sulphate, EDTA chelation prevents ion lock-up in alkaline and saline soils. Corrects zinc deficiency symptoms (interveinal chlorosis, stunted growth, Khaira disease) within 5-7 days of application.',
                'usage_instructions' => 'Foliar spray: Mix 1g per liter of water. Apply 2-3 sprays at 15-day intervals starting at vegetative stage. Soil application: 500g per acre mixed with 25 kg farmyard manure. Do not mix with phosphatic fertilizers.',
            ],
            [
                'name' => 'NUZIVEEDU Hybrid Pusa Basmati 1121 Paddy Seeds (Certified)',
                'slug' => 'nuziveedu-pusa-basmati-1121-paddy-seeds',
                'category_slug' => 'seeds-tools',
                'price' => 850,
                'discount_price' => 990,
                'unit' => '5 kg Bag',
                'stock_qty' => 50,
                'is_featured' => true,
                'is_active' => true,
                'images_json' => [
                    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
                ],
                'composition_json' => ['n' => 0, 'p' => 0, 'k' => 0],
                'suitable_crops_json' => ["Paddy"],
                'short_desc' => 'Government-certified Pusa Basmati 1121. 7mm+ extra-long grain, high yield (50-55 qtl/acre), blast resistant.',
                'description' => 'NUZIVEEDU Pusa Basmati 1121 is a certified high-yielding aromatic paddy variety bred by IARI (Indian Agricultural Research Institute). Grain elongates 2.5x on cooking (7mm raw to 18mm cooked). Features: BLB & blast resistant, 135-140 day crop duration, suitability for transplanting or direct seeding, proven yield of 50-55 qtl/acre under optimal conditions. Seed lot treated with Thiram 75% WS @ 2.5g/kg.',
                'usage_instructions' => 'Pre-soak seeds in water mixed with Carbendazim 1g/liter for 24 hours before sowing in nursery. Seed rate: 20-25 kg/acre for transplanting, 30-35 kg/acre for direct seeding. Transplant 25-30 day old seedlings at 20x15 cm spacing. Maintain 5cm standing water for first 20 days.',
            ],
        ];

        foreach ($products as $prod) {
            $catSlug = $prod['category_slug'];
            unset($prod['category_slug']);
            $category = Category::where('slug', $catSlug)->first();
            if ($category) {
                $prod['category_id'] = $category->id;
            }
            Product::updateOrCreate(['slug' => $prod['slug']], $prod);
        }
    }
}
