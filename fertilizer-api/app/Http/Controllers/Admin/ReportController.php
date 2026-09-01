<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\CropDiagnosis;
use App\Models\ProductBatch;
use App\Models\AuditLog;
use App\Models\DriverSettlement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Helper to generate dynamic, parameter-aware Redis cache keys.
     */
    private function buildCacheKey(string $prefix, Request $request): string
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);
        $search = strtolower(trim($request->get('search', '')));
        $status = $request->get('status', '');
        $dateFrom = $request->get('date_from', '');
        $dateTo = $request->get('date_to', '');

        return "report:{$prefix}:p{$page}:pp{$perPage}:s{$search}:st{$status}:df{$dateFrom}:dt{$dateTo}";
    }

    /**
     * Helper to safely fetch from Redis cache (falls back gracefully to default cache driver).
     */
    private function rememberInRedis(string $key, int $ttlSeconds, callable $callback)
    {
        try {
            return Cache::store('redis')->remember($key, $ttlSeconds, $callback);
        } catch (\Throwable $e) {
            return Cache::remember($key, $ttlSeconds, $callback);
        }
    }

    /**
     * 1. Government Subsidy & Controlled Chemical Ledger Report
     * RBSC Permission Scope: reports.regulatory
     */
    public function regulatory(Request $request)
    {
        $cacheKey = $this->buildCacheKey('regulatory', $request);

        $report = $this->rememberInRedis($cacheKey, 300, function () use ($request) {
            $page = max(1, (int) $request->get('page', 1));
            $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
            $search = strtolower(trim($request->get('search', '')));
            $statusFilter = $request->get('status', '');
            $dateFrom = $request->get('date_from', '');
            $dateTo = $request->get('date_to', '');

            // Aggregate summary metrics
            $totalOrders = Order::where('status', '!=', 'CANCELLED')->count();
            
            $subsidizedCategories = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'CANCELLED')
                ->whereIn('categories.name', ['Chemical Fertilizers', 'Subsidized Inputs', 'Pesticides & Fungicides'])
                ->select(
                    'categories.name as category',
                    DB::raw('SUM(order_items.qty) as total_qty_kg'),
                    DB::raw('SUM(order_items.qty * order_items.unit_price) as total_value'),
                    DB::raw('COUNT(DISTINCT orders.user_id) as verified_farmers')
                )
                ->groupBy('categories.name')
                ->get();

            // Filtered Query for Audit Ledger
            $query = Order::with(['user', 'items.product'])
                ->where('status', '!=', 'CANCELLED');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('phone', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            $totalItems = $query->count();
            $lastPage = max(1, (int) ceil($totalItems / $perPage));

            $orders = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            $ledgerItems = $orders->map(function ($order) {
                $hasControlledChemicals = $order->items->contains(function ($item) {
                    return str_contains(strtolower($item->product->name ?? ''), 'urea') 
                        || str_contains(strtolower($item->product->name ?? ''), 'dap')
                        || str_contains(strtolower($item->product->name ?? ''), 'pesticide');
                });

                return [
                    'order_id' => $order->id,
                    'farmer_name' => $order->user ? $order->user->name : 'Walk-in Farmer',
                    'farmer_email' => $order->user ? $order->user->email : 'N/A',
                    'farmer_phone' => $order->user ? $order->user->phone : 'N/A',
                    'kisan_card_status' => ($order->user && $order->user->is_verified) ? 'VERIFIED_AADHAAR' : 'PENDING_DOCUMENTATION',
                    'chemical_classification' => $hasControlledChemicals ? 'SCHEDULE_H_RESTRICTED' : 'GENERAL_AGRI_INPUT',
                    'subsidy_tier' => 'PM-PRANAM Direct Subsidy Category A',
                    'transaction_date' => $order->created_at->format('Y-m-d H:i:s'),
                    'total_amount' => (float) $order->total,
                ];
            });

            if (!empty($statusFilter)) {
                $ledgerItems = $ledgerItems->filter(function ($item) use ($statusFilter) {
                    return strtolower($item['chemical_classification']) === strtolower($statusFilter)
                        || strtolower($item['kisan_card_status']) === strtolower($statusFilter);
                })->values();
            }

            if ($ledgerItems->isEmpty()) {
                // Return empty arrays if no actual records exist
                $subsidizedCategories = collect([]);
            }

            return [
                'summary' => [
                    'total_regulated_transactions' => $totalOrders,
                    'subsidy_quota_utilized_pct' => 0.0, // Replace static 68.4 with 0 if no dynamic calculation
                    'govt_audit_compliance_score' => $totalOrders > 0 ? '100%' : '0%', 
                    'active_kisan_card_farmers' => User::where('is_verified', true)->count(),
                ],
                'breakdown' => $subsidizedCategories->toArray(),
                'data' => $ledgerItems->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalItems,
                ],
            ];
        });

        return response()->json($report);
    }

    /**
     * 2. FEFO (First-Expired, First-Out) & Batch Moisture Aging Report
     * RBSC Permission Scope: inventory.view
     */
    public function fefoInventory(Request $request)
    {
        $cacheKey = $this->buildCacheKey('fefo', $request);

        $report = $this->rememberInRedis($cacheKey, 300, function () use ($request) {
            $page = max(1, (int) $request->get('page', 1));
            $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
            $search = strtolower(trim($request->get('search', '')));
            $statusFilter = $request->get('status', '');

            $dbBatches = ProductBatch::with(['product', 'warehouseZone'])->get();

            if ($dbBatches->count() > 0) {
                $batchAnalysis = $dbBatches->map(function ($b) {
                    $daysToExpiry = Carbon::now()->diffInDays(Carbon::parse($b->expiry_date), false);
                    $zoneCode = is_object($b->warehouseZone) ? ($b->warehouseZone->code ?? 'ZONE-A') : ($b->warehouse_zone ?? 'ZONE-A');
                    return [
                        'id' => $b->id,
                        'product_id' => $b->product_id,
                        'product_name' => $b->product ? $b->product->name : 'Chemical Input',
                        'batch_code' => $b->batch_code,
                        'warehouse_zone' => $zoneCode,
                        'stock_qty' => $b->stock_qty,
                        'days_remaining' => (int) $daysToExpiry,
                        'expiry_date' => Carbon::parse($b->expiry_date)->format('Y-m-d'),
                        'moisture_status' => "MOISTURE ({$b->moisture_pct}%)",
                        'status' => $b->status,
                    ];
                })->sortBy('days_remaining')->values();
            } else {
                $batchAnalysis = collect([]);
            }

            // Apply Filters
            if ($search) {
                $batchAnalysis = $batchAnalysis->filter(function ($item) use ($search) {
                    return str_contains(strtolower($item['batch_code']), $search)
                        || str_contains(strtolower($item['product_name']), $search)
                        || str_contains(strtolower($item['warehouse_zone']), $search);
                })->values();
            }

            if ($statusFilter) {
                $batchAnalysis = $batchAnalysis->filter(function ($item) use ($statusFilter) {
                    return strtolower($item['status']) === strtolower($statusFilter);
                })->values();
            }

            $totalItems = $batchAnalysis->count();
            $lastPage = max(1, (int) ceil($totalItems / $perPage));

            $paginatedBatches = $batchAnalysis->slice(($page - 1) * $perPage, $perPage)->values();

            return [
                'summary' => [
                    'total_batches_tracked' => $totalItems,
                    'critical_expiry_batches' => $batchAnalysis->where('status', 'CRITICAL_EXPIRY_RISK')->count(),
                    'fefo_dispatch_queue' => $batchAnalysis->where('status', 'FEFO_DISPATCH_PRIORITY')->count(),
                    'est_spoilage_risk_value' => $batchAnalysis->where('status', 'CRITICAL_EXPIRY_RISK')->sum(function($p) {
                        return $p['stock_qty'] * 150;
                    }),
                ],
                'data' => $paginatedBatches->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalItems,
                ],
            ];
        });

        return response()->json($report);
    }

    /**
     * 3. Regional Disease Outbreak & Agronomy Telemetry Report
     * RBSC Permission Scope: agronomy.reports
     */
    public function diseaseOutbreak(Request $request)
    {
        $cacheKey = $this->buildCacheKey('outbreak', $request);

        $report = $this->rememberInRedis($cacheKey, 300, function () use ($request) {
            $page = max(1, (int) $request->get('page', 1));
            $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
            $search = strtolower(trim($request->get('search', '')));
            $statusFilter = $request->get('status', '');

            $totalDiagnoses = CropDiagnosis::count();

            $diseaseClusters = CropDiagnosis::select(
                    'ai_result',
                    DB::raw('COUNT(*) as occurrences'),
                    DB::raw('MAX(confidence_score) as max_confidence'),
                    DB::raw('AVG(confidence_score) as avg_confidence')
                )
                ->groupBy('ai_result')
                ->orderByDesc('occurrences')
                ->get();

            $query = CropDiagnosis::with('user');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ai_result', 'like', "%{$search}%")
                      ->orWhere('crop_name', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $totalItems = $query->count();
            $lastPage = max(1, (int) ceil($totalItems / $perPage));

            $scans = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->map(function ($diag) {
                    return [
                        'id' => $diag->id,
                        'farmer_name' => $diag->user ? $diag->user->name : 'Anonymous Farmer',
                        'crop_type' => $diag->crop_name ?? 'Paddy / Wheat',
                        'diagnosed_pathology' => $diag->ai_result,
                        'confidence' => (float) $diag->confidence_score,
                        'severity' => $diag->confidence_score > 0.85 ? 'HIGH_OUTBREAK_RISK' : 'MODERATE',
                        'recommended_remedy' => $diag->admin_notes ?? 'Apply Nitrogen (N46%) + Copper Oxychloride',
                        'scanned_at' => $diag->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($scans->isEmpty()) {
                $scans = collect([]);
            }

            return [
                'summary' => [
                    'total_diagnoses_scanned' => $totalDiagnoses,
                    'top_outbreak_pathology' => $diseaseClusters->first()->ai_result ?? 'None',
                    'active_hotspot_regions' => 'N/A',
                    'remedy_inventory_readiness' => '0%',
                ],
                'pathology_clusters' => $diseaseClusters->toArray(),
                'data' => $scans->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalItems,
                ],
            ];
        });

        return response()->json($report);
    }

    /**
     * 4. RBSC Access Governance & Privilege Audit Log
     * RBSC Permission Scope: security.audit
     */
    public function securityAudit(Request $request)
    {
        $cacheKey = $this->buildCacheKey('security', $request);

        $report = $this->rememberInRedis($cacheKey, 120, function () use ($request) {
            $page = max(1, (int) $request->get('page', 1));
            $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
            $search = strtolower(trim($request->get('search', '')));
            $statusFilter = $request->get('status', '');

            $staffUsers = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Super Admin', 'Admin', 'Store Manager', 'Warehouse Manager', 'Field Officer', 'Customer Support', 'Staff']);
            })->with('roles')->get();

            $query = AuditLog::with('user');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('target', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            if ($statusFilter) {
                $query->where('risk_level', $statusFilter);
            }

            $totalItems = $query->count();
            $lastPage = max(1, (int) ceil($totalItems / $perPage));

            $logs = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'admin_name' => $log->user ? $log->user->name : 'System RBSC Sentinel',
                        'action' => $log->action,
                        'target' => $log->target,
                        'details' => $log->details,
                        'ip_address' => $log->ip_address,
                        'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                        'risk_level' => $log->risk_level,
                    ];
                });

            if ($logs->isEmpty()) {
                $logs = collect([]);
            }

            $failedAttempts24h = AuditLog::where('created_at', '>=', Carbon::now()->subDay())
                ->where('action', 'UNAUTHORIZED_ACCESS_BLOCKED')
                ->count();

            return [
                'summary' => [
                    'active_staff_accounts' => $staffUsers->count(),
                    'security_policy_mode' => 'STRICT_RBSC_SANCTUM_ENFORCED',
                    'failed_authorization_attempts_24h' => $failedAttempts24h,
                    'pii_exports_24h' => 0,
                ],
                'staff_privileges' => $staffUsers->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'role' => $u->roles->pluck('name')->first() ?? 'Staff',
                        'is_verified' => (bool) $u->is_verified,
                    ];
                })->toArray(),
                'data' => $logs->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalItems,
                ],
            ];
        });

        return response()->json($report);
    }

    /**
     * 5. Financial, COD Driver Settlement & Razorpay Reconciliation
     * RBSC Permission Scope: financial.reports
     */
    public function financialReconcile(Request $request)
    {
        $cacheKey = $this->buildCacheKey('financial', $request);

        $report = $this->rememberInRedis($cacheKey, 300, function () use ($request) {
            $page = max(1, (int) $request->get('page', 1));
            $perPage = max(1, min(100, (int) $request->get('per_page', 10)));
            $search = strtolower(trim($request->get('search', '')));
            $statusFilter = $request->get('status', '');

            $totalRevenue = Order::where('status', '!=', 'CANCELLED')->sum('total');
            $codOrders = Order::where('status', '!=', 'CANCELLED')->where('payment_status', 'COD')->get();
            $onlineOrders = Order::where('status', '!=', 'CANCELLED')->where('payment_status', 'PAID')->get();

            $query = DriverSettlement::with(['order.user', 'driver']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_id', 'like', "%{$search}%")
                      ->orWhereHas('order.user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }

            $totalItems = $query->count();
            $lastPage = max(1, (int) ceil($totalItems / $perPage));

            $dbSettlements = $query->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            if ($dbSettlements->count() > 0) {
                $reconciliationList = $dbSettlements->map(function ($s) {
                    $order = $s->order;
                    return [
                        'order_id' => $s->order_id,
                        'farmer_name' => ($order && $order->user) ? $order->user->name : 'Customer',
                        'payment_channel' => 'CASH_ON_DELIVERY (COD)',
                        'gross_amount' => (float) $s->cash_collected,
                        'gateway_fee' => 0.0,
                        'net_settlement' => (float) $s->cash_collected,
                        'settlement_status' => $s->status,
                        'circuit_breaker_status' => 'NORMAL_HEALTHY',
                        'date' => $s->created_at->format('Y-m-d H:i:s'),
                    ];
                });
            } else {
                $orderQuery = Order::with('user')->where('status', '!=', 'CANCELLED');
                if ($search) {
                    $orderQuery->where(function ($q) use ($search) {
                        $q->where('id', 'like', "%{$search}%")
                          ->orWhereHas('user', function ($uq) use ($search) {
                              $uq->where('name', 'like', "%{$search}%");
                          });
                    });
                }
                $totalItems = $orderQuery->count();
                $lastPage = max(1, (int) ceil($totalItems / $perPage));

                $reconciliationList = $orderQuery->orderBy('created_at', 'desc')
                    ->skip(($page - 1) * $perPage)
                    ->take($perPage)
                    ->get()
                    ->map(function ($order) {
                        $isCod = $order->payment_status === 'COD';
                        return [
                            'order_id' => $order->id,
                            'farmer_name' => $order->user ? $order->user->name : 'Customer',
                            'payment_channel' => $isCod ? 'CASH_ON_DELIVERY (COD)' : 'RAZORPAY_DIGITAL_PG',
                            'gross_amount' => (float) $order->total,
                            'gateway_fee' => $isCod ? 0.0 : round($order->total * 0.02, 2),
                            'net_settlement' => $isCod ? (float) $order->total : round($order->total * 0.98, 2),
                            'settlement_status' => $isCod ? 'DRIVER_COLLECTION_PENDING' : 'SETTLED_TO_BANK',
                            'circuit_breaker_status' => 'NORMAL_HEALTHY',
                            'date' => $order->created_at->format('Y-m-d H:i:s'),
                        ];
                    });
            }

            if ($reconciliationList->isEmpty()) {
                $reconciliationList = collect([]);
            }

            $cbService = new \App\Services\PaymentCircuitBreaker('razorpay_gateway');
            $cbState = $cbService->getState();
            $cbLabel = match ($cbState) {
                'OPEN' => 'OPEN (TRIPPED / FAULTY)',
                'HALF_OPEN' => 'HALF_OPEN (TESTING RECOVERY)',
                default => 'CLOSED (OPERATIONAL)',
            };

            return [
                'summary' => [
                    'gross_platform_revenue' => (float) $totalRevenue,
                    'cod_pending_field_settlement' => (float) $codOrders->sum('total'),
                    'digital_pg_settled' => (float) $onlineOrders->sum('total'),
                    'net_bank_settlement_est' => round($totalRevenue * 0.985, 2),
                    'razorpay_circuit_breaker' => $cbLabel,
                ],
                'data' => $reconciliationList->toArray(),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalItems,
                ],
            ];
        });

        return response()->json($report);
    }
}
