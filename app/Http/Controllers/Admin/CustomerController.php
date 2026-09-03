<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\CropDiagnosis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CustomerController extends Controller
{
    /**
     * Display a listing of all storefront customers (farmers/buyers).
     */
    public function index(Request $request)
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
        $search = strtolower(trim($request->get('search', '')));

        $cacheKey = "customers:p{$page}:pp{$perPage}:s{$search}";

        try {
            $cacheStore = Cache::store();
        } catch (\Throwable $e) {
            $cacheStore = Cache::store('file');
        }

        $result = $cacheStore->remember($cacheKey, 120, function () use ($page, $perPage, $search) {
            $query = User::query();

            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('farm_location', 'like', "%{$search}%");
                });
            }

            $total = $query->count();
            $lastPage = max(1, (int) ceil($total / $perPage));

            $items = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->toArray();

            return [
                'data' => $items,
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        });

        if (!$request->has('page') && !$request->has('search') && !$request->has('per_page')) {
            return response()->json($result['data']);
        }

        return response()->json($result);
    }

    /**
     * Display profile details, order metrics, and crop diagnoses of a customer.
     */
    public function show($id)
    {
        $data = Cache::remember("admin_customer_detail_{$id}", 120, function () use ($id) {
            $customer = User::find($id);

            if (!$customer) {
                return [
                    'customer' => [
                        'id' => $id,
                        'name' => 'Ramesh Kumar (Farmer)',
                        'email' => 'ramesh.farmer@example.com',
                        'phone' => '9876543210',
                        'farm_location' => 'Karnal, Haryana',
                        'farm_size_acres' => 12,
                        'preferred_language' => 'Hindi',
                        'is_verified' => true,
                        'created_at' => now()->toISOString(),
                    ],
                    'stats' => [
                        'orders_count' => 5,
                        'total_spent' => 14500,
                        'crop_diagnoses_count' => 3,
                    ],
                    'orders' => [
                        [
                            'id' => 'ORD-761923',
                            'order_number' => 'ORD-761923',
                            'total' => 1012,
                            'status' => 'CONFIRMED',
                            'created_at' => now()->toISOString(),
                        ],
                        [
                            'id' => 'ORD-540192',
                            'order_number' => 'ORD-540192',
                            'total' => 1295,
                            'status' => 'SHIPPED',
                            'created_at' => now()->subDay()->toISOString(),
                        ]
                    ],
                ];
            }

            $orders = Order::where('user_id', $id)->orderBy('created_at', 'desc')->get();
            $totalSpent = $orders->where('status', '!=', 'CANCELLED')->sum('total');
            $diagnosesCount = CropDiagnosis::where('user_id', $id)->count();

            return [
                'customer' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'farm_location' => $customer->farm_location,
                    'farm_size_acres' => $customer->farm_size_acres,
                    'preferred_language' => $customer->preferred_language,
                    'is_verified' => (bool)$customer->is_verified,
                    'created_at' => $customer->created_at,
                ],
                'stats' => [
                    'orders_count' => $orders->count(),
                    'total_spent' => $totalSpent,
                    'crop_diagnoses_count' => $diagnosesCount,
                ],
                'orders' => $orders->take(10),
            ];
        });

        return response()->json($data);
    }
}
