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
            if (!Schema::hasColumn('crop_diagnoses', 'title')) {
                $table->string('title')->nullable()->after('crop_name');
            }
            if (!Schema::hasColumn('crop_diagnoses', 'causes_json')) {
                $table->json('causes_json')->nullable()->after('symptoms_json');
            }
            if (!Schema::hasColumn('crop_diagnoses', 'preventive_measures_json')) {
                $table->json('preventive_measures_json')->nullable()->after('recommended_products_json');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crop_diagnoses', function (Blueprint $table) {
            $table->dropColumn(['title', 'causes_json', 'preventive_measures_json']);
        });
    }
};
