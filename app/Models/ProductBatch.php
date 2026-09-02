<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBatch extends Model
{
    protected $fillable = [
        'product_id',
        'batch_code',
        'manufactured_date',
        'expiry_date',
        'moisture_pct',
        'stock_qty',
        'warehouse_zone',
        'status',
    ];

    protected $casts = [
        'manufactured_date' => 'date',
        'expiry_date' => 'date',
        'moisture_pct' => 'float',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouseZone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'warehouse_zone', 'code');
    }
}
