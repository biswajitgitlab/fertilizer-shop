<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Jobs\SendWelcomeEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // POST /api/auth/register (Storefront Customer Sign-up ONLY)
    public function register(Request $request)
    {
        // 1. Normalize input parameters
        if ($request->has('email')) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
        if ($request->has('phone')) {
            $request->merge(['phone' => trim($request->input('phone'))]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8',
            'farm_location' => 'nullable|string',
            'farm_size_acres' => 'nullable|numeric',
        ]);

        $normalizedEmail = $validated['email'];
        $normalizedPhone = $validated['phone'];

        // 2. Redis Distributed Lock
        $lockKey = 'user_reg_lock_' . md5($normalizedEmail . '_' . $normalizedPhone);
        $lock = Cache::lock($lockKey, 5);

        if (!$lock->get()) {
            return response()->json([
                'message' => 'Registration is already in progress for this account. Please wait a moment.'
            ], 429);
        }

        try {
            // 3. Create Storefront Customer Account
            $user = DB::transaction(function () use ($validated) {
                $validated['password'] = Hash::make($validated['password']);
                $validated['role'] = 'Customer';
                
                return User::create($validated);
            });

            // Dispatch Welcome Email Job
            SendWelcomeEmailJob::dispatch($user);

            // Mock SMS logic
            $otp = '1234';
            Cache::put('otp_' . $user->phone, $otp, now()->addMinutes(10));
            Log::info("Mock SMS sent to {$user->phone} with OTP: {$otp}");

            $tempToken = $user->createToken('temp_token', ['verify-otp'])->plainTextToken;

            return response()->json([
                'message' => 'Customer account created successfully. OTP sent to phone.',
                'user' => $user,
                'temp_token' => $tempToken
            ], 201);
        } catch (QueryException $e) {
            Log::warning("Duplicate customer registration blocked: " . $e->getMessage());
            return response()->json([
                'message' => 'An account with this email address or phone number already exists.',
                'errors' => [
                    'email' => ['An account with this email address or phone number already exists.']
                ]
            ], 422);
        } finally {
            try {
                $lock->release();
            } catch (\Exception $e) {}
        }
    }

    // POST /api/auth/verify-otp
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string',
        ]);

        $cachedOtp = Cache::get('otp_' . $request->phone);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }

        $user = User::where('phone', $request->phone)->firstOrFail();
        
        $user->update(['is_verified' => true]);
        
        Cache::forget('otp_' . $request->phone);

        $user->tokens()->where('name', 'temp_token')->delete();

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'Phone verified successfully.',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    // POST /api/auth/login (Storefront Customer Login ONLY)
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $loginValue = trim($request->login);

        // Check if account is an Admin/Staff trying to use Customer login
        $adminAccount = Admin::where($loginField, $loginValue)->first();
        if ($adminAccount && Hash::check($request->password, $adminAccount->password)) {
            // Staff credentials detected on customer portal — return token & flag
            $token = $adminAccount->createToken('access_token')->plainTextToken;
            return response()->json([
                'message' => 'Staff login recognized.',
                'access_token' => $token,
                'user' => [
                    'id' => $adminAccount->id,
                    'name' => $adminAccount->name,
                    'email' => $adminAccount->email,
                    'phone' => $adminAccount->phone,
                    'role' => $adminAccount->role ?: 'Admin',
                ],
                'is_staff' => true,
            ]);
        }

        // Strictly query Customer users table
        $user = User::where($loginField, $loginValue)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid customer credentials.'],
            ]);
        }

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'access_token' => $token,
            'user' => $user,
            'is_staff' => false,
        ]);
    }

    // POST /api/auth/logout
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // GET /api/auth/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // PUT /api/auth/profile
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|unique:users,phone,' . $user->id,
            'farm_location' => 'nullable|string',
            'farm_size_acres' => 'nullable|numeric',
            'preferred_language' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user
        ]);
    }
}
