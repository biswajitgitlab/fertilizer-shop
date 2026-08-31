<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    /**
     * Handle an incoming request. Check if user possesses required RBSC permissions.
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated staff member.'], 401);
        }

        if (get_class($user) !== Admin::class) {
            return response()->json([
                'message' => 'Forbidden: Internal staff privileges required.'
            ], 403);
        }

        // Super Admin bypasses all specific permission gates
        if ($user->hasRole('Super Admin') || $user->role === 'Super Admin') {
            return $next($request);
        }

        foreach ($permissions as $perm) {
            if (method_exists($user, 'hasEffectivePermission') && $user->hasEffectivePermission($perm)) {
                return $next($request);
            }
            if (method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo($perm)) {
                return $next($request);
            }
        }

        // Trigger Real-Time Security Sentinel Notification & Redis Pub/Sub Broadcast
        try {
            app(\App\Contracts\NotificationServiceInterface::class)->createNotification([
                'required_permission' => 'security.audit',
                'type' => 'warning',
                'title' => 'RBSC Security Sentinel: 403 Unauthorized Access Blocked',
                'body' => "Staff member {$user->name} ({$user->email}) attempted unauthorized access to {$request->path()} requiring [" . implode(', ', $permissions) . "].",
                'link' => '/admin/reports?tab=security'
            ]);

            // Database Persistence: Save threat event directly to audit_logs table
            \App\Models\AuditLog::create([
                'user_id' => $user->id,
                'action' => 'UNAUTHORIZED_ACCESS_BLOCKED',
                'target' => '/' . ltrim($request->path(), '/'),
                'details' => "403 Forbidden: Staff member {$user->name} ({$user->email}) attempted unauthorized access to {$request->path()} requiring [" . implode(', ', $permissions) . "].",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'risk_level' => 'HIGH_SECURITY_ALERT',
            ]);

            // Redis Step: Publish real-time breach event for security dashboard listeners
            \Illuminate\Support\Facades\Redis::publish('security:alert', json_encode([
                'event' => 'security.breach_blocked',
                'user' => $user->email,
                'path' => $request->path(),
                'required_permissions' => $permissions,
                'timestamp' => now()->toIso8601String(),
            ]));
            \Illuminate\Support\Facades\Redis::set('security:last_breach_timestamp', now()->toIso8601String());
        } catch (\Throwable $e) {
            Log::warning("Failed to dispatch RBSC Sentinel Notification or Redis Broadcast: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Forbidden: Account lacks required RBSC permission (' . implode(', ', $permissions) . ') for this operation.'
        ], 403);
    }
}
