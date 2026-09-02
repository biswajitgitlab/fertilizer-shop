<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin;

class RequireStaff
{
    /**
     * Handle an incoming request. Ensure authenticated user is an Admin/Staff member.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated staff member.'], 401);
        }

        if (get_class($user) !== Admin::class) {
            return response()->json([
                'message' => 'Forbidden: Storefront customer accounts cannot access internal staff administrative endpoints.'
            ], 403);
        }

        return $next($request);
    }
}
