<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    private function clearProductCache($slug = null)
    {
        Cache::forget('products_featured');
        Cache::forget('products_trending');
        Cache::forget('categories_all');
        Cache::forget('admin_dashboard_stats');
        if ($slug) {
            Cache::forget("product_{$slug}");
        }
    }

    /**
     * GET /api/products
     */
    public function index(Request $request)
    {
        $query = Product::with('category')->withAvg('reviews', 'rating');

        if ($request->filled('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_desc', 'like', "%{$search}%")
                  ->orWhere('suitable_crops_json', 'like', "%{$search}%");
            });
        }

        if ($request->filled('crop')) {
            $crop = $request->crop;
            $query->where(function($q) use ($crop) {
                $q->where('suitable_crops_json', 'like', "%{$crop}%")
                  ->orWhere('name', 'like', "%{$crop}%")
                  ->orWhere('description', 'like', "%{$crop}%")
                  ->orWhere('short_desc', 'like', "%{$crop}%");
            });
        }

        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $products = $query->paginate(15);
        return response()->json($products);
    }

    /**
     * GET /api/products/featured
     */
    public function featured()
    {
        $products = Cache::remember('products_featured', 1800, function () {
            return Product::with('category')
                ->withAvg('reviews', 'rating')
                ->where('is_featured', true)
                ->latest()
                ->take(8)
                ->get()
                ->toArray();
        });
            
        return response()->json($products);
    }

    /**
     * GET /api/products/trending
     */
    public function trending()
    {
        $products = Cache::remember('products_trending', 1800, function () {
            return Product::with('category')
                ->withAvg('reviews', 'rating')
                ->withCount(['orderItems' => function ($query) {
                    $query->whereHas('order', function($q) {
                        $q->where('created_at', '>=', now()->subDays(30));
                    });
                }])
                ->orderByDesc('order_items_count')
                ->take(8)
                ->get()
                ->toArray();
        });

        return response()->json($products);
    }

    /**
     * GET /api/products/{slug}
     */
    public function show($slug)
    {
        $data = Cache::remember("product_{$slug}", 3600, function () use ($slug) {
            $product = Product::with(['category', 'reviews.user'])
                ->withAvg('reviews', 'rating')
                ->where('slug', $slug)
                ->firstOrFail();

            $relatedProducts = Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->withAvg('reviews', 'rating')
                ->take(4)
                ->get();

            return [
                'product' => $product,
                'related' => $relatedProducts
            ];
        });

        return response()->json($data);
    }

    /**
     * POST /api/admin/products
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'short_desc' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'composition_json' => 'nullable|array',
            'suitable_crops_json' => 'nullable|array',
            'stock_qty' => 'required|integer|min:0',
            'unit' => 'nullable|string',
            'weight_kg' => 'nullable|numeric',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'images.*' => 'image|max:2048'
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        
        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // If S3 is configured as default, it will upload there. Using 'public' disk for standard compatibility.
                $path = $image->store('products', 'public');
                $imageUrls[] = url(Storage::url($path));
            }
        }
        $validated['images_json'] = $imageUrls;

        $product = Product::create($validated);
        $this->clearProductCache();
        
        return response()->json($product, 201);
    }

    /**
     * PUT /api/admin/products/{id}
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'category_id' => 'exists:categories,id',
            'price' => 'numeric|min:0',
            'description' => 'nullable|string',
            'short_desc' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'composition_json' => 'nullable|array',
            'suitable_crops_json' => 'nullable|array',
            'stock_qty' => 'integer|min:0',
            'unit' => 'nullable|string',
            'weight_kg' => 'nullable|numeric',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'images.*' => 'image|max:2048',
            'remove_images' => 'nullable|array'
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        $imageUrls = $product->images_json ?? [];

        if ($request->has('remove_images')) {
            $imageUrls = array_values(array_diff($imageUrls, $request->remove_images));
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $imageUrls[] = url(Storage::url($path));
            }
        }
        
        if ($request->hasFile('images') || $request->has('remove_images')) {
            $validated['images_json'] = $imageUrls;
        }

        $oldSlug = $product->slug;
        $product->update($validated);

        $this->clearProductCache($oldSlug);
        $this->clearProductCache($product->slug);

        return response()->json($product);
    }

    /**
     * DELETE /api/admin/products/{id}
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $slug = $product->slug;
        $product->delete();

        $this->clearProductCache($slug);

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
