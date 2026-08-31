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
use App\Contracts\NotificationServiceInterface;

class NotificationService implements NotificationServiceInterface
{
    /**
     * Magic static call delegation for backward compatibility and static syntax support.
     */
    public static function __callStatic($method, $parameters)
    {
        return (new static())->$method(...$parameters);
    }

    /**
     * Core method to store a persistent notification and trigger Redis caching/events.
     */
    public function createNotification(array $data): Notification
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
            $this->clearUserNotificationCache($data['user_id']);
        } else {
            $this->clearAllAdminNotificationCaches();
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
    public function notifyOrderCreated(Order $order): void
    {
        // 1. Customer Notification
        if ($order->user_id) {
            $this->createNotification([
                'user_id' => $order->user_id,
                'type' => 'order',
                'title' => "Order #{$order->order_number} Confirmed",
                'body' => "Your order of ₹{$order->total} has been received successfully. Track progress in your portal.",
                'link' => "/orders/{$order->id}",
            ]);
        }

        // 2. Admin Staff Notification (orders.view)
        $customerName = $order->shipping_address_json['name'] ?? ($order->user->name ?? 'Customer');
        $this->createNotification([
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
    public function notifyOrderStatusUpdated(Order $order, string $oldStatus = ''): void
    {
        $statusFormatted = ucfirst(strtolower($order->status));

        // 1. Customer Notification
        if ($order->user_id) {
            $this->createNotification([
                'user_id' => $order->user_id,
                'type' => 'order',
                'title' => "Order #{$order->order_number} Status: {$statusFormatted}",
                'body' => "Your order #{$order->order_number} status has been updated to {$statusFormatted}.",
                'link' => "/orders/{$order->id}",
            ]);
        }

        // 2. Admin Staff Notification
        $this->createNotification([
            'required_permission' => 'orders.view',
            'type' => 'order',
            'title' => "Order #{$order->order_number} {$statusFormatted}",
            'body' => "Order #{$order->order_number} was marked as {$statusFormatted} by staff.",
            'link' => "/admin/orders",
        ]);
    }

    /**
     * CASE 3: Low Stock Warning Trigger
     */
    public function notifyLowStock(Product $product): void
    {
        $this->createNotification([
            'required_permission' => 'inventory.view',
            'type' => 'warning',
            'title' => "Low Stock Warning: {$product->name}",
            'body' => "Product '{$product->name}' is down to {$product->stock} units in inventory.",
            'link' => "/admin/inventory",
            'data_json' => ['product_id' => $product->id, 'stock' => $product->stock]
        ]);
    }

    /**
     * CASE 4: Crop Diagnosis Submitted Trigger
     */
    public function notifyDiagnosisSubmitted(CropDiagnosis $diagnosis): void
    {
        $this->createNotification([
            'required_permission' => 'crop_plans.view',
            'type' => 'diagnosis',
            'title' => "New Crop Scan Submitted ({$diagnosis->crop})",
            'body' => "A farmer submitted a new crop diagnosis scan for {$diagnosis->crop}. Requires agronomist review.",
            'link' => "/admin/diagnoses",
            'data_json' => ['diagnosis_id' => $diagnosis->id]
        ]);
    }

    /**
     * CASE 5: Crop Diagnosis Reviewed Trigger
     */
    public function notifyDiagnosisReviewed(CropDiagnosis $diagnosis): void
    {
        if ($diagnosis->user_id) {
            $this->createNotification([
                'user_id' => $diagnosis->user_id,
                'type' => 'diagnosis',
                'title' => "Agronomist Prescription Ready for {$diagnosis->crop}",
                'body' => "Our certified agronomists have reviewed your {$diagnosis->crop} scan and provided treatment recommendations.",
                'link' => "/diagnose/{$diagnosis->id}",
            ]);
        }
    }

    /**
     * CASE 6: Staff Account Created
     */
    public function notifyStaffCreated(Admin $admin): void
    {
        $this->createNotification([
            'required_permission' => 'users.view',
            'type' => 'system',
            'title' => "New Staff Member Onboarded",
            'body' => "Staff account for {$admin->name} ({$admin->email}) was created with role '{$admin->role}'.",
            'link' => "/admin/users",
        ]);
    }

    /**
     * CASE 7: Coupon Created
     */
    public function notifyCouponCreated(Coupon $coupon): void
    {
        $this->createNotification([
            'required_permission' => 'products.view',
            'type' => 'system',
            'title' => "New Promo Code Activated: {$coupon->code}",
            'body' => "Coupon '{$coupon->code}' with {$coupon->discount_type} discount has been activated.",
            'link' => "/admin/coupons",
        ]);
    }

    /**
     * Redis Cache Invalidation Helper — All Admin Notifications
     */
    public function clearAllAdminNotificationCaches(): void
    {
        try {
            Cache::forget('admin_notifications_all');
            Cache::forget('admin_unread_count_all');
        } catch (\Exception $e) {
            Log::warning("Failed to clear admin notification cache: " . $e->getMessage());
        }
    }

    /**
     * Redis Cache Invalidation Helper — Specific User
     */
    public function clearUserNotificationCache(int $userId): void
    {
        try {
            Cache::forget("user_notifications_{$userId}");
            Cache::forget("user_unread_count_{$userId}");
        } catch (\Exception $e) {
            Log::warning("Failed to clear user notification cache: " . $e->getMessage());
        }
    }
}
