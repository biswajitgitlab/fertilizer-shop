<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductBundle;
use Illuminate\Support\Facades\Cache;

class BundleController extends Controller
{
    public function index()
    {
        $bundles = Cache::remember('krishi_bundles_active', 3600, function () {
            return ProductBundle::with('products')->where('is_active', true)->get()->toArray();
        });
        return response()->json($bundles);
    }

    public function show($slug)
    {
        $bundle = Cache::remember("krishi_bundle_{$slug}", 3600, function () use ($slug) {
            return ProductBundle::with('products')->where('slug', $slug)->firstOrFail()->toArray();
        });
        return response()->json($bundle);
    }
}
