<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'packer_id', 'driver_id', 'order_number', 'status', 'subtotal', 'discount', 'tax', 
        'shipping_cost', 'total', 'payment_method', 'payment_status', 
        'shipping_address_json', 'billing_address_json', 'tracking_number', 'notes',
        'packed_at', 'shipped_at', 'delivered_at',
        'cancelled_at', 'cancelled_by', 'cancellation_reason', 
        'refund_status', 'refund_amount', 'refund_reference_id'
    ];

    protected $casts = [
        'shipping_address_json' => 'array',
        'billing_address_json' => 'array',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'refund_amount' => 'decimal:2',
    ];

    /**
     * Relationship to Customer (User model)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Alias relationship to Customer for expressive domain code
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relationship to Warehouse Staff / Packer
     */
    public function packer(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'packer_id');
    }

    /**
     * Relationship to Delivery Logistics Driver
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'driver_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
