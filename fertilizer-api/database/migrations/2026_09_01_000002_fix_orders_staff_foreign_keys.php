<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop existing foreign keys referencing users
            try {
                $table->dropForeign(['packer_id']);
            } catch (\Throwable $e) {}
            try {
                $table->dropForeign(['driver_id']);
            } catch (\Throwable $e) {}

            // Re-add foreign keys referencing admins table
            $table->foreign('packer_id')->references('id')->on('admins')->onDelete('set null');
            $table->foreign('driver_id')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            try {
                $table->dropForeign(['packer_id']);
            } catch (\Throwable $e) {}
            try {
                $table->dropForeign(['driver_id']);
            } catch (\Throwable $e) {}

            $table->foreign('packer_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('driver_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
