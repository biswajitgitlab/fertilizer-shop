<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'views_count')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unsignedBigInteger('views_count')->default(0)->after('stock_qty');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'views_count')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('views_count');
            });
        }
    }
};
