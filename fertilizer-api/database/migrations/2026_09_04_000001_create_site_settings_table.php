<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default values
        $defaults = [
            ['key' => 'app_name',       'value' => 'Sarkar Fertilizer'],
            ['key' => 'app_tagline',    'value' => 'Govt Certified Agri Store'],
            ['key' => 'logo_url',       'value' => '/logo.png'],
            ['key' => 'favicon_url',    'value' => '/favicon.ico'],
            ['key' => 'primary_color',  'value' => 'emerald'],
            ['key' => 'admin_color',    'value' => 'indigo'],
            ['key' => 'theme_mode',     'value' => 'dark'],
        ];

        foreach ($defaults as $row) {
            DB::table('site_settings')->insertOrIgnore(array_merge($row, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
