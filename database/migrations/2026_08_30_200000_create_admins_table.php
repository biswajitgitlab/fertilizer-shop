<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable()->unique();
            $table->string('password');
            $table->string('role')->default('Admin');
            $table->json('revoked_permissions')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // Migrate any existing staff/admin accounts from users to admins table
        $existingAdmins = DB::table('users')->where('role', '!=', 'Customer')->whereNotNull('role')->get();
        foreach ($existingAdmins as $admin) {
            DB::table('admins')->updateOrInsert(
                ['email' => $admin->email],
                [
                    'name' => $admin->name,
                    'phone' => $admin->phone,
                    'password' => $admin->password,
                    'role' => $admin->role ?: 'Admin',
                    'revoked_permissions' => $admin->revoked_permissions ?? null,
                    'avatar' => $admin->avatar ?? null,
                    'is_verified' => true,
                    'created_at' => $admin->created_at ?? now(),
                    'updated_at' => $admin->updated_at ?? now(),
                ]
            );
        }

        // Clean up staff entries from users table so users table is strictly Customers
        DB::table('users')->where('role', '!=', 'Customer')->whereNotNull('role')->delete();

        // Seed default Admin if empty
        if (DB::table('admins')->count() === 0) {
            DB::table('admins')->insert([
                'name' => 'Super Admin',
                'email' => 'admin@fertilizershop.com',
                'phone' => '+919876543210',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'is_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
