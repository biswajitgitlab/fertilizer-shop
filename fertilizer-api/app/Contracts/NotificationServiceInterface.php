<?php

namespace App\Contracts;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\CropDiagnosis;
use App\Models\Admin;
use App\Models\Coupon;

interface NotificationServiceInterface
{
    public function createNotification(array $data): Notification;
    public function notifyOrderCreated(Order $order): void;
    public function notifyOrderStatusUpdated(Order $order, string $oldStatus = ''): void;
    public function notifyLowStock(Product $product): void;
    public function notifyDiagnosisSubmitted(CropDiagnosis $diagnosis): void;
    public function notifyDiagnosisReviewed(CropDiagnosis $diagnosis): void;
    public function notifyStaffCreated(Admin $admin): void;
    public function notifyCouponCreated(Coupon $coupon): void;
    public function clearAllAdminNotificationCaches(): void;
    public function clearUserNotificationCache(int $userId): void;
}
