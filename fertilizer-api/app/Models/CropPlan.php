<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropPlan extends Model
{
    protected $fillable = [
        'user_id', 'crop_name', 'field_area', 'sowing_date', 'expected_harvest', 
        'growth_stage', 'scheduled_tasks_json', 'reminders_enabled'
    ];

    protected $casts = [
        'sowing_date' => 'date',
        'expected_harvest' => 'date',
        'scheduled_tasks_json' => 'array',
        'reminders_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fertilizerSchedules(): HasMany
    {
        return $this->hasMany(FertilizerSchedule::class);
    }
}
