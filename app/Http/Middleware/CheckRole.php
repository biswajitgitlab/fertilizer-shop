<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $userRole = strtolower($user->role ?? '');
        $allowed = array_map('strtolower', $roles);

        if (in_array($userRole, $allowed)) {
            return $next($request);
        }

        if (method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Forbidden. Insufficient role permissions.'
        ], 403);
    }
}
