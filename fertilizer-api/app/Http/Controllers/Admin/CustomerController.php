<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
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

        $customers = $query->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($customers);
    }

    public function show($id)
    {
        $customer = User::findOrFail($id);
        
        $orders = Order::where('user_id', $id)->orderBy('created_at', 'desc')->get();
        $totalSpent = $orders->where('status', '!=', 'CANCELLED')->sum('total');

        return response()->json([
            'customer' => $customer,
            'orders' => $orders,
            'total_spent' => $totalSpent
        ]);
    }
}
