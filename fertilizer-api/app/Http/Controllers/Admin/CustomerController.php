<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $cacheKey = "admin_customers_p{$page}_s_" . md5($search);

        $customers = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = User::where(function($q) {
                $q->where('role', 'Customer')
                  ->orWhere('role', 'User')
                  ->orWhereNull('role');
            });

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            return $query->orderBy('created_at', 'desc')->paginate(50);
        });

        return response()->json($customers);
    }

    public function show($id)
    {
        $data = Cache::remember("admin_customer_detail_{$id}", 300, function () use ($id) {
            $customer = User::findOrFail($id);
            $orders = Order::where('user_id', $id)->orderBy('created_at', 'desc')->get();
            $totalSpent = $orders->where('status', '!=', 'CANCELLED')->sum('total');

            return [
                'customer' => $customer,
                'orders' => $orders,
                'total_spent' => $totalSpent
            ];
        });

        return response()->json($data);
    }
}

