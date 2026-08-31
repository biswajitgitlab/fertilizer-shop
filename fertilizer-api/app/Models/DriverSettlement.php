<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverSettlement extends Model
{
    protected $fillable = [
        'order_id',
        'driver_id',
        'cash_collected',
        'reconciled_by',
        'status',
        'notes',
        'settled_at',
    ];

    protected $casts = [
        'cash_collected' => 'float',
        'settled_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function reconciler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
