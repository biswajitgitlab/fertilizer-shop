<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CropDiagnosis extends Model
{
    protected $fillable = [
        'user_id', 'crop_name', 'title', 'location', 'growth_stage', 'symptoms_json', 'causes_json', 
        'images_json', 'ai_result', 'confidence_score', 'recommended_products_json', 'preventive_measures_json',
        'severity', 'status', 'admin_reviewed', 'admin_notes'
    ];

    protected $casts = [
        'symptoms_json' => 'array',
        'causes_json' => 'array',
        'images_json' => 'array',
        'recommended_products_json' => 'array',
        'preventive_measures_json' => 'array',
        'admin_reviewed' => 'boolean',
        'confidence_score' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
