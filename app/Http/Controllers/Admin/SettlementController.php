<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriverSettlement;
use App\Models\Order;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        // 1. Auto-backfill driver settlements for any existing COD orders without a settlement record
        $defaultDriver = Admin::whereHas('roles', function ($q) {
            $q->where('name', 'Logistics Driver');
        })->first();
        $defaultDriverId = $defaultDriver ? $defaultDriver->id : 13;

        $unlinkedCodOrders = Order::whereIn('payment_method', ['COD', 'CASH_ON_DELIVERY'])->get();

        foreach ($unlinkedCodOrders as $order) {
            $effectiveDriverId = $order->driver_id ?: $defaultDriverId;

            $settlement = DriverSettlement::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'driver_id' => $effectiveDriverId,
                    'cash_collected' => $order->total,
                    'status' => $order->payment_status === 'PAID' ? 'SETTLED_TO_BANK' : 'DRIVER_COLLECTION_PENDING',
                    'notes' => 'Auto-generated COD field collection ledger for Order #' . $order->id,
                ]
            );

            if (!$settlement->driver_id) {
                $settlement->driver_id = $effectiveDriverId;
                $settlement->save();
            }

            if (!$order->driver_id) {
                $order->driver_id = $effectiveDriverId;
                $order->save();
            }
        }

        // 2. Extract pagination & filtering parameters
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
        $search = trim($request->query('search', ''));
        $status = trim($request->query('status', 'ALL'));

        $currentUser = auth()->user();
        $currentUserId = $currentUser ? $currentUser->id : 0;
        $currentRoles = $currentUser && method_exists($currentUser, 'getRoleNames') ? implode(',', $currentUser->getRoleNames()->toArray()) : 'all';

        $cacheKey = "settlements:u{$currentUserId}:r{$currentRoles}:p{$page}:pp{$perPage}:s{$search}:st{$status}";

        $cachedResponse = Cache::get($cacheKey);
        if ($cachedResponse) {
            $cachedResponse['is_cached'] = true;
            return response()->json($cachedResponse);
        }

        // 3. Build query
        $query = DriverSettlement::with(['order.user', 'driver', 'reconciler'])
            ->orderBy('created_at', 'desc');

        if ($currentUser && method_exists($currentUser, 'hasRole') && $currentUser->hasRole('Logistics Driver')) {
            $query->where('driver_id', $currentUser->id);
        }

        if ($status !== 'ALL' && !empty($status)) {
            $query->where('status', $status);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhereHas('order.user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('driver', function ($dq) use ($search) {
                      $dq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $formattedItems = collect($paginated->items())->map(function ($settlement) {
            return $settlement->toArray();
        })->values()->toArray();

        $responseData = [
            'data' => $formattedItems,
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

        Cache::put($cacheKey, $responseData, 60);

        return response()->json($responseData);
    }

    public function settle(Request $request, $id)
    {
        $settlement = DriverSettlement::findOrFail($id);
        $settlement->status = 'SETTLED_TO_BANK';
        $settlement->reconciled_by = auth()->id() ?? 1;
        $settlement->settled_at = Carbon::now();
        $settlement->save();

        if ($settlement->order) {
            $settlement->order->payment_status = 'PAID';
            $settlement->order->save();
        }

        // Invalidate settlement caches
        $this->clearSettlementCaches();

        return response()->json([
            'message' => 'COD Field collection settled to bank successfully',
            'settlement' => $settlement->load(['order', 'driver', 'reconciler']),
        ]);
    }

    private function clearSettlementCaches()
    {
        try {
            Cache::flush();
            if (config('cache.default') === 'redis') {
                $redis = \Illuminate\Support\Facades\Redis::connection();
                foreach ($redis->keys('*settlements*') as $key) {
                    $redis->del($key);
                }
                foreach ($redis->keys('*report*') as $key) {
                    $redis->del($key);
                }
                foreach ($redis->keys('*orders*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {
            try {
                Cache::flush();
            } catch (\Throwable $ex) {}
        }
    }
}
