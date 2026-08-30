<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $table = 'admins';
    protected $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'revoked_permissions',
        'avatar',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'revoked_permissions' => 'array',
            'is_verified' => 'boolean',
        ];
    }

    /**
     * Calculate effective permissions: (Role Permissions + Direct Granted Permissions) minus Revoked Permissions.
     */
    public function getEffectivePermissions(): array
    {
        if ($this->hasRole(['Super Admin', 'Admin']) || in_array($this->role, ['Super Admin', 'Admin'])) {
            return \Spatie\Permission\Models\Permission::pluck('name')->toArray();
        }

        $allGranted = $this->getAllPermissions()->pluck('name')->toArray();
        if (empty($allGranted) && !empty($this->role)) {
            $roleObj = \Spatie\Permission\Models\Role::where('name', $this->role)->first();
            if ($roleObj) {
                $allGranted = $roleObj->permissions()->pluck('name')->toArray();
            }
        }
        $revoked = $this->revoked_permissions ?: [];

        return array_values(array_diff($allGranted, $revoked));
    }

    /**
     * Check if admin user has an effective permission.
     */
    public function hasEffectivePermission(string $permission): bool
    {
        if ($this->hasRole(['Super Admin', 'Admin']) || in_array($this->role, ['Super Admin', 'Admin'])) {
            return true;
        }

        $revoked = $this->revoked_permissions ?: [];
        if (in_array($permission, $revoked)) {
            return false;
        }

        return in_array($permission, $this->getEffectivePermissions());
    }
}
