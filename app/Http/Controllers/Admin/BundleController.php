<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ProductBundle;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class BundleController extends Controller
{
    public function index()
    {
        $bundles = Cache::remember('admin_bundles_list', 600, function () {
            return ProductBundle::with('products')->get();
        });
        return response()->json($bundles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . time();
        $bundle = ProductBundle::create($validated);

        foreach ($validated['products'] as $product) {
            $bundle->products()->attach($product['product_id'], ['quantity' => $product['quantity']]);
        }

        Cache::forget('admin_bundles_list');
        Cache::forget('krishi_bundles_active');

        return response()->json($bundle->load('products'), 201);
    }

    public function show(string $id)
    {
        $bundle = Cache::remember("admin_bundle_{$id}", 600, function () use ($id) {
            return ProductBundle::with('products')->findOrFail($id);
        });
        return response()->json($bundle);
    }

    public function update(Request $request, string $id)
    {
        $bundle = ProductBundle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'products' => 'array|min:1',
            'products.*.product_id' => 'required_with:products|exists:products,id',
            'products.*.quantity' => 'required_with:products|integer|min:1',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . time();
        }

        $bundle->update($validated);

        if (isset($validated['products'])) {
            $syncData = [];
            foreach ($validated['products'] as $product) {
                $syncData[$product['product_id']] = ['quantity' => $product['quantity']];
            }
            $bundle->products()->sync($syncData);
        }

        Cache::forget('admin_bundles_list');
        Cache::forget("admin_bundle_{$id}");
        Cache::forget('krishi_bundles_active');
        if ($bundle->slug) {
            Cache::forget("krishi_bundle_{$bundle->slug}");
        }

        return response()->json($bundle->load('products'));
    }

    public function destroy(string $id)
    {
        $bundle = ProductBundle::findOrFail($id);
        $slug = $bundle->slug;
        $bundle->delete();

        Cache::forget('admin_bundles_list');
        Cache::forget("admin_bundle_{$id}");
        Cache::forget('krishi_bundles_active');
        if ($slug) {
            Cache::forget("krishi_bundle_{$slug}");
        }

        return response()->json(['message' => 'Bundle deleted']);
    }
}

