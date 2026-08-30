<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CropTemplateSeeder::class,
        ]);

        // 1. Seed Admin in 'admins' table for Staff Portal
        $admin = \App\Models\Admin::firstOrCreate(
            ['email' => 'admin@fertilizershop.com'],
            [
                'name' => 'Admin SarkarFertilizer',
                'phone' => '9999999999',
                'password' => Hash::make('admin123'),
                'role' => 'Super Admin',
                'is_verified' => true,
            ]
        );

        // 2. Seed Customer in 'users' table for Storefront Portal
        User::firstOrCreate(
            ['phone' => '9876543210'],
            [
                'email' => 'ramesh.patel@agri.com',
                'name' => 'Ramesh Patel',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'farm_location' => 'Karnal, Haryana',
                'farm_size_acres' => 12,
                'is_verified' => true,
            ]
        );

        $this->call([
            ConstantsSeeder::class,
        ]);
    }
}
