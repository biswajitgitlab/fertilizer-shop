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

        // Seed initial notifications if needed
        $this->ensureInitialAdminNotifications();

        // Leverage Redis caching for notification list (TTL 15 seconds to handle high-frequency 30s polling)
        $cacheKey = "admin_notifications_{$admin->id}_v2";

        $responsePayload = Cache::remember($cacheKey, 15, function () use ($admin, $effectivePermissions, $isSuperAdmin, $readByArray) {
            // 1. Fetch persistent database notifications matching Admin RBSC (Role-Based Scope Control)
            $persistentQuery = Notification::where(function ($query) use ($admin, $effectivePermissions, $isSuperAdmin) {
                $query->where('admin_id', $admin->id);

                if ($isSuperAdmin) {
                    $query->orWhere(function ($q) {
                        $q->whereNull('user_id')->whereNotNull('required_permission');
                    });
                } else {
                    $query->orWhere(function ($q) use ($effectivePermissions) {
                        $q->whereNull('user_id')
                          ->whereIn('required_permission', $effectivePermissions);
                    });
                }
            });

            $dbNotifications = $persistentQuery->latest()->take(30)->get();

            $formattedList = [];

            foreach ($dbNotifications as $item) {
                $readAdmins = is_array($item->read_by_admins) ? $item->read_by_admins : [];
                $isRead = !is_null($item->read_at) || in_array($admin->id, $readAdmins) || in_array("db_{$item->id}", $readByArray);

                $formattedList[] = [
                    'id' => "db_{$item->id}",
                    'numeric_id' => $item->id,
                    'title' => $item->title,
                    'message' => $item->body,
                    'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Just now',
                    'timestamp' => $item->created_at ? $item->created_at->toISOString() : now()->toISOString(),
                    'type' => $item->type,
                    'unread' => !$isRead,
                    'link' => $item->link ?: '/admin/dashboard',
                    'required_permission' => $item->required_permission ?: 'general',
                    'is_persistent' => true,
                ];
            }

            // 2. Dynamically compute live real-time system alerts based on current DB state & Admin RBSC
            $liveAlerts = $this->generateLiveSystemAlerts($admin, $effectivePermissions, $isSuperAdmin, $readByArray);

            // Merge DB notifications + Live system alerts
            $allNotifications = array_merge($formattedList, $liveAlerts);

            // Sort by timestamp descending
            usort($allNotifications, function ($a, $b) {
                return strcmp($b['timestamp'], $a['timestamp']);
            });

            $unreadCount = count(array_filter($allNotifications, fn($n) => $n['unread']));

            return [
                'notifications' => array_values($allNotifications),
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

        // Ensure live read status state is synced even if main list was cached
        $notifications = $responsePayload['notifications'] ?? [];
        foreach ($notifications as &$n) {
            if (in_array($n['id'], $readByArray)) {
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
     * Mark single notification as read for current admin staff and invalidate Redis cache.
     */
    public function markAsRead(Request $request, $id)
    {
        $admin = $request->user();

        if (str_starts_with($id, 'db_')) {
            $numericId = (int) str_replace('db_', '', $id);
            $notification = Notification::find($numericId);
            if ($notification) {
                $readAdmins = is_array($notification->read_by_admins) ? $notification->read_by_admins : [];
                if (!in_array($admin->id, $readAdmins)) {
                    $readAdmins[] = $admin->id;
                    $notification->update([
                        'read_by_admins' => $readAdmins,
                        'read_at' => now(),
                    ]);
                }
            }
        }

        // Store read ID in Redis for fast access
        CacheMarkAdminReadId($admin->id, $id);

        // Invalidate Redis Notification Cache for this admin
        Cache::forget("admin_notifications_{$admin->id}_v2");

        return response()->json(['message' => 'Notification marked as read.', 'id' => $id]);
    }

    /**
     * POST /api/admin/notifications/read-all
     * Mark all notifications as read for current admin staff and flush Redis cache.
     */
    public function markAllAsRead(Request $request)
    {
        $admin = $request->user();

        // Update persistent DB notifications for this admin or matching permissions
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
                $item->update(['read_by_admins' => $readAdmins, 'read_at' => now()]);
                CacheMarkAdminReadId($admin->id, "db_{$item->id}");
            }
        }

        // Cache global mark-all timestamp in Redis for live dynamic alerts
        Cache::put("admin_read_all_{$admin->id}", now()->timestamp, 86400 * 7);

        // Invalidate Redis Notification Cache
        Cache::forget("admin_notifications_{$admin->id}_v2");

        return response()->json(['message' => 'All system notifications marked as read.']);
    }

    /**
     * Helper to generate live system alerts scoped by admin permissions (RBSC).
     */
    private function generateLiveSystemAlerts($admin, array $effectivePermissions, bool $isSuperAdmin, array $readByArray): array
    {
        $alerts = [];
        $readAllTs = Cache::get("admin_read_all_{$admin->id}", 0);

        // Scope 1: Inventory Management (inventory.view / inventory.update_stock / products.edit)
        if ($isSuperAdmin || in_array('inventory.view', $effectivePermissions) || in_array('products.edit', $effectivePermissions)) {
            $lowStockProducts = Product::where('stock', '<=', 10)->get();
            foreach ($lowStockProducts as $prod) {
                $id = "live_inv_{$prod->id}";
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0);

                $alerts[] = [
                    'id' => $id,
                    'title' => 'Low Inventory Warning',
                    'message' => "{$prod->name} stock level is down to {$prod->stock} units.",
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

        // Scope 2: Orders & Sales Fulfillment (orders.view / orders.update_status)
        if ($isSuperAdmin || in_array('orders.view', $effectivePermissions)) {
            $recentOrders = Order::latest()->take(5)->get();
            foreach ($recentOrders as $ord) {
                $id = "live_ord_{$ord->id}";
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0);
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

        // Scope 3: Agri AI Crop Diagnoses (diagnoses.view / diagnoses.review)
        if ($isSuperAdmin || in_array('diagnoses.view', $effectivePermissions) || in_array('diagnoses.review', $effectivePermissions)) {
            $pendingDiagnoses = CropDiagnosis::where('admin_reviewed', false)->orWhere('status', 'PENDING')->latest()->take(3)->get();
            foreach ($pendingDiagnoses as $diag) {
                $id = "live_diag_{$diag->id}";
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0);

                $alerts[] = [
                    'id' => $id,
                    'title' => 'Crop Scan Review Required',
                    'message' => "New scan submitted for {$diag->crop} ({$diag->growth_stage ?: 'Unspecified stage'}). Requires Agronomist review.",
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

        // Scope 4: Team & Staff Management (roles.manage / users.manage)
        if ($isSuperAdmin || in_array('roles.manage', $effectivePermissions) || in_array('users.manage', $effectivePermissions)) {
            $unverifiedAdmins = Admin::where('is_verified', false)->get();
            foreach ($unverifiedAdmins as $unvAdmin) {
                $id = "live_user_{$unvAdmin->id}";
                $isRead = in_array($id, $readByArray) || ($readAllTs > 0);

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
            'message' => 'Bio-Vita Seaweed Kelp Booster stock dropped below safety reorder threshold (4 units remaining).',
            'link' => '/admin/inventory',
            'created_at' => now()->subMinutes(15),
        ]);

        Notification::create([
            'required_permission' => 'orders.view',
            'type' => 'order',
            'title' => 'High-Value Wholesale Order',
            'message' => 'Wholesale Order #ORD-761923 (₹1,012) confirmed by Sukhwinder Singh via Online Payment.',
            'link' => '/admin/orders',
            'created_at' => now()->subMinutes(45),
        ]);

        Notification::create([
            'required_permission' => 'diagnoses.view',
            'type' => 'diagnosis',
            'title' => 'Paddy Blast Scan Submitted',
            'message' => 'Farmer Ramesh submitted Paddy Leaf Blast scan for expert agronomist verification.',
            'link' => '/admin/diagnoses',
            'created_at' => now()->subHours(2),
        ]);

        Notification::create([
            'required_permission' => 'roles.manage',
            'type' => 'user',
            'title' => 'New Role Assignment Audit',
            'message' => 'Store Manager role permissions were updated for regional branch personnel.',
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
            $readIds[] = $notifId;
            Cache::put("admin_read_ids_{$adminId}", $readIds, 86400 * 7);
        }
    }
}
