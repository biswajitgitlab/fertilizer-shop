<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\CropTemplate;

class CropTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            // Wheat
            ['crop_name' => 'Wheat', 'stage_name' => 'Basal', 'days_after_sowing' => 0, 'recommended_products' => 'DAP, Urea', 'qty_per_acre' => 50, 'application_method' => 'Soil Application'],
            ['crop_name' => 'Wheat', 'stage_name' => 'Tillering', 'days_after_sowing' => 25, 'recommended_products' => 'Urea', 'qty_per_acre' => 25, 'application_method' => 'Top Dressing'],
            ['crop_name' => 'Wheat', 'stage_name' => 'Flowering', 'days_after_sowing' => 75, 'recommended_products' => 'NPK (19:19:19)', 'qty_per_acre' => 2, 'application_method' => 'Foliar Spray'],
            ['crop_name' => 'Wheat', 'stage_name' => 'Grain filling', 'days_after_sowing' => 100, 'recommended_products' => 'Micronutrients', 'qty_per_acre' => 1, 'application_method' => 'Foliar Spray'],
            
            // Rice
            ['crop_name' => 'Rice', 'stage_name' => 'Basal', 'days_after_sowing' => 0, 'recommended_products' => 'DAP', 'qty_per_acre' => 40, 'application_method' => 'Soil Application'],
            ['crop_name' => 'Rice', 'stage_name' => 'Tillering', 'days_after_sowing' => 20, 'recommended_products' => 'Urea', 'qty_per_acre' => 30, 'application_method' => 'Top Dressing'],
            ['crop_name' => 'Rice', 'stage_name' => 'Panicle initiation', 'days_after_sowing' => 60, 'recommended_products' => 'NPK (19:19:19)', 'qty_per_acre' => 2, 'application_method' => 'Foliar Spray'],
            ['crop_name' => 'Rice', 'stage_name' => 'Heading', 'days_after_sowing' => 85, 'recommended_products' => 'Micronutrients', 'qty_per_acre' => 1, 'application_method' => 'Foliar Spray'],
            
            // Tomato
            ['crop_name' => 'Tomato', 'stage_name' => 'Basal', 'days_after_sowing' => 0, 'recommended_products' => 'Compost', 'qty_per_acre' => 500, 'application_method' => 'Soil Application'],
            ['crop_name' => 'Tomato', 'stage_name' => 'Flowering', 'days_after_sowing' => 30, 'recommended_products' => 'NPK', 'qty_per_acre' => 25, 'application_method' => 'Top Dressing'],
            ['crop_name' => 'Tomato', 'stage_name' => 'Fruiting', 'days_after_sowing' => 50, 'recommended_products' => 'Calcium', 'qty_per_acre' => 5, 'application_method' => 'Foliar Spray'],
            ['crop_name' => 'Tomato', 'stage_name' => 'Harvest prep', 'days_after_sowing' => 70, 'recommended_products' => 'Potash', 'qty_per_acre' => 20, 'application_method' => 'Top Dressing'],
        ];

        foreach ($templates as $t) {
            CropTemplate::create($t);
        }
    }
}
