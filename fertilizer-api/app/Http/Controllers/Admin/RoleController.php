<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Cache;

class RoleController extends Controller
{
    /**
     * Clear all RBAC related caches.
     */
    private function clearRoleCache()
    {
        Cache::forget('admin_roles_list');
        Cache::forget('admin_permissions_list');
        Cache::forget('admin_team_list');
    }

    /**
     * List all roles with assigned permissions and user counts.
     */
    public function index()
    {
        $roles = Cache::remember('admin_roles_list', 1800, function () {
            return Role::with('permissions')->get()->map(function ($role) {
                $userCount = User::whereHas('roles', function ($q) use ($role) {
                    $q->where('id', $role->id);
                })->orWhere('role', $role->name)->count();

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'user_count' => $userCount,
                    'permissions' => $role->permissions->pluck('name'),
                    'is_system' => in_array($role->name, ['Super Admin', 'Admin', 'Customer']),
                ];
            });
        });

        return response()->json($roles);
    }

    /**
     * List all available permissions categorized for UI checkbox matrix.
     */
    public function permissions()
    {
        $permissions = Cache::remember('admin_permissions_list', 3600, function () {
            return Permission::all()->map(function ($perm) {
                $parts = explode('.', $perm->name);
                $group = ucfirst($parts[0] ?? 'General');
                $action = ucfirst(str_replace('_', ' ', $parts[1] ?? $perm->name));

                return [
                    'id' => $perm->id,
                    'name' => $perm->name,
                    'group' => $group,
                    'label' => $action,
                ];
            });
        });

        return response()->json($permissions);
    }

    /**
     * Create a new custom enterprise role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        $this->clearRoleCache();

        return response()->json([
            'message' => 'Role created successfully',
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]
        ], 201);
    }

    /**
     * Update permissions for a role.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'permissions' => 'required|array',
        ]);

        $role->syncPermissions($request->permissions);
        $this->clearRoleCache();

        return response()->json([
            'message' => "Permissions updated for role {$role->name}",
            'permissions' => $role->permissions->pluck('name'),
        ]);
    }

    /**
     * Delete custom role.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if (in_array($role->name, ['Super Admin', 'Admin', 'Customer'])) {
            return response()->json(['message' => 'Cannot delete system core roles.'], 422);
        }

        $role->delete();
        $this->clearRoleCache();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    /**
     * List admin team members with their roles.
     */
    public function team()
    {
        $team = Cache::remember('admin_team_list', 300, function () {
            return User::where('role', '!=', 'Customer')
                ->orWhereHas('roles', function($q) {
                    $q->where('name', '!=', 'Customer');
                })
                ->get()
                ->map(function ($user) {
                    $roleNames = $user->getRoleNames()->toArray();
                    if (empty($roleNames)) {
                        $roleNames = [$user->role ?: 'Admin'];
                    }
                    $permissions = $user->getAllPermissions()->pluck('name')->toArray();

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role ?: ($roleNames[0] ?? 'Admin'),
                        'roles' => $roleNames,
                        'permissions' => $permissions,
                        'created_at' => $user->created_at,
                    ];
                });
        });

        return response()->json($team);
    }

    /**
     * Assign role to team member.
     */
    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->syncRoles([$request->role]);
        $user->update(['role' => $request->role]);

        $this->clearRoleCache();

        return response()->json([
            'message' => "Role {$request->role} assigned to {$user->name}",
            'user' => $user
        ]);
    }
}

