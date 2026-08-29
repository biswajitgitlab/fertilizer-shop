<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CropTemplate extends Model
{
    protected $fillable = [
        'crop_name',
        'stage_name',
        'days_after_sowing',
        'recommended_products',
        'qty_per_acre',
        'application_method',
    ];
}
