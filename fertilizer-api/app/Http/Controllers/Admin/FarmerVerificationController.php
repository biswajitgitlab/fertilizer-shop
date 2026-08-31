<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class FarmerVerificationController extends Controller
{
    public function index(Request $request)
    {
        $farmers = User::whereDoesntHave('roles', function ($q) {
            $q->whereIn('name', ['Super Admin', 'Admin', 'Store Manager']);
        })
        ->select('id', 'name', 'email', 'phone', 'is_verified', 'kcc_number', 'aadhaar_hash', 'subsidy_tier', 'verification_status', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($farmers);
    }

    public function verify(Request $request, $id)
    {
        $farmer = User::findOrFail($id);

        $validated = $request->validate([
            'verification_status' => 'required|string|in:VERIFIED_AADHAAR,PENDING_DOCUMENTATION,REJECTED',
            'kcc_number' => 'nullable|string',
            'subsidy_tier' => 'nullable|string',
        ]);

        $farmer->verification_status = $validated['verification_status'];
        $farmer->is_verified = $validated['verification_status'] === 'VERIFIED_AADHAAR';
        if (isset($validated['kcc_number'])) {
            $farmer->kcc_number = $validated['kcc_number'];
        }
        if (isset($validated['subsidy_tier'])) {
            $farmer->subsidy_tier = $validated['subsidy_tier'];
        }
        $farmer->save();

        return response()->json([
            'message' => 'Farmer verification status updated successfully',
            'farmer' => $farmer,
        ]);
    }
}
