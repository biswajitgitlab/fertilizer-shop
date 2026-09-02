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
        Schema::table('fertilizer_schedules', function (Blueprint $table) {
            $table->string('stage_name')->nullable()->after('product_id');
            $table->string('recommended_products')->nullable()->after('stage_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fertilizer_schedules', function (Blueprint $table) {
            //
        });
    }
};
