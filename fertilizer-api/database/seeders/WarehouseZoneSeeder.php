<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WarehouseZone;

class WarehouseZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['code' => 'ZONE-A', 'name' => 'Granular Fertilizer Storage Bay A', 'category_type' => 'Chemical Fertilizers', 'temperature_controlled' => false, 'capacity_units' => 5000],
            ['code' => 'ZONE-B', 'name' => 'Bio-Tech & Organic Vault B', 'category_type' => 'Organic & Bio-Fertilizers', 'temperature_controlled' => true, 'capacity_units' => 3000],
            ['code' => 'ZONE-C', 'name' => 'Liquid Crop Spray Rack C', 'category_type' => 'Insecticides & Pesticides', 'temperature_controlled' => false, 'capacity_units' => 4500],
            ['code' => 'ZONE-D', 'name' => 'Micronutrient & Seed Vault D', 'category_type' => 'Micronutrients & Seeds', 'temperature_controlled' => true, 'capacity_units' => 2000],
        ];

        foreach ($zones as $z) {
            WarehouseZone::updateOrCreate(['code' => $z['code']], $z);
        }
    }
}
