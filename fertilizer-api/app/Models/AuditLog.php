<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'target',
        'details',
        'ip_address',
        'risk_level',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
