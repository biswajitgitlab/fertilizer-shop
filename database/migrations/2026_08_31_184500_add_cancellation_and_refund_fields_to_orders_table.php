<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('tracking_number');
            $table->string('cancelled_by')->nullable()->after('cancelled_at'); // CUSTOMER, ADMIN, SYSTEM
            $table->string('cancellation_reason')->nullable()->after('cancelled_by');
            $table->string('refund_status')->default('NOT_APPLICABLE')->after('payment_status'); // NOT_APPLICABLE, PENDING, PROCESSING, REFUNDED, FAILED
            $table->decimal('refund_amount', 10, 2)->default(0.00)->after('refund_status');
            $table->string('refund_reference_id')->nullable()->after('refund_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'cancelled_at',
                'cancelled_by',
                'cancellation_reason',
                'refund_status',
                'refund_amount',
                'refund_reference_id'
            ]);
        });
    }
};
