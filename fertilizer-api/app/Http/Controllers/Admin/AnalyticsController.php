<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        // 1. Sales Line Chart (Daily for last 30 days)
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $salesData = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue')
        )
        ->where('created_at', '>=', $thirtyDaysAgo)
        ->where('status', '!=', 'CANCELLED')
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        $salesChart = [];
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays(29 - $i)->format('Y-m-d');
            $found = $salesData->firstWhere('date', $date);
            $salesChart[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'revenue' => $found ? (float) $found->revenue : 0
            ];
        }

        // 2. Category Breakdown Pie Chart
        $categoryData = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'CANCELLED')
            ->select('categories.name', DB::raw('SUM(order_items.qty) as value'))
            ->groupBy('categories.name')
            ->get();

        // 3. Top Products Bar Chart
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'CANCELLED')
            ->select('products.name', DB::raw('SUM(order_items.qty) as sales'))
            ->groupBy('products.name')
            ->orderByDesc('sales')
            ->limit(10)
            ->get();

        // 4. Customer Acquisition Chart (Weekly for last 12 weeks)
        $twelveWeeksAgo = Carbon::now()->subWeeks(12);
        $customerData = User::whereHas('roles', function($q) {
                $q->where('name', 'User');
            })
            ->select(
                DB::raw('YEARWEEK(created_at) as week'),
                DB::raw('COUNT(*) as users')
            )
            ->where('created_at', '>=', $twelveWeeksAgo)
            ->groupBy('week')
            ->orderBy('week', 'asc')
            ->get();
            
        $customerAcquisition = [];
        for ($i = 0; $i < 12; $i++) {
            $weekStart = Carbon::now()->subWeeks(11 - $i)->startOfWeek();
            $weekKey = $weekStart->format('xV'); // YEARWEEK equivalent
            $found = $customerData->firstWhere('week', $weekKey);
            $customerAcquisition[] = [
                'week' => $weekStart->format('M d'),
                'users' => $found ? (int) $found->users : 0
            ];
        }

        return response()->json([
            'sales' => $salesChart,
            'categories' => $categoryData,
            'top_products' => $topProducts,
            'customers' => $customerAcquisition
        ]);
    }
}
