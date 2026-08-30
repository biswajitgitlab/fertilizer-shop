<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * POST /api/admin/login (Dedicated Internal Staff & Admin Portal Login)
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        // Query ONLY the admins table
        $admin = Admin::where($loginField, trim($request->login))->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid staff credentials. Access to the Admin Portal is restricted to authorized personnel.'],
            ]);
        }

        if (!$admin->is_verified) {
            return response()->json([
                'message' => 'Your staff account is pending verification. Please contact system administrator.'
            ], 403);
        }

        $token = $admin->createToken('admin_access_token')->plainTextToken;

        return response()->json([
            'message' => "Welcome to the Staff Portal, {$admin->name}.",
            'access_token' => $token,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role ?: 'Admin',
                'roles' => $admin->getRoleNames()->toArray(),
                'effective_permissions' => $admin->getEffectivePermissions(),
                'is_verified' => (bool)$admin->is_verified,
            ],
            'is_staff' => true,
        ]);
    }

    /**
     * POST /api/admin/logout
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out from Admin Portal.']);
    }

    /**
     * GET /api/admin/me
     */
    public function me(Request $request)
    {
        $admin = $request->user();
        if (!$admin || get_class($admin) !== Admin::class) {
            return response()->json(['message' => 'Unauthenticated staff member.'], 401);
        }

        return response()->json([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'phone' => $admin->phone,
            'role' => $admin->role ?: 'Admin',
            'roles' => $admin->getRoleNames()->toArray(),
            'effective_permissions' => $admin->getEffectivePermissions(),
            'is_verified' => (bool)$admin->is_verified,
        ]);
    }
}
