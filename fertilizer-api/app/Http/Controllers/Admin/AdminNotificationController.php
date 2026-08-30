<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\CropDiagnosis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminNotificationController extends Controller
{
    /**
     * GET /api/admin/notifications
     * Retrieve role-based scoped notifications for the authenticated admin staff with Redis caching.
     */
    public function index(Request $request)
    {
        $admin = $request->user();

        if (!$admin || get_class($admin) !== Admin::class) {
            return response()->json(['message' => 'Unauthorized admin access.'], 401);
        }

        $effectivePermissions = $admin->getEffectivePermissions();
        $isSuperAdmin = $admin->hasRole(['Super Admin', 'Admin']) || in_array('roles.manage', $effectivePermissions);
        $readByArray = CacheGetAdminReadIds($admin->id);
        $readAllTs = (int) Cache::get("admin_read_all_{$admin->id}", 0);

        // Seed initial notifications if needed
        $this->ensureInitialAdminNotifications();

        // Leverage Redis caching for notification list (TTL 15 seconds)
        $cacheKey = "admin_notifications_{$admin->id}_v2";

        $responsePayload = Cache::remember($cacheKey, 15, function () use ($admin, $effectivePermissions, $isSuperAdmin, $readByArray, $readAllTs) {
            // 1. Fetch persistent database notifications matching Admin RBSC
            $persistentQuery = Notification::where(function ($query) use ($admin, $effectivePermissions, $isSuperAdmin) {
                $query->where('admin_id', $admin->id);

                if ($isSuperAdmin) {
                    $query->orWhere(function ($q) {
                        $q->whereNull('user_id');
                    });
                } else {
                    $query->orWhere(function ($q) use ($effectivePermissions) {
                        $q->whereNull('user_id')
                          ->where(function ($permQuery) use ($effectivePermissions) {
                              $permQuery->whereNull('required_permission')
                                        ->orWhereIn('required_permission', $effectivePermissions);
                          });
                    });
                }
            });

            $dbNotifications = $persistentQuery->latest()->take(30)->get();
            $formattedList = [];

            foreach ($dbNotifications as $item) {
                $readAdmins = is_array($item->read_by_admins) ? $item->read_by_admins : [];
                $itemTs = $item->created_at ? $item->created_at->timestamp : now()->timestamp;

                $isRead = in_array($admin->id, $readAdmins)
                    || in_array("db_{$item->id}", $readByArray)
                    || in_array((string)$item->id, $readByArray)
                    || ($readAllTs > 0 && $itemTs <= $readAllTs)
                    || ($item->admin_id === $admin->id && !is_null($item->read_at));

                $formattedList[] = [
                    'id' => "db_{$item->id}",
                    'numeric_id' => $item->id,
                    'title' => $item->title,
                    'message' => $item->body,
                    'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Just now',
                    'timestamp' => $item->created_at ? $item->created_at->toISOString() : now()->toISOString(),
                    'type' => $item->type ?: 'info',
                    'unread' => !$isRead,
                    'link' => $item->link ?: '/admin/dashboard',
                    'required_permission' => $item->required_permission ?: 'general',
                    'is_persistent' => true,
                ];
            }

            // 2. Compute dynamic live real-time system alerts
            $liveAlerts = $this->generateLiveSystemAlerts($admin, $effectivePermissions, $isSuperAdmin, $readByArray, $readAllTs);

            // Merge DB notifications + Live system alerts
            $allNotifications = array_merge($formattedList, $liveAlerts);

            // Deduplicate by string ID if any overlap
            $uniqueNotifications = [];
            $seenIds = [];
            foreach ($allNotifications as $n) {
                if (!in_array($n['id'], $seenIds)) {
                    $seenIds[] = $n['id'];
                    $uniqueNotifications[] = $n;
                }
            }

            // Sort by timestamp descending
            usort($uniqueNotifications, function ($a, $b) {
                return strcmp($b['timestamp'], $a['timestamp']);
            });

            $unreadCount = count(array_filter($uniqueNotifications, fn($n) => $n['unread']));

            return [
                'notifications' => array_values($uniqueNotifications),
                'unread_count' => $unreadCount,
                'cached_via_redis' => true,
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'role' => $admin->role ?: 'Admin',
                    'is_super_admin' => $isSuperAdmin,
                    'effective_permissions' => $effectivePermissions,
                ]
            ];
        });

        // Dynamic post-processing: sync read status even if payload came from Redis cache memory
        $notifications = $responsePayload['notifications'] ?? [];
        $freshReadByArray = CacheGetAdminReadIds($admin->id);
        $freshReadAllTs = (int) Cache::get("admin_read_all_{$admin->id}", 0);

        foreach ($notifications as &$n) {
            $numId = str_replace('db_', '', $n['id']);
            $nTs = strtotime($n['timestamp']);

            if (
                in_array($n['id'], $freshReadByArray) ||
                in_array($numId, $freshReadByArray) ||
                ($freshReadAllTs > 0 && $nTs > 0 && $nTs <= $freshReadAllTs)
            ) {
                $n['unread'] = false;
            }
        }

        $unreadCount = count(array_filter($notifications, fn($n) => $n['unread']));
        $responsePayload['notifications'] = $notifications;
        $responsePayload['unread_count'] = $unreadCount;

        return response()->json($responsePayload);
    }

    /**
     * POST /api/admin/notifications/{id}/read
     * Mark single notification as read for current admin staff and update Redis state.
     */
    public function markAsRead(Request $request, $id)
    {
        $admin = $request->user();
        $strId = (string) $id;

        // Extract numeric ID if database notification
        $numericId = null;
        if (str_starts_with($strId, 'db_')) {
            $numericId = (int) str_replace('db_', '', $strId);
        } elseif (is_numeric($strId)) {
            $numericId = (int) $strId;
        }

        if ($numericId) {
            $notification = Notification::find($numericId);
            if ($notification) {
                $readAdmins = is_array($notification->read_by_admins) ? $notification->read_by_admins : [];
                if (!in_array($admin->id, $readAdmins)) {
                    $readAdmins[] = $admin->id;
                    
                    $updateData = ['read_by_admins' => $readAdmins];
                    if ($notification->admin_id === $admin->id) {
                        $updateData['read_at'] = now();
                    }

                    $notification->update($updateData);
                }
            }
        }

        // Store read IDs in Redis for instant read status resolution
        CacheMarkAdminReadId($admin->id, $strId);
        if ($numericId) {
            CacheMarkAdminReadId($admin->id, "db_{$numericId}");
            CacheMarkAdminReadId($admin->id, (string)$numericId);
        }

        // Invalidate Redis Notification Cache for this admin
        Cache::forget("admin_notifications_{$admin->id}_v2");
        Cache::forget("admin_notifications_{$admin->id}");

        return response()->json(['message' => 'Notification marked as read.', 'id' => $strId]);
    }

    /**
     * POST /api/admin/notifications/read-all
     * Mark all notifications as read for current admin staff and flush Redis cache.
     */
    public function markAllAsRead(Request $request)
    {
        $admin = $request->user();

        $effectivePermissions = $admin->getEffectivePermissions();
        $isSuperAdmin = $admin->hasRole(['Super Admin', 'Admin']) || in_array('roles.manage', $effectivePermissions);

        $dbNotifications = Notification::where(function ($query) use ($admin, $effectivePermissions, $isSuperAdmin) {
            $query->where('admin_id', $admin->id);
            if ($isSuperAdmin) {
                $query->orWhereNull('user_id');
            } else {
                $query->orWhereIn('required_permission', $effectivePermissions);
            }
        })->get();

        foreach ($dbNotifications as $item) {
            $readAdmins = is_array($item->read_by_admins) ? $item->read_by_admins : [];
            if (!in_array($admin->id, $readAdmins)) {
                $readAdmins[] = $admin->id;
                
                $updateData = ['read_by_admins' => $readAdmins];
                if ($item->admin_id === $admin->id) {
                    $updateData['read_at'] = now();
                }

                $item->update($updateData);
            }
            CacheMarkAdminReadId($admin->id, "db_{$item->id}");
            CacheMarkAdminReadId($admin->id, (string)$item->id);
        }

        // Store global mark-all timestamp in Redis for live dynamic alerts filtering
        Cache::put("admin_read_all_{$admin->id}", now()->timestamp, 86400 * 7);

        // Invalidate Redis Notification Cache
        Cache::forget("admin_notifications_{$admin->id}_v2");
        Cache::forget("admin_notifications_{$admin->id}");

        return response()->json(['message' => 'All system notifications marked as read.']);
    }

    /**
     * Helper to generate live system alerts scoped by admin permissions (RBSC).
     */
    private function generateLiveSystemAlerts($admin, array $effectivePermissions, bool $isSuperAdmin, array $readByArray, int $readAllTs): array
    {
        $alerts = [];

        // Scope 1: Inventory Management
        if ($isSuperAdmin || in_array('inventory.view', $effectivePermissions) || in_array('products.edit', $effectivePermissions)) {
            $lowStockProducts = Product::where('stock_qty', '<=', 10)->get();
            foreach ($lowStockProducts as $prod) {
                $id = "live_inv_{$prod->id}";
                $itemTs = $prod->updated_at ? $prod->updated_at->timestamp : now()->timestamp;
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0 && $itemTs <= $readAllTs);

                $alerts[] = [
                    'id' => $id,
                    'title' => 'Low Inventory Warning',
                    'message' => "{$prod->name} stock level is down to {$prod->stock_qty} units.",
                    'time' => $prod->updated_at ? $prod->updated_at->diffForHumans() : 'Active Alert',
                    'timestamp' => $prod->updated_at ? $prod->updated_at->toISOString() : now()->toISOString(),
                    'type' => 'warning',
                    'unread' => !$isRead,
                    'link' => '/admin/inventory',
                    'required_permission' => 'inventory.view',
                    'is_persistent' => false,
                ];
            }
        }

        // Scope 2: Orders & Sales Fulfillment
        if ($isSuperAdmin || in_array('orders.view', $effectivePermissions)) {
            $recentOrders = Order::latest()->take(5)->get();
            foreach ($recentOrders as $ord) {
                $id = "live_ord_{$ord->id}";
                $itemTs = $ord->created_at ? $ord->created_at->timestamp : now()->timestamp;
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0 && $itemTs <= $readAllTs);
                $customer = $ord->shipping_address_json['name'] ?? 'Customer';

                $alerts[] = [
                    'id' => $id,
                    'title' => "Order #{$ord->order_number} Received",
                    'message' => "Order of ₹{$ord->total} received from {$customer}. Status: {$ord->status}.",
                    'time' => $ord->created_at ? $ord->created_at->diffForHumans() : 'Recent Order',
                    'timestamp' => $ord->created_at ? $ord->created_at->toISOString() : now()->toISOString(),
                    'type' => 'order',
                    'unread' => !$isRead,
                    'link' => "/admin/orders",
                    'required_permission' => 'orders.view',
                    'is_persistent' => false,
                ];
            }
        }

        // Scope 3: Agri AI Crop Diagnoses
        if ($isSuperAdmin || in_array('diagnoses.view', $effectivePermissions) || in_array('diagnoses.review', $effectivePermissions)) {
            $pendingDiagnoses = CropDiagnosis::where('admin_reviewed', false)->orWhere('status', 'PENDING')->latest()->take(3)->get();
            foreach ($pendingDiagnoses as $diag) {
                $id = "live_diag_{$diag->id}";
                $itemTs = $diag->created_at ? $diag->created_at->timestamp : now()->timestamp;
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0 && $itemTs <= $readAllTs);
                $crop = $diag->crop_name ?? $diag->crop ?? 'Crop';
                $stage = $diag->growth_stage ?: 'Unspecified stage';

                $alerts[] = [
                    'id' => $id,
                    'title' => 'Crop Scan Review Required',
                    'message' => "New scan submitted for {$crop} ({$stage}). Requires Agronomist review.",
                    'time' => $diag->created_at ? $diag->created_at->diffForHumans() : 'Pending Review',
                    'timestamp' => $diag->created_at ? $diag->created_at->toISOString() : now()->toISOString(),
                    'type' => 'diagnosis',
                    'unread' => !$isRead,
                    'link' => '/admin/diagnoses',
                    'required_permission' => 'diagnoses.view',
                    'is_persistent' => false,
                ];
            }
        }

        // Scope 4: Team & Staff Management
        if ($isSuperAdmin || in_array('roles.manage', $effectivePermissions) || in_array('users.manage', $effectivePermissions)) {
            $unverifiedAdmins = Admin::where('is_verified', false)->get();
            foreach ($unverifiedAdmins as $unvAdmin) {
                $id = "live_user_{$unvAdmin->id}";
                $itemTs = $unvAdmin->created_at ? $unvAdmin->created_at->timestamp : now()->timestamp;
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0 && $itemTs <= $readAllTs);

                $alerts[] = [
                    'id' => $id,
                    'title' => 'Staff Verification Pending',
                    'message' => "Internal staff member {$unvAdmin->name} ({$unvAdmin->email}) is awaiting role verification.",
                    'time' => $unvAdmin->created_at ? $unvAdmin->created_at->diffForHumans() : 'Pending Action',
                    'timestamp' => $unvAdmin->created_at ? $unvAdmin->created_at->toISOString() : now()->toISOString(),
                    'type' => 'user',
                    'unread' => !$isRead,
                    'link' => '/admin/users',
                    'required_permission' => 'roles.manage',
                    'is_persistent' => false,
                ];
            }
        }

        return $alerts;
    }

    /**
     * Ensure initial seed data exists for demonstration.
     */
    private function ensureInitialAdminNotifications()
    {
        if (Notification::whereNull('user_id')->count() > 0) {
            return;
        }

        Notification::create([
            'required_permission' => 'inventory.view',
            'type' => 'warning',
            'title' => 'Critical Warehouse Stock Alert',
            'body' => 'Bio-Vita Seaweed Kelp Booster stock dropped below safety reorder threshold (4 units remaining).',
            'link' => '/admin/inventory',
            'created_at' => now()->subMinutes(15),
        ]);

        Notification::create([
            'required_permission' => 'orders.view',
            'type' => 'order',
            'title' => 'High-Value Wholesale Order',
            'body' => 'Wholesale Order #ORD-761923 (₹1,012) confirmed by Sukhwinder Singh via Online Payment.',
            'link' => '/admin/orders',
            'created_at' => now()->subMinutes(45),
        ]);

        Notification::create([
            'required_permission' => 'diagnoses.view',
            'type' => 'diagnosis',
            'title' => 'Paddy Blast Scan Submitted',
            'body' => 'Farmer Ramesh submitted Paddy Leaf Blast scan for expert agronomist verification.',
            'link' => '/admin/diagnoses',
            'created_at' => now()->subHours(2),
        ]);

        Notification::create([
            'required_permission' => 'roles.manage',
            'type' => 'user',
            'title' => 'New Role Assignment Audit',
            'body' => 'Store Manager role permissions were updated for regional branch personnel.',
            'link' => '/admin/roles',
            'created_at' => now()->subHours(5),
        ]);
    }
}

// Global Helper functions for Redis/Cache Read Status tracking
if (!function_exists('CacheGetAdminReadIds')) {
    function CacheGetAdminReadIds($adminId): array
    {
        return Cache::get("admin_read_ids_{$adminId}", []);
    }
}

if (!function_exists('CacheMarkAdminReadId')) {
    function CacheMarkAdminReadId($adminId, $notifId): void
    {
        $readIds = CacheGetAdminReadIds($adminId);
        if (!in_array($notifId, $readIds)) {
            $readIds[] = (string) $notifId;
            Cache::put("admin_read_ids_{$adminId}", array_values(array_unique($readIds)), 86400 * 7);
        }
    }
}
