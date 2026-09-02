<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crop_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('crop_name');
            $table->json('symptoms_json')->nullable();
            $table->json('images_json')->nullable();
            $table->text('ai_result')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->json('recommended_products_json')->nullable();
            $table->string('severity')->nullable();
            $table->string('status')->default('PENDING');
            $table->boolean('admin_reviewed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_diagnoses');
    }
};
