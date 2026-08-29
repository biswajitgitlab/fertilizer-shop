<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crop_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('crop_name');
            $table->decimal('field_area', 8, 2)->nullable();
            $table->date('sowing_date')->nullable();
            $table->date('expected_harvest')->nullable();
            $table->string('growth_stage')->nullable();
            $table->json('scheduled_tasks_json')->nullable();
            $table->boolean('reminders_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_plans');
    }
};
