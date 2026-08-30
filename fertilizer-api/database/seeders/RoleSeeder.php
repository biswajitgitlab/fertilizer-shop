<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. All system permission capabilities categorized by module
        $permissions = [
            // Products Module
            'products.view',
            'products.create',
            'products.edit',
            'products.delete',
            // Orders Module
            'orders.view',
            'orders.edit',
            'orders.status',
            'orders.delete',
            // Users Module (Staff & Admin User Management)
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            // Roles & Permissions Module
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            // Customers CRM Module
            'customers.view',
            'customers.edit',
            'customers.delete',
            // Analytics Module
            'analytics.view',
            'analytics.export',
            // Notifications (Sentinel Alerts) Module
            'notifications.view',
            'notifications.send',
            // Inventory Module
            'inventory.view',
            'inventory.update',
            // Crop Plans & Triage Module
            'crop_plans.view',
            'crop_plans.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Define standard system roles and permission sets
        $rolePermissions = [
            'Super Admin' => $permissions,
            'Admin' => [
                'products.view', 'products.create', 'products.edit', 'products.delete',
                'orders.view', 'orders.edit', 'orders.status', 'orders.delete',
                'users.view', 'roles.view',
                'customers.view', 'customers.edit', 'customers.delete',
                'analytics.view', 'analytics.export',
                'notifications.view', 'notifications.send',
                'inventory.view', 'inventory.update',
                'crop_plans.view', 'crop_plans.manage',
            ],
            'Store Manager' => [
                'products.view', 'products.create', 'products.edit', 'products.delete',
                'orders.view', 'orders.edit', 'orders.status', 'orders.delete',
                'inventory.view', 'inventory.update',
                'customers.view', 'analytics.view', 'notifications.view'
            ],
            'Customer Support' => [
                'orders.view', 'orders.status',
                'customers.view', 'customers.edit',
                'notifications.view', 'products.view'
            ],
            'Warehouse Manager' => [
                'inventory.view', 'inventory.update',
                'products.view', 'orders.view', 'orders.status',
                'notifications.view'
            ],
            'Field Officer' => [
                'crop_plans.view', 'crop_plans.manage',
                'customers.view', 'products.view', 'notifications.view'
            ],
            'Staff' => [
                'products.view', 'orders.view', 'customers.view',
                'inventory.view', 'notifications.view'
            ],
            'Customer' => [],
        ];

        foreach ($rolePermissions as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($perms);
        }
    }
}

