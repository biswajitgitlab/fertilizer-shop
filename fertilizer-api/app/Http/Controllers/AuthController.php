<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8',
            'farm_location' => 'nullable|string',
            'farm_size_acres' => 'nullable|numeric',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'Customer';
        
        $user = User::create($validated);
        $user->assignRole('Customer');

        // Mock SMS logic
        $otp = '1234'; // In real life: rand(100000, 999999);
        Cache::put('otp_' . $user->phone, $otp, now()->addMinutes(10));
        Log::info("Mock SMS sent to {$user->phone} with OTP: {$otp}");

        // Temporary token just to let them proceed to OTP verification or wait until they verify
        $tempToken = $user->createToken('temp_token', ['verify-otp'])->plainTextToken;

        return response()->json([
            'message' => 'User created successfully. OTP sent to phone.',
            'user' => $user,
            'temp_token' => $tempToken
        ], 201);
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

        // Revoke temp tokens
        $user->tokens()->where('name', 'temp_token')->delete();

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'Phone verified successfully.',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // can be phone or email
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($loginField, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    // POST /api/auth/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

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
