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
        Schema::table('driver_settlements', function (Blueprint $table) {
            try {
                $table->dropForeign(['driver_id']);
            } catch (\Throwable $e) {}
            try {
                $table->dropForeign(['reconciled_by']);
            } catch (\Throwable $e) {}

            $table->foreign('driver_id')->references('id')->on('admins')->onDelete('set null');
            $table->foreign('reconciled_by')->references('id')->on('admins')->onDelete('set null');
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            try {
                $table->dropForeign(['admin_id']);
            } catch (\Throwable $e) {}

            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driver_settlements', function (Blueprint $table) {
            try {
                $table->dropForeign(['driver_id']);
            } catch (\Throwable $e) {}
            try {
                $table->dropForeign(['reconciled_by']);
            } catch (\Throwable $e) {}

            $table->foreign('driver_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('reconciled_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            try {
                $table->dropForeign(['admin_id']);
            } catch (\Throwable $e) {}

            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
