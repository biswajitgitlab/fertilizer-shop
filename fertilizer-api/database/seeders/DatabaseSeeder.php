<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

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

        // 1. Seed Demo Staff & Admin users in 'admins' table for Staff Portal
        $demoAdmins = [
            [
                'email' => 'superadmin@fertilizershop.com',
                'name' => 'Super Admin (Executive)',
                'phone' => '9999999999',
                'password' => Hash::make('admin123'),
                'role' => 'Super Admin',
                'is_verified' => true,
            ],
            [
                'email' => 'admin@fertilizershop.com',
                'name' => 'Admin SarkarFertilizer',
                'phone' => '9888888888',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'is_verified' => true,
            ],
            [
                'email' => 'store.manager@fertilizershop.com',
                'name' => 'Vikram Singh (Store Manager)',
                'phone' => '9777777777',
                'password' => Hash::make('staff123'),
                'role' => 'Store Manager',
                'is_verified' => true,
            ],
            [
                'email' => 'support@fertilizershop.com',
                'name' => 'Ananya Sharma (Customer Support)',
                'phone' => '9666666666',
                'password' => Hash::make('staff123'),
                'role' => 'Customer Support',
                'is_verified' => true,
            ],
            [
                'email' => 'warehouse@fertilizershop.com',
                'name' => 'Rajesh Kumar (Warehouse)',
                'phone' => '9555555555',
                'password' => Hash::make('staff123'),
                'role' => 'Warehouse Manager',
                'is_verified' => true,
            ],
            [
                'email' => 'field.officer@fertilizershop.com',
                'name' => 'Priya Verma (Field Officer)',
                'phone' => '9444444444',
                'password' => Hash::make('staff123'),
                'role' => 'Field Officer',
                'is_verified' => true,
            ],
            [
                'email' => 'staff@fertilizershop.com',
                'name' => 'Amit Das (General Staff)',
                'phone' => '9333333333',
                'password' => Hash::make('staff123'),
                'role' => 'Staff',
                'is_verified' => true,
            ],
        ];

        foreach ($demoAdmins as $adminData) {
            $admin = Admin::where('email', $adminData['email'])
                ->orWhere('phone', $adminData['phone'])
                ->first();
            if ($admin) {
                $admin->update($adminData);
            } else {
                $admin = Admin::create($adminData);
            }
            $roleObj = Role::firstOrCreate(['name' => $adminData['role'], 'guard_name' => 'web']);
            $admin->syncRoles([$roleObj]);
        }

        // 2. Seed Demo Customer in 'users' table for Storefront Portal
        User::firstOrCreate(
            ['phone' => '9876543210'],
            [
                'email' => 'ramesh.patel@agri.com',
                'name' => 'Ramesh Patel (Demo Customer)',
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

