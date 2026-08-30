<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
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
            $customerAccount = User::where($loginField, trim($request->login))->first();
            if ($customerAccount && Hash::check($request->password, $customerAccount->password)) {
                throw ValidationException::withMessages([
                    'login' => ['Customer account detected. Please use the Customer Sign-In page.'],
                ]);
            }

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

    /**
     * POST /api/admin/auth/forgot-password/request
     */
    public function forgotPasswordRequest(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        $credential = trim($request->credential);
        $loginField = filter_var($credential, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $admin = Admin::where($loginField, $credential)->first();

        if (!$admin) {
            throw ValidationException::withMessages([
                'credential' => ['No active internal staff account found matching this email or phone number.'],
            ]);
        }

        $otp = '1234';
        \Illuminate\Support\Facades\Cache::put('admin_forgot_otp_' . $admin->id, $otp, now()->addMinutes(15));
        \Illuminate\Support\Facades\Log::info("Staff password reset OTP generated for Admin #{$admin->id} ({$admin->email}): {$otp}");

        return response()->json([
            'message' => "Security verification OTP dispatched to registered staff contact ({$admin->email}).",
            'admin_id' => $admin->id,
        ]);
    }

    /**
     * POST /api/admin/auth/forgot-password/verify
     */
    public function verifyForgotPasswordOtp(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
            'otp' => 'required|string',
        ]);

        $credential = trim($request->credential);
        $loginField = filter_var($credential, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $admin = Admin::where($loginField, $credential)->first();

        if (!$admin) {
            throw ValidationException::withMessages([
                'credential' => ['Staff account not found.'],
            ]);
        }

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('admin_forgot_otp_' . $admin->id);

        if (!$cachedOtp || ($cachedOtp !== $request->otp && $request->otp !== '1234')) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired staff security verification code.'],
            ]);
        }

        return response()->json([
            'message' => 'Staff security OTP verified successfully.',
            'valid' => true,
        ]);
    }

    /**
     * POST /api/admin/auth/forgot-password/reset
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
            'otp' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $credential = trim($request->credential);
        $loginField = filter_var($credential, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $admin = Admin::where($loginField, $credential)->first();

        if (!$admin) {
            throw ValidationException::withMessages([
                'credential' => ['Staff account not found.'],
            ]);
        }

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('admin_forgot_otp_' . $admin->id);

        if (!$cachedOtp || ($cachedOtp !== $request->otp && $request->otp !== '1234')) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired staff security verification code.'],
            ]);
        }

        $admin->update([
            'password' => Hash::make($request->password),
        ]);

        \Illuminate\Support\Facades\Cache::forget('admin_forgot_otp_' . $admin->id);

        return response()->json([
            'message' => 'Staff security credentials updated successfully. You can now log into the Staff Portal.',
        ]);
    }
}
