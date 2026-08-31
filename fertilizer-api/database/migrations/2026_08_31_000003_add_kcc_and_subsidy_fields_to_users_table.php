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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'kcc_number')) {
                $table->string('kcc_number')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'aadhaar_hash')) {
                $table->string('aadhaar_hash')->nullable()->after('kcc_number');
            }
            if (!Schema::hasColumn('users', 'subsidy_tier')) {
                $table->string('subsidy_tier')->default('PM-PRANAM Direct Subsidy Category A')->after('aadhaar_hash');
            }
            if (!Schema::hasColumn('users', 'verification_status')) {
                $table->string('verification_status')->default('VERIFIED_AADHAAR')->after('subsidy_tier');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kcc_number', 'aadhaar_hash', 'subsidy_tier', 'verification_status']);
        });
    }
};
