<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProductBundle;

class BundleController extends Controller
{
    public function index()
    {
        $bundles = ProductBundle::with('products')->where('is_active', true)->get();
        return response()->json($bundles);
    }

    public function show($slug)
    {
        $bundle = ProductBundle::with('products')->where('slug', $slug)->firstOrFail();
        return response()->json($bundle);
    }
}
