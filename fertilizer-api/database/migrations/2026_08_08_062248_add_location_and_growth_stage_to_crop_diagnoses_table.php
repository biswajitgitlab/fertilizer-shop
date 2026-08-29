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
        Schema::table('crop_diagnoses', function (Blueprint $table) {
            $table->string('location')->nullable()->after('crop_name');
            $table->string('growth_stage')->nullable()->after('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crop_diagnoses', function (Blueprint $table) {
            $table->dropColumn(['location', 'growth_stage']);
        });
    }
};
