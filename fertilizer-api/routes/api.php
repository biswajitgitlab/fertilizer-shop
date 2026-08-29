<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Cart Routes
    Route::get('/cart', [App\Http\Controllers\CartController::class, 'index']);
    Route::post('/cart/add', [App\Http\Controllers\CartController::class, 'add']);
    Route::put('/cart/update/{item_id}', [App\Http\Controllers\CartController::class, 'updateItem']);
    Route::delete('/cart/remove/{item_id}', [App\Http\Controllers\CartController::class, 'remove']);
    Route::post('/cart/clear', [App\Http\Controllers\CartController::class, 'clear']);
    Route::post('/cart/apply-coupon', [App\Http\Controllers\CartController::class, 'applyCoupon']);
    Route::post('/cart/sync', [App\Http\Controllers\CartController::class, 'sync']);
    Route::get('/cart/abandoned', [App\Http\Controllers\CartController::class, 'abandoned']);

    // Order Routes
    Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store']);
    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'index']);
    Route::get('/orders/{id}', [App\Http\Controllers\OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [App\Http\Controllers\OrderController::class, 'cancel']);
    Route::get('/orders/{id}/invoice', [App\Http\Controllers\OrderController::class, 'invoice']);
    // Diagnosis Routes
    Route::post('/diagnose', [\App\Http\Controllers\DiagnosisController::class, 'store']);
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
});

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

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

// Public Routes
Route::post('/chat/start', [\App\Http\Controllers\API\ChatController::class, 'start']);
Route::post('/chat/message', [\App\Http\Controllers\API\ChatController::class, 'message']);
Route::get('/chat/history/{token}', [\App\Http\Controllers\API\ChatController::class, 'history']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/trending', [ProductController::class, 'trending']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::get('/bundles', [\App\Http\Controllers\BundleController::class, 'index']);
Route::get('/bundles/{slug}', [\App\Http\Controllers\BundleController::class, 'show']);

// Admin Routes
Route::middleware(['auth:sanctum', 'role:Admin'])->prefix('admin')->group(function () {
    // Products
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);

    // Orders
    Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::put('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'update']);
    Route::post('/orders/bulk-update', [\App\Http\Controllers\Admin\OrderController::class, 'bulkUpdate']);

    // Customers
    Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index']);
    Route::get('/customers/{id}', [\App\Http\Controllers\Admin\CustomerController::class, 'show']);

    // Analytics
    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index']);

    // Inventory
    Route::get('/inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index']);
    Route::put('/inventory/{id}', [\App\Http\Controllers\Admin\InventoryController::class, 'update']);
    Route::get('/inventory/{id}/logs', [\App\Http\Controllers\Admin\InventoryController::class, 'logs']);

    // Coupons
    Route::apiResource('coupons', \App\Http\Controllers\Admin\CouponController::class);

    // Bundles
    Route::apiResource('bundles', \App\Http\Controllers\Admin\BundleController::class);

    // Diagnoses
    Route::put('/diagnoses/{id}', [\App\Http\Controllers\Admin\DiagnosisController::class, 'update']);
});
