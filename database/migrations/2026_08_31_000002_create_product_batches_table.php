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
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('batch_code')->unique();
            $table->date('manufactured_date');
            $table->date('expiry_date');
            $table->decimal('moisture_pct', 5, 2)->default(2.10);
            $table->integer('stock_qty')->default(100);
            $table->string('warehouse_zone')->default('ZONE-A');
            $table->string('status')->default('SAFE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_batches');
    }
};
