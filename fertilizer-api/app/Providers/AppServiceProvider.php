<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use App\Contracts\NotificationServiceInterface;
use App\Services\NotificationService;
use App\Contracts\PaymentServiceInterface;
use App\Services\RazorpayPaymentService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
        $this->app->singleton(PaymentServiceInterface::class, RazorpayPaymentService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // General API Rate Limiter (60 requests per minute)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Authentication Rate Limiter (5 attempts per minute to prevent brute-force attacks)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // AI Crop Diagnosis Rate Limiter (5 requests per minute)
        RateLimiter::for('diagnosis', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        // AI Chatbot Rate Limiter (20 requests per minute)
        RateLimiter::for('chat', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });
    }
}
