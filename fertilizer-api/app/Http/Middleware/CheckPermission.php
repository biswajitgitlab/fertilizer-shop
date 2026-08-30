<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin;

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

        return response()->json([
            'message' => 'Forbidden: Account lacks required RBSC permission (' . implode(', ', $permissions) . ') for this operation.'
        ], 403);
    }
}
