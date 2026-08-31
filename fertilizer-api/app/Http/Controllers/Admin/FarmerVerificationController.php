<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FarmerVerificationController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));
        $status = trim($request->get('status', 'ALL'));

        $cacheKey = "farmers:p{$page}:pp{$perPage}:s{$search}:st{$status}";

        $cached = Cache::get($cacheKey);
        if ($cached) {
            $cached['is_cached'] = true;
            return response()->json($cached);
        }

        $query = User::whereDoesntHave('roles', function ($q) {
            $q->whereIn('name', ['Super Admin', 'Admin', 'Store Manager']);
        })
        ->select('id', 'name', 'email', 'phone', 'is_verified', 'kcc_number', 'aadhaar_hash', 'subsidy_tier', 'verification_status', 'created_at');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('kcc_number', 'like', "%{$search}%");
            });
        }

        if ($status !== 'ALL' && !empty($status)) {
            $query->where('verification_status', $status);
        }

        if (!$request->has('page') && !$request->has('per_page') && !$request->has('search') && !$request->has('status')) {
            return response()->json($query->orderBy('created_at', 'desc')->get());
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        $response = [
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
            ],
            'is_cached' => false,
        ];

        Cache::put($cacheKey, $response, 60);

        return response()->json($response);
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

        // Clear cache
        try {
            if (config('cache.default') === 'redis') {
                $redis = Cache::redis();
                foreach ($redis->keys('*farmers:*') as $key) {
                    $redis->del($key);
                }
            } else {
                Cache::flush();
            }
        } catch (\Throwable $e) {}

        return response()->json([
            'message' => 'Farmer verification status updated successfully',
            'farmer' => $farmer,
        ]);
    }
}
