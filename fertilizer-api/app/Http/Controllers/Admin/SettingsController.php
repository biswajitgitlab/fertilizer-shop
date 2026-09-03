<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * PUBLIC: GET /api/settings
     * Returns all site settings as a flat key=>value map.
     * No auth required — used by the storefront on boot.
     */
    public function publicIndex(): JsonResponse
    {
        $settings = SiteSetting::allAsMap();

        return response()->json([
            'app_name'      => $settings['app_name']      ?? 'Sarkar Fertilizer',
            'app_tagline'   => $settings['app_tagline']   ?? 'Govt Certified Agri Store',
            'logo_url'      => $settings['logo_url']      ?? '/logo.png',
            'favicon_url'   => $settings['favicon_url']   ?? '/favicon.ico',
            'primary_color' => $settings['primary_color'] ?? 'emerald',
            'admin_color'   => $settings['admin_color']   ?? 'indigo',
            'theme_mode'    => $settings['theme_mode']    ?? 'dark',
        ]);
    }

    /**
     * ADMIN: PUT /api/admin/settings
     * Updates any subset of site settings.
     * Requires auth:sanctum + staff middleware.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'app_name'      => 'sometimes|string|max:100',
            'app_tagline'   => 'sometimes|string|max:200',
            'logo_url'      => 'sometimes|string|max:2048',
            'favicon_url'   => 'sometimes|string|max:2048',
            'primary_color' => 'sometimes|string|in:emerald,indigo,blue,violet,rose,amber,teal,cyan,lime,fuchsia,slate,orange',
            'admin_color'   => 'sometimes|string|in:emerald,indigo,blue,violet,rose,amber,teal,cyan,lime,fuchsia,slate,orange',
            'theme_mode'    => 'sometimes|string|in:light,dark',
        ]);

        foreach ($validated as $key => $value) {
            SiteSetting::set($key, $value);
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Settings saved to database.',
            'settings' => SiteSetting::allAsMap(),
        ]);
    }
}
