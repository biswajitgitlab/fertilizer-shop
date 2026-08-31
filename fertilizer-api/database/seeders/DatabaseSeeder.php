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
            [
                'email' => 'packer@fertilizershop.com',
                'name' => 'Ramesh Packer',
                'phone' => '9222222222',
                'password' => Hash::make('staff123'),
                'role' => 'Warehouse Packer',
                'is_verified' => true,
            ],
            [
                'email' => 'driver@fertilizershop.com',
                'name' => 'Suresh Driver',
                'phone' => '9111111111',
                'password' => Hash::make('staff123'),
                'role' => 'Logistics Driver',
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

        // 2. Seed Demo Farmers / Customers in 'users' table for Storefront & Admin KCC Verification
        $farmers = [
            [
                'phone' => '9876543210',
                'email' => 'farmer@sarkarfertilizer.com',
                'name' => 'Ramesh Kumar',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-88192',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                'verification_status' => 'VERIFIED_AADHAAR',
                'is_verified' => true,
                'farm_location' => 'Karnal, Haryana',
                'farm_size_acres' => 12.5,
            ],
            [
                'phone' => '7863955493',
                'email' => 'biswajit179789@gmail.com',
                'name' => 'Biswajit Sarkar',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-99014',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                'verification_status' => 'VERIFIED_AADHAAR',
                'is_verified' => true,
                'farm_location' => 'Burdwan, West Bengal',
                'farm_size_acres' => 18.0,
            ],
            [
                'phone' => '9876543299',
                'email' => 'ramesh.patel.farmer@example.com',
                'name' => 'Ramesh Patel',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-44102',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category B',
                'verification_status' => 'VERIFIED_AADHAAR',
                'is_verified' => true,
                'farm_location' => 'Anand, Gujarat',
                'farm_size_acres' => 14.2,
            ],
            [
                'phone' => '9876543288',
                'email' => 'suresh.kumar.farmer@example.com',
                'name' => 'Suresh Kumar',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-33291',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                'verification_status' => 'PENDING_DOCUMENTATION',
                'is_verified' => false,
                'farm_location' => 'Nashik, Maharashtra',
                'farm_size_acres' => 25.0,
            ],
            [
                'phone' => '9876543277',
                'email' => 'harpreet.dhillon@agri.in',
                'name' => 'Harpreet Singh Dhillon',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-77123',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                'verification_status' => 'VERIFIED_AADHAAR',
                'is_verified' => true,
                'farm_location' => 'Ludhiana, Punjab',
                'farm_size_acres' => 32.0,
            ],
            [
                'phone' => '9876543266',
                'email' => 'anita.devi.krishi@example.com',
                'name' => 'Anita Devi',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-55412',
                'subsidy_tier' => 'PM-PRANAM Category B Micro-Nutrient',
                'verification_status' => 'PENDING_DOCUMENTATION',
                'is_verified' => false,
                'farm_location' => 'Patna, Bihar',
                'farm_size_acres' => 6.5,
            ],
            [
                'phone' => '9876543255',
                'email' => 'gurpreet.kaur@farm.org',
                'name' => 'Gurpreet Kaur',
                'password' => Hash::make('password123'),
                'role' => 'Customer',
                'kcc_number' => 'KCC-2026-11892',
                'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                'verification_status' => 'VERIFIED_AADHAAR',
                'is_verified' => true,
                'farm_location' => 'Amritsar, Punjab',
                'farm_size_acres' => 20.0,
            ],
        ];

        foreach ($farmers as $f) {
            $user = User::where('email', $f['email'])->orWhere('phone', $f['phone'])->first();
            if ($user) {
                $user->update($f);
            } else {
                User::create($f);
            }
        }

        $this->call([
            ConstantsSeeder::class,
        ]);
    }
}

