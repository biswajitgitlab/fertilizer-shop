<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\CropDiagnosis;
use App\Models\Admin;
use App\Models\Coupon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Core method to store a persistent notification and trigger Redis caching/events.
     */
    public static function createNotification(array $data): Notification
    {
        $notification = Notification::create([
            'user_id' => $data['user_id'] ?? null,
            'admin_id' => $data['admin_id'] ?? null,
            'required_permission' => $data['required_permission'] ?? null,
            'type' => $data['type'] ?? 'info',
            'title' => $data['title'],
            'body' => $data['body'] ?? $data['message'] ?? '',
            'link' => $data['link'] ?? null,
            'data_json' => $data['data_json'] ?? null,
            'read_by_admins' => [],
            'read_at' => null,
        ]);

        // Redis Step 1: Invalidate Notification Caches
        if (!empty($data['user_id'])) {
            self::clearUserNotificationCache($data['user_id']);
        } else {
            self::clearAllAdminNotificationCaches();
        }

        // Redis Step 2: Publish real-time notification event via Redis Pub/Sub / Stream
        try {
            $payload = json_encode([
                'event' => 'notification.created',
                'id' => "db_{$notification->id}",
                'title' => $notification->title,
                'message' => $notification->body,
                'type' => $notification->type,
                'link' => $notification->link,
                'required_permission' => $notification->required_permission,
                'user_id' => $notification->user_id,
                'admin_id' => $notification->admin_id,
                'created_at' => $notification->created_at ? $notification->created_at->toISOString() : now()->toISOString(),
            ]);

            Redis::publish('notifications:channel', $payload);
        } catch (\Exception $e) {
            Log::info("Redis Publish skipped or optional: " . $e->getMessage());
        }

        return $notification;
    }

    /**
     * CASE 1: Order Created Trigger
     * Notifies customer and staff with 'orders.view' permission.
     */
    public static function notifyOrderCreated(Order $order): void
    {
        // 1. Customer Notification
        if ($order->user_id) {
            self::createNotification([
                'user_id' => $order->user_id,
                'type' => 'order',
                'title' => "Order #{$order->order_number} Confirmed",
                'body' => "Your order of ₹{$order->total} has been received successfully. Track progress in your portal.",
                'link' => "/orders/{$order->id}",
            ]);
        }

        // 2. Admin Staff Notification (orders.view)
        $customerName = $order->shipping_address_json['name'] ?? ($order->user->name ?? 'Customer');
        self::createNotification([
            'required_permission' => 'orders.view',
            'type' => 'order',
            'title' => "New Order #{$order->order_number} Received",
            'body' => "Order of ₹{$order->total} received from {$customerName}. Payment: {$order->payment_method}.",
            'link' => "/admin/orders",
            'data_json' => ['order_id' => $order->id, 'amount' => $order->total]
        ]);
    }

    /**
     * CASE 2: Order Status Updated Trigger
     */
    public static function notifyOrderStatusUpdated(Order $order, string $oldStatus = ''): void
    {
        $statusFormatted = ucfirst(strtolower($order->status));

        // 1. Customer Notification
        if ($order->user_id) {
            self::createNotification([
                'user_id' => $order->user_id,
                'type' => 'order',
                'title' => "Order #{$order->order_number} Status: {$statusFormatted}",
                'body' => "Your order #{$order->order_number} status has been updated to {$statusFormatted}.",
                'link' => "/orders/{$order->id}",
            ]);
        }

        // 2. Admin Staff Notification
        self::createNotification([
            'required_permission' => 'orders.view',
            'type' => 'order',
            'title' => "Order #{$order->order_number} {$statusFormatted}",
            'body' => "Order #{$order->order_number} was marked as {$statusFormatted} by staff.",
            'link' => "/admin/orders",
        ]);
    }

    /**
     * CASE 3: Low Inventory Warning Trigger with Redis Throttling
     */
    public static function notifyLowStock(Product $product): void
    {
        $stock = $product->stock_qty ?? $product->stock ?? 0;
        if ($stock > 10) return;

        // Redis Lock / Throttle key to prevent duplicate notifications for 2 hours
        $redisKey = "redis_low_stock_notif_{$product->id}";
        if (Cache::has($redisKey)) {
            return;
        }

        // Lock for 2 hours (7200s)
        Cache::put($redisKey, true, 7200);

        self::createNotification([
            'required_permission' => 'inventory.view',
            'type' => 'warning',
            'title' => "Low Inventory Warning: {$product->name}",
            'body' => "'{$product->name}' stock level has dropped to {$stock} units in warehouse inventory.",
            'link' => "/admin/inventory",
            'data_json' => ['product_id' => $product->id, 'stock' => $stock]
        ]);
    }

    /**
     * CASE 4: Crop Diagnosis Submitted Trigger (Farmer -> Agronomist)
     */
    public static function notifyDiagnosisSubmitted(CropDiagnosis $diagnosis): void
    {
        $cropName = $diagnosis->crop_name ?? $diagnosis->crop ?? 'Crop';

        self::createNotification([
            'required_permission' => 'diagnoses.view',
            'type' => 'diagnosis',
            'title' => "Crop Scan Review Required: {$cropName}",
            'body' => "New crop diagnosis scan for {$cropName} submitted. Requires Agronomist verification.",
            'link' => "/admin/diagnoses",
            'data_json' => ['diagnosis_id' => $diagnosis->id, 'crop' => $cropName]
        ]);
    }

    /**
     * CASE 5: Crop Diagnosis Reviewed Trigger (Agronomist -> Farmer)
     */
    public static function notifyDiagnosisReviewed(CropDiagnosis $diagnosis): void
    {
        $cropName = $diagnosis->crop_name ?? $diagnosis->crop ?? 'Crop';

        if ($diagnosis->user_id) {
            self::createNotification([
                'user_id' => $diagnosis->user_id,
                'type' => 'diagnosis',
                'title' => "Crop Scan Analysis Ready: {$cropName}",
                'body' => "Our Agronomist has reviewed your {$cropName} scan and provided treatment recommendations.",
                'link' => "/diagnose",
                'data_json' => ['diagnosis_id' => $diagnosis->id]
            ]);
        }
    }

    /**
     * CASE 6: Staff Member Created Trigger (Admin Portal -> Super Admins)
     */
    public static function notifyStaffCreated(Admin $admin): void
    {
        self::createNotification([
            'required_permission' => 'roles.manage',
            'type' => 'user',
            'title' => "New Staff Account Registered: {$admin->name}",
            'body' => "Internal staff user {$admin->name} ({$admin->email}) created with role: {$admin->role}.",
            'link' => "/admin/users",
            'data_json' => ['admin_id' => $admin->id, 'email' => $admin->email]
        ]);
    }

    /**
     * CASE 7: Coupon Created Trigger
     */
    public static function notifyCouponCreated(Coupon $coupon): void
    {
        self::createNotification([
            'required_permission' => 'coupons.manage',
            'type' => 'info',
            'title' => "New Promo Coupon Created: {$coupon->code}",
            'body' => "Coupon code '{$coupon->code}' created with discount value {$coupon->value}.",
            'link' => "/admin/coupons",
        ]);
    }

    /**
     * Flush all Redis admin notification keys
     */
    public static function clearAllAdminNotificationCaches(): void
    {
        try {
            $admins = Admin::all();
            foreach ($admins as $admin) {
                Cache::forget("admin_notifications_{$admin->id}_v2");
                Cache::forget("admin_notifications_{$admin->id}");
            }
        } catch (\Exception $e) {
            Log::warning("Failed to clear admin notification cache: " . $e->getMessage());
        }
    }

    /**
     * Flush user notification key
     */
    public static function clearUserNotificationCache(int $userId): void
    {
        Cache::forget("user_notifications_{$userId}");
    }
}
