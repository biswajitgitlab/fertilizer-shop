<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'subtotal', 'discount', 'tax', 
        'shipping_cost', 'total', 'payment_method', 'payment_status', 
        'shipping_address_json', 'billing_address_json', 'tracking_number', 'notes'
    ];

    protected $casts = [
        'shipping_address_json' => 'array',
        'billing_address_json' => 'array',
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

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
