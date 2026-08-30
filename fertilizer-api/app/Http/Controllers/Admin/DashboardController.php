<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Admin;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        $dashboardData = Cache::remember('admin_dashboard_stats', 300, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();

            // Total Sales (Today & This Month)
            $salesToday = Order::whereDate('created_at', $today)->where('status', '!=', 'CANCELLED')->sum('total');
            $salesThisMonth = Order::where('created_at', '>=', $thisMonth)->where('status', '!=', 'CANCELLED')->sum('total');

            // Total Orders
            $totalOrders = Order::count();

            // New Customers (This Month)
            $newCustomers = User::where('created_at', '>=', $thisMonth)->count();

            // Low Stock Count (< 10)
            $lowStockCount = Product::where('stock_qty', '<', 10)->count();

            // Revenue Chart (last 30 days)
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $revenueData = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue')
            )
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->where('status', '!=', 'CANCELLED')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

            // Fill missing days with 0
            $chartData = [];
            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::now()->subDays(29 - $i)->format('Y-m-d');
                $found = $revenueData->firstWhere('date', $date);
                $chartData[] = [
                    'date' => Carbon::parse($date)->format('M d'),
                    'revenue' => $found ? (float) $found->revenue : 0
                ];
            }

            // Recent Orders
            $recentOrders = Order::with('user')->orderBy('created_at', 'desc')->take(10)->get()->toArray();

            // Top Selling Products
            $topProducts = DB::table('order_items')
                ->select('product_id', DB::raw('SUM(qty) as total_sold'))
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'CANCELLED')
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();
                
            $topProductIds = $topProducts->pluck('product_id');
            $products = Product::whereIn('id', $topProductIds)->get()->keyBy('id');
            
            $topSelling = $topProducts->map(function($item) use ($products) {
                $p = $products->get($item->product_id);
                return [
                    'id' => $item->product_id,
                    'name' => $p ? $p->name : 'Unknown Product',
                    'image' => $p && $p->images_json ? $p->images_json[0] : null,
                    'total_sold' => (int) $item->total_sold
                ];
            });

            // Active Products
            $activeProducts = Product::where('is_active', true)->count();

            return [
                'stats' => [
                    'sales_today' => $salesToday,
                    'sales_month' => $salesThisMonth,
                    'total_orders' => $totalOrders,
                    'new_customers' => $newCustomers,
                    'low_stock' => $lowStockCount,
                    'active_products' => $activeProducts
                ],
                'chart_data' => $chartData,
                'recent_orders' => $recentOrders,
                'top_products' => $topSelling
            ];
        });

        return response()->json($dashboardData);
    }
}
