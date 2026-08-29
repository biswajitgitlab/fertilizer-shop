<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fertilizer_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->date('application_date');
            $table->decimal('qty', 8, 2)->nullable();
            $table->string('application_method')->nullable();
            $table->string('status')->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fertilizer_schedules');
    }
};
