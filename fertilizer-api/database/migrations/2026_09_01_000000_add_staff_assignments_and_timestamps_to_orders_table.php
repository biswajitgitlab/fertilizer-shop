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
            if (!Schema::hasColumn('orders', 'packer_id')) {
                $table->foreignId('packer_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('orders', 'driver_id')) {
                $table->foreignId('driver_id')->nullable()->after('packer_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('orders', 'packed_at')) {
                $table->timestamp('packed_at')->nullable()->after('tracking_number');
            }
            if (!Schema::hasColumn('orders', 'shipped_at')) {
                $table->timestamp('shipped_at')->nullable()->after('packed_at');
            }
            if (!Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'packer_id')) {
                $table->dropForeign(['packer_id']);
                $table->dropColumn('packer_id');
            }
            if (Schema::hasColumn('orders', 'driver_id')) {
                $table->dropForeign(['driver_id']);
                $table->dropColumn('driver_id');
            }
            $table->dropColumn(['packed_at', 'shipped_at', 'delivered_at']);
        });
    }
};
