<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use App\Jobs\SendWelcomeEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of all internal system staff/admin users.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $role = $request->input('role', '');
        $status = $request->input('status', '');

        $query = Admin::query();

        // Search by name, email, or phone
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if (!empty($role) && $role !== 'ALL') {
            $query->where(function ($q) use ($role) {
                $q->where('role', $role)
                  ->orWhereHas('roles', function ($rq) use ($role) {
                      $rq->where('name', $role);
                  });
            });
        }

        // Filter by verification status
        if ($status === 'VERIFIED') {
            $query->where('is_verified', true);
        } elseif ($status === 'UNVERIFIED') {
            $query->where('is_verified', false);
        }

        $admins = $query->orderBy('created_at', 'desc')->paginate(20);

        // Map roles and permission counts for UI
        $admins->getCollection()->transform(function ($admin) {
            $roles = $admin->getRoleNames()->toArray();
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role ?: ($roles[0] ?? 'Admin'),
                'roles' => empty($roles) ? [$admin->role ?: 'Admin'] : $roles,
                'is_verified' => (bool)$admin->is_verified,
                'effective_permissions_count' => count($admin->getEffectivePermissions()),
                'created_at' => $admin->created_at,
            ];
        });

        // Summary stats
        $stats = [
            'total_users' => Admin::count() + User::count(),
            'staff_count' => Admin::count(),
            'customers_count' => User::count(),
            'unverified_count' => User::where('is_verified', false)->count(),
        ];

        return response()->json([
            'users' => $admins,
            'stats' => $stats,
        ]);
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
            ? ($user->hasEffectivePermission('users.edit') || $user->hasEffectivePermission('roles.edit'))
            : true;

        if (!$isSuperAdminOrAdmin && !$hasPerm) {
            abort(response()->json([
                'message' => 'Forbidden: Only Super Admin & Admin accounts are authorized to create or modify staff accounts, roles, and RBSC permissions.'
            ], 403));
        }
    }

    /**
     * Store a newly created internal staff member in the admins table.
     */
    public function store(Request $request)
    {
        $this->checkCanManage($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:admins,phone',
            'email' => 'required|string|email|max:255|unique:admins,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string',
            'is_verified' => 'nullable|boolean',
        ]);

        $phone = preg_replace('/\s+/', '', trim($request->phone));
        $email = strtolower(trim($request->email));
        $roleName = $request->role ?: 'Admin';

        // Redis Lock for race condition prevention
        $lockKey = 'admin_create_lock_' . md5($phone . $email);
        $lock = Cache::lock($lockKey, 10);

        if (!$lock->get()) {
            return response()->json([
                'message' => 'Another request is creating this staff account. Please wait.'
            ], 429);
        }

        try {
            $admin = DB::transaction(function () use ($request, $phone, $email, $roleName) {
                $createdAdmin = Admin::create([
                    'name' => trim($request->name),
                    'phone' => $phone,
                    'email' => $email,
                    'password' => Hash::make($request->password),
                    'role' => $roleName,
                    'is_verified' => $request->boolean('is_verified', true),
                ]);

                // Ensure Spatie role exists and assign
                $roleObj = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
                $createdAdmin->assignRole($roleObj);

                return $createdAdmin;
            });

            Cache::forget('admin_team_list');

            \App\Services\NotificationService::notifyStaffCreated($admin);

            return response()->json([
                'message' => "Staff member {$admin->name} created successfully with role {$roleName}.",
                'user' => $admin
            ], 201);

        } catch (QueryException $e) {
            Log::warning("Duplicate staff creation blocked: " . $e->getMessage());
            return response()->json([
                'message' => 'A staff account with this email address or phone number already exists.',
            ], 422);
        } finally {
            try { $lock->release(); } catch (\Exception $e) {}
        }
    }

    /**
     * Display detailed profile & permissions of a specific staff member.
     */
    public function show($id)
    {
        $admin = Admin::findOrFail($id);
        $roles = $admin->getRoleNames()->toArray();

        return response()->json([
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role ?: ($roles[0] ?? 'Admin'),
                'roles' => empty($roles) ? [$admin->role ?: 'Admin'] : $roles,
                'is_verified' => (bool)$admin->is_verified,
                'effective_permissions' => $admin->getEffectivePermissions(),
                'created_at' => $admin->created_at,
            ],
            'stats' => [
                'orders_count' => 0,
                'total_spent' => 0,
                'crop_diagnoses_count' => 0,
            ],
            'recent_orders' => [],
        ]);
    }

    /**
     * Update staff details and role.
     */
    public function update(Request $request, $id)
    {
        $this->checkCanManage($request);

        $admin = Admin::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => "sometimes|required|string|max:20|unique:admins,phone,{$id}",
            'email' => "sometimes|required|string|email|max:255|unique:admins,email,{$id}",
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
            'is_verified' => 'nullable|boolean',
        ]);

        $data = [];
        if ($request->filled('name')) $data['name'] = trim($request->name);
        if ($request->filled('phone')) $data['phone'] = preg_replace('/\s+/', '', trim($request->phone));
        if ($request->filled('email')) $data['email'] = strtolower(trim($request->email));
        if ($request->filled('password')) $data['password'] = Hash::make($request->password);
        if ($request->has('is_verified')) $data['is_verified'] = $request->boolean('is_verified');

        if ($request->filled('role')) {
            $roleName = $request->role;
            $data['role'] = $roleName;
            $roleObj = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $admin->syncRoles([$roleObj]);
        }

        if ($request->has('permissions') && is_array($request->permissions)) {
            $targetAllowed = array_values(array_unique($request->permissions));
            $rolePermissions = $admin->getPermissionsViaRoles()->pluck('name')->toArray();
            if (empty($rolePermissions) && !empty($admin->role)) {
                $rObj = Role::where('name', $admin->role)->first();
                if ($rObj) {
                    $rolePermissions = $rObj->permissions()->pluck('name')->toArray();
                }
            }
            $revoked = array_values(array_diff($rolePermissions, $targetAllowed));
            $extraDirect = array_values(array_diff($targetAllowed, $rolePermissions));

            $admin->syncPermissions($extraDirect);
            $data['revoked_permissions'] = $revoked;
        }

        $admin->update($data);
        Cache::forget('admin_team_list');

        return response()->json([
            'message' => "Staff member {$admin->name} updated successfully.",
            'user' => $admin
        ]);
    }

    /**
     * Delete staff account.
     */
    public function destroy(Request $request, $id)
    {
        $this->checkCanManage($request);

        $admin = Admin::findOrFail($id);

        if ($request->user() && $request->user()->id === $admin->id && get_class($request->user()) === Admin::class) {
            return response()->json(['message' => 'You cannot delete your own logged-in account.'], 422);
        }

        if ($admin->hasRole('Super Admin') || $admin->email === 'admin@fertilizershop.com') {
            return response()->json(['message' => 'Cannot delete system Super Admin account.'], 422);
        }

        $adminName = $admin->name;
        $admin->delete();
        Cache::forget('admin_team_list');

        return response()->json([
            'message' => "Staff account {$adminName} deleted successfully."
        ]);
    }
}
