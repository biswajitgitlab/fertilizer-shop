<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ProductBundle;
use Illuminate\Support\Str;

class BundleController extends Controller
{
    public function index()
    {
        $bundles = ProductBundle::with('products')->get();
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

        return response()->json($bundle->load('products'), 201);
    }

    public function show(string $id)
    {
        $bundle = ProductBundle::with('products')->findOrFail($id);
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

        return response()->json($bundle->load('products'));
    }

    public function destroy(string $id)
    {
        $bundle = ProductBundle::findOrFail($id);
        $bundle->delete();
        return response()->json(['message' => 'Bundle deleted']);
    }
}
