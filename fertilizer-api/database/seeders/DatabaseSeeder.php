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

        // 1 Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@fertilizershop.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'is_verified' => true,
            ]
        );
        $admin->assignRole('Admin');

        $this->call([
            ConstantsSeeder::class,
        ]);
    }
}
