<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerSchedule extends Model
{
    protected $fillable = [
        'crop_plan_id', 'product_id', 'stage_name', 'recommended_products', 'application_date', 'qty', 'application_method', 'status', 'notes'
    ];

    protected $casts = [
        'application_date' => 'date',
    ];

    public function cropPlan(): BelongsTo
    {
        return $this->belongsTo(CropPlan::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
