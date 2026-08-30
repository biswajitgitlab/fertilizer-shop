<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Dedicated Admin Portal Authentication Routes
    Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/auth/forgot-password/request', [AdminAuthController::class, 'forgotPasswordRequest']);
    Route::post('/admin/auth/forgot-password/verify', [AdminAuthController::class, 'verifyForgotPasswordOtp']);
    Route::post('/admin/auth/forgot-password/reset', [AdminAuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Admin Auth Sanctum routes
    Route::post('/admin/auth/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/auth/me', [AdminAuthController::class, 'me']);

    // Cart Routes
    Route::get('/cart', [App\Http\Controllers\CartController::class, 'index']);
    Route::post('/cart/add', [App\Http\Controllers\CartController::class, 'add']);
    Route::put('/cart/update/{item_id}', [App\Http\Controllers\CartController::class, 'updateItem']);
    Route::delete('/cart/remove/{item_id}', [App\Http\Controllers\CartController::class, 'remove']);
    Route::post('/cart/clear', [App\Http\Controllers\CartController::class, 'clear']);
    Route::post('/cart/apply-coupon', [App\Http\Controllers\CartController::class, 'applyCoupon']);
    Route::post('/cart/sync', [App\Http\Controllers\CartController::class, 'sync']);
    Route::get('/cart/abandoned', [App\Http\Controllers\CartController::class, 'abandoned']);

    // User Recently Viewed Products (Redis-backed)
    Route::get('/user/recently-viewed', [ProductController::class, 'recentlyViewed']);
    Route::post('/user/recently-viewed/sync', [ProductController::class, 'syncRecentlyViewed']);
    Route::delete('/user/recently-viewed', [ProductController::class, 'clearRecentlyViewed']);

    // Order Routes
    Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store']);
    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'index']);
    Route::get('/orders/{id}', [App\Http\Controllers\OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [App\Http\Controllers\OrderController::class, 'cancel']);
    Route::get('/orders/{id}/invoice', [App\Http\Controllers\OrderController::class, 'invoice']);
    Route::post('/orders/{id}/payment-failed', [App\Http\Controllers\OrderController::class, 'markPaymentFailed']);
    Route::post('/orders/{id}/switch-cod', [App\Http\Controllers\OrderController::class, 'switchToCod']);
    Route::post('/orders/{id}/verify-payment', [App\Http\Controllers\OrderController::class, 'verifyPayment']);

    // Diagnosis Routes (Throttled with Redis to 5 requests/min)
    Route::middleware('throttle:diagnosis')->group(function () {
        Route::post('/diagnose', [\App\Http\Controllers\DiagnosisController::class, 'store']);
    });
    Route::get('/diagnose/history', [\App\Http\Controllers\DiagnosisController::class, 'index']);
    Route::get('/diagnose/{id}', [\App\Http\Controllers\DiagnosisController::class, 'show']);

    // Planner Routes
    Route::get('/planner', [App\Http\Controllers\API\PlannerController::class, 'index']);
    Route::post('/planner', [App\Http\Controllers\API\PlannerController::class, 'store']);
    Route::get('/planner/upcoming-tasks', [App\Http\Controllers\API\PlannerController::class, 'upcomingTasks']);
    Route::get('/planner/{id}', [App\Http\Controllers\API\PlannerController::class, 'show']);
    Route::put('/planner/{id}', [App\Http\Controllers\API\PlannerController::class, 'update']);
    Route::delete('/planner/{id}', [App\Http\Controllers\API\PlannerController::class, 'destroy']);
    Route::post('/planner/{id}/mark-done/{task_id}', [App\Http\Controllers\API\PlannerController::class, 'markDone']);
    // Razorpay Direct Routes
    Route::post('/create-order', [\App\Http\Controllers\RazorpayController::class, 'createOrder']);
    Route::post('/verify-payment', [\App\Http\Controllers\RazorpayController::class, 'verifyPayment']);
});

// Razorpay Direct Public Routes (also accessible without bearer token if needed)
Route::post('/create-order', [\App\Http\Controllers\RazorpayController::class, 'createOrder']);
Route::post('/verify-payment', [\App\Http\Controllers\RazorpayController::class, 'verifyPayment']);
Route::get('/payment-gateway/status', [\App\Http\Controllers\RazorpayController::class, 'getCircuitStatus']);

// Analytics & Live Metrics Public Routes
Route::get('/analytics/live-stats', [ProductController::class, 'liveStats']);
Route::post('/analytics/track-search', [ProductController::class, 'trackSearch']);

// Webhooks
Route::post('/webhooks/payment', function (\Illuminate\Http\Request $request) {
    // Simple mock webhook
    return response()->json(['status' => 'received']);
});
Route::get('/webhooks/payment/mock', function (\Illuminate\Http\Request $request) {
    $orderId = $request->query('order_id');
    $order = \App\Models\Order::find($orderId);
    if ($order) {
        $order->update(['payment_status' => 'PAID', 'status' => 'CONFIRMED']);
    }
    return response()->json(['message' => 'Payment successful', 'order_id' => $orderId]);
});

Route::post('/webhooks/n8n/diagnosis-result', [\App\Http\Controllers\Webhook\N8nWebhookController::class, 'handleDiagnosisResult']);
Route::post('/webhooks/n8n/chat-reply', [\App\Http\Controllers\Webhook\N8nWebhookController::class, 'handleChatReply']);

// Public Routes (AI Chat throttled to 20 requests/min)
Route::middleware('throttle:chat')->group(function () {
    Route::post('/chat/start', [\App\Http\Controllers\API\ChatController::class, 'start']);
    Route::post('/chat/message', [\App\Http\Controllers\API\ChatController::class, 'message']);
});
Route::get('/chat/history/{token}', [\App\Http\Controllers\API\ChatController::class, 'history']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/trending', [ProductController::class, 'trending']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [\App\Http\Controllers\ReviewController::class, 'index']);
Route::post('/products/{id}/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);

Route::get('/coupons/public', function() {
    return response()->json(\App\Models\Coupon::where('is_active', true)->get());
});

Route::get('/bundles', [\App\Http\Controllers\BundleController::class, 'index']);
Route::get('/bundles/{slug}', [\App\Http\Controllers\BundleController::class, 'show']);

// Admin Routes — Restricted to Internal Staff with Granular RBSC Permissions
Route::middleware(['auth:sanctum', 'staff'])->prefix('admin')->group(function () {
    // Dashboard (All internal staff)
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);

    // Payment Gateway Circuit Reset
    Route::post('/payment-gateway/reset-circuit', [\App\Http\Controllers\RazorpayController::class, 'resetCircuit'])->middleware('rbsc:analytics.view');

    // Products Management
    Route::post('/products', [ProductController::class, 'store'])->middleware('rbsc:products.create');
    Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('rbsc:products.edit');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('rbsc:products.delete');

    // Orders Management
    Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->middleware('rbsc:orders.view');
    Route::get('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->middleware('rbsc:orders.view');
    Route::put('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'update'])->middleware('rbsc:orders.edit,orders.status');
    Route::post('/orders/bulk-update', [\App\Http\Controllers\Admin\OrderController::class, 'bulkUpdate'])->middleware('rbsc:orders.edit,orders.status');

    // Customers CRM Management
    Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index'])->middleware('rbsc:customers.view');
    Route::get('/customers/{id}', [\App\Http\Controllers\Admin\CustomerController::class, 'show'])->middleware('rbsc:customers.view');

    // Analytics Reporting
    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->middleware('rbsc:analytics.view');

    // Inventory & Warehouse Management
    Route::get('/inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->middleware('rbsc:inventory.view');
    Route::put('/inventory/{id}', [\App\Http\Controllers\Admin\InventoryController::class, 'update'])->middleware('rbsc:inventory.update');
    Route::get('/inventory/{id}/logs', [\App\Http\Controllers\Admin\InventoryController::class, 'logs'])->middleware('rbsc:inventory.view');

    // Coupons & Promotions
    Route::get('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'index'])->middleware('rbsc:products.view');
    Route::post('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'store'])->middleware('rbsc:products.create');
    Route::get('/coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'show'])->middleware('rbsc:products.view');
    Route::put('/coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'update'])->middleware('rbsc:products.edit');
    Route::delete('/coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'destroy'])->middleware('rbsc:products.delete');

    // Product Bundles
    Route::get('/bundles', [\App\Http\Controllers\Admin\BundleController::class, 'index'])->middleware('rbsc:products.view');
    Route::post('/bundles', [\App\Http\Controllers\Admin\BundleController::class, 'store'])->middleware('rbsc:products.create');
    Route::get('/bundles/{bundle}', [\App\Http\Controllers\Admin\BundleController::class, 'show'])->middleware('rbsc:products.view');
    Route::put('/bundles/{bundle}', [\App\Http\Controllers\Admin\BundleController::class, 'update'])->middleware('rbsc:products.edit');
    Route::delete('/bundles/{bundle}', [\App\Http\Controllers\Admin\BundleController::class, 'destroy'])->middleware('rbsc:products.delete');

    // Crop Diagnoses Triage
    Route::put('/diagnoses/{id}', [\App\Http\Controllers\Admin\DiagnosisController::class, 'update'])->middleware('rbsc:crop_plans.manage');

    // User Management (Staff Accounts)
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->middleware('rbsc:users.view');
    Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->middleware('rbsc:users.create');
    Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->middleware('rbsc:users.view');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->middleware('rbsc:users.edit');
    Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->middleware('rbsc:users.delete');

    // Roles & Team Permissions Management
    Route::get('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->middleware('rbsc:roles.view');
    Route::post('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->middleware('rbsc:roles.create');
    Route::put('/roles/{id}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->middleware('rbsc:roles.edit');
    Route::delete('/roles/{id}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->middleware('rbsc:roles.delete');
    Route::get('/permissions', [\App\Http\Controllers\Admin\RoleController::class, 'permissions'])->middleware('rbsc:roles.view');
    Route::get('/team', [\App\Http\Controllers\Admin\RoleController::class, 'team'])->middleware('rbsc:roles.view,users.view');
    Route::post('/team/assign-role', [\App\Http\Controllers\Admin\RoleController::class, 'assignRole'])->middleware('rbsc:roles.edit,users.edit');
    Route::put('/team/{id}/permissions', [\App\Http\Controllers\Admin\RoleController::class, 'updateUserPermissions'])->middleware('rbsc:roles.edit,users.edit');

    // Admin Real Notifications with Permission Scopes
    Route::get('/notifications', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'index'])->middleware('rbsc:notifications.view');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAsRead'])->middleware('rbsc:notifications.view');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAllAsRead'])->middleware('rbsc:notifications.view');
});
