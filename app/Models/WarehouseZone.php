<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category_type',
        'temperature_controlled',
        'capacity_units',
    ];

    protected $casts = [
        'temperature_controlled' => 'boolean',
        'capacity_units' => 'integer',
    ];

    public function batches()
    {
        return $this->hasMany(ProductBatch::class, 'warehouse_zone', 'code');
    }
}
