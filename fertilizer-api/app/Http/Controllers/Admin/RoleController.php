<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
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
     * Helper to verify current user is Super Admin, Admin, or holds explicit user/role edit permission.
     */
    private function checkCanManage(Request $request)
    {
        $user = $request->user();
        if (!$user) return;

        $role = strtolower($user->role ?? '');
        $isSuperAdminOrAdmin = in_array($role, ['super admin', 'admin', 'superadmin']);

        $hasPerm = method_exists($user, 'hasEffectivePermission')
            ? ($user->hasEffectivePermission('roles.edit') || $user->hasEffectivePermission('users.edit'))
            : true;

        if (!$isSuperAdminOrAdmin && !$hasPerm) {
            abort(response()->json([
                'message' => 'Forbidden: Only Super Admin & Admin accounts are authorized to modify system roles or permissions.'
            ], 403));
        }
    }

    /**
     * List all roles with assigned permissions and user counts.
     */
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));

        $roles = Cache::remember("admin_roles_list_s{$search}", 1800, function () use ($search) {
            $query = Role::with('permissions');
            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }
            return $query->get()->map(function ($role) {
                $userCount = Admin::whereHas('roles', function ($q) use ($role) {
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

        if ($request->has('page') || $request->has('search') || $request->has('per_page')) {
            $total = count($roles);
            $lastPage = max(1, (int) ceil($total / $perPage));
            $items = array_slice($roles->toArray(), ($page - 1) * $perPage, $perPage);
            return response()->json([
                'data' => $items,
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                ]
            ]);
        }

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
        $this->checkCanManage($request);

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
        $this->checkCanManage($request);

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
    public function destroy(Request $request, $id)
    {
        $this->checkCanManage($request);

        $role = Role::findOrFail($id);

        if (in_array($role->name, ['Super Admin', 'Admin', 'Customer'])) {
            return response()->json(['message' => 'Cannot delete system core roles.'], 422);
        }

        $role->delete();
        $this->clearRoleCache();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    /**
     * List admin team members with their roles, role permissions, direct permissions, revoked permissions, and combined net effective permissions.
     */
    public function team()
    {
        $team = Cache::remember('admin_team_list', 300, function () {
            return Admin::all()
                ->map(function ($admin) {
                    $roleNames = $admin->getRoleNames()->toArray();
                    if (empty($roleNames)) {
                        $roleNames = [$admin->role ?: 'Admin'];
                    }

                    $directPermissions = $admin->getDirectPermissions()->pluck('name')->toArray();
                    $rolePermissions = $admin->getPermissionsViaRoles()->pluck('name')->toArray();
                    $revokedPermissions = $admin->revoked_permissions ?: [];
                    $effectivePermissions = $admin->getEffectivePermissions();

                    return [
                        'id' => $admin->id,
                        'name' => $admin->name,
                        'email' => $admin->email,
                        'phone' => $admin->phone,
                        'role' => $admin->role ?: ($roleNames[0] ?? 'Admin'),
                        'roles' => $roleNames,
                        'role_permissions' => array_values(array_unique($rolePermissions)),
                        'direct_permissions' => array_values(array_unique($directPermissions)),
                        'revoked_permissions' => array_values(array_unique($revokedPermissions)),
                        'permissions' => array_values(array_unique($effectivePermissions)),
                        'created_at' => $admin->created_at,
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
        $this->checkCanManage($request);

        $request->validate([
            'user_id' => 'required|exists:admins,id',
            'role' => 'required|string',
        ]);

        $admin = Admin::findOrFail($request->user_id);
        $admin->syncRoles([$request->role]);
        $admin->update(['role' => $request->role, 'revoked_permissions' => []]);

        $this->clearRoleCache();

        return response()->json([
            'message' => "Role {$request->role} assigned to {$admin->name}",
            'user' => $admin
        ]);
    }

    /**
     * Assign/update custom user permissions.
     */
    public function updateUserPermissions(Request $request, $id)
    {
        $this->checkCanManage($request);

        $request->validate([
            'permissions' => 'required|array',
        ]);

        $admin = Admin::findOrFail($id);
        $targetAllowed = array_values(array_unique($request->permissions));

        $rolePermissions = $admin->getPermissionsViaRoles()->pluck('name')->toArray();

        $revoked = array_values(array_diff($rolePermissions, $targetAllowed));
        $extraDirect = array_values(array_diff($targetAllowed, $rolePermissions));

        $admin->syncPermissions($extraDirect);
        $admin->update(['revoked_permissions' => $revoked]);

        $this->clearRoleCache();

        return response()->json([
            'message' => "Custom permissions updated for staff member {$admin->name}",
            'role_permissions' => $rolePermissions,
            'direct_permissions' => $extraDirect,
            'revoked_permissions' => $revoked,
            'effective_permissions' => $admin->getEffectivePermissions(),
        ]);
    }
}
