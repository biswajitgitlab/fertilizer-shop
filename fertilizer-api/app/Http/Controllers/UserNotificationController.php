<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UserNotificationController extends Controller
{
    /**
     * GET /api/user/notifications
     * Retrieve persistent notifications for the authenticated customer user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $cacheKey = "user_notifications_{$user->id}";

        $responsePayload = Cache::remember($cacheKey, 10, function () use ($user) {
            $notifications = Notification::where('user_id', $user->id)
                ->latest()
                ->take(40)
                ->get();

            $formatted = $notifications->map(function ($item) {
                return [
                    'id' => "db_{$item->id}",
                    'numeric_id' => $item->id,
                    'title' => $item->title,
                    'message' => $item->body,
                    'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Recently',
                    'timestamp' => $item->created_at ? $item->created_at->toISOString() : now()->toISOString(),
                    'type' => $item->type ?: 'order',
                    'unread' => is_null($item->read_at),
                    'link' => $item->link ?: '/orders',
                ];
            });

            $unreadCount = $formatted->where('unread', true)->count();

            return [
                'notifications' => $formatted->values(),
                'unread_count' => $unreadCount,
            ];
        });

        return response()->json($responsePayload);
    }

    /**
     * POST /api/user/notifications/{id}/read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $numericId = (int) str_replace('db_', '', (string)$id);

        if ($numericId) {
            Notification::where('id', $numericId)
                ->where('user_id', $user->id)
                ->update(['read_at' => now()]);
        }

        Cache::forget("user_notifications_{$user->id}");

        return response()->json(['message' => 'Notification marked as read.']);
    }

    /**
     * POST /api/user/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        Cache::forget("user_notifications_{$user->id}");

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
