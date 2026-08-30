<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'admin_id',
        'required_permission',
        'type',
        'title',
        'body',
        'link',
        'data_json',
        'read_at',
        'read_by_admins'
    ];

    protected $casts = [
        'data_json' => 'array',
        'read_by_admins' => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
