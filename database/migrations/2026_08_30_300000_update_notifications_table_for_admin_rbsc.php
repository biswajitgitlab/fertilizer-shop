<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('admin_id')->nullable()->after('user_id')->constrained('admins')->cascadeOnDelete();
            $table->string('required_permission')->nullable()->after('admin_id')->index();
            $table->string('link')->nullable()->after('body');
            $table->json('read_by_admins')->nullable()->after('read_at');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['admin_id', 'required_permission', 'link', 'read_by_admins']);
        });
    }
};
