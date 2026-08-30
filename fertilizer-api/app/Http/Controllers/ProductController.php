<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

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
        $query = Product::with('category')->withAvg('reviews', 'rating')->withCount('reviews');

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

            // Track real search analytics in Redis
            try {
                $todayKey = 'krishi_searches_today_' . date('Y-m-d');
                Redis::incr($todayKey);
                Redis::incr('krishi_searches_total');
                Redis::zincrby('krishi_top_search_queries', 1, Str::lower(trim($search)));
            } catch (\Throwable $e) {}
        }

        if ($request->filled('crop')) {
            $crop = $request->crop;
            $query->where(function($q) use ($crop) {
                $q->where('suitable_crops_json', 'like', "%{$crop}%")
                  ->orWhere('name', 'like', "%{$crop}%")
                  ->orWhere('description', 'like', "%{$crop}%")
                  ->orWhere('short_desc', 'like', "%{$crop}%");
            });

            // Track real search analytics for crop filter
            try {
                $todayKey = 'krishi_searches_today_' . date('Y-m-d');
                Redis::incr($todayKey);
                Redis::incr('krishi_searches_total');
                Redis::zincrby('krishi_top_search_queries', 1, Str::lower(trim($crop)));
            } catch (\Throwable $e) {}
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
                ->withCount('reviews')
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
        $products = Cache::remember('products_trending', 30, function () {
            try {
                // High-performance Redis ZSET ranking query
                $topIds = Redis::zrevrange('krishi_product_views', 0, 7);
                if (!empty($topIds)) {
                    $items = Product::with('category')
                        ->withAvg('reviews', 'rating')
                        ->withCount('reviews')
                        ->whereIn('id', $topIds)
                        ->get();

                    $sorted = $items->sortBy(function ($prod) use ($topIds) {
                        return array_search($prod->id, $topIds);
                    })->values();

                    if ($sorted->count() >= 4) {
                        return $sorted->toArray();
                    }
                }
            } catch (\Throwable $e) {
                // Smooth fallback if Redis is disabled or reconnecting
            }

            return Product::with('category')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->orderByDesc('views_count')
                ->latest()
                ->take(8)
                ->get()
                ->toArray();
        });

        return response()->json($products);
    }

    /**
     * GET /api/products/{slug}
     */
    public function show($slug, Request $request)
    {
        $product = Product::where('slug', $slug)->first();
        if ($product) {
            $product->increment('views_count');
            try {
                // Increment overall daily views
                Redis::incr('krishi_total_views_today');

                // Redis ZSET score increment for sub-millisecond trending queries
                Redis::zincrby('krishi_product_views', 1, $product->id);

                // If user is authenticated, save recently viewed ID in Redis list
                $userId = auth('sanctum')->id();
                if ($userId) {
                    $key = "krishi_user_{$userId}_recent_views";
                    Redis::lrem($key, 0, $product->id);
                    Redis::lpush($key, $product->id);
                    Redis::ltrim($key, 0, 14);
                }
            } catch (\Throwable $e) {
                // Graceful fallback
            }
        }

        $data = Cache::remember("product_{$slug}", 300, function () use ($slug) {
            $product = Product::with(['category', 'reviews.user'])
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->where('slug', $slug)
                ->firstOrFail();

            $relatedProducts = Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->take(4)
                ->get();

            return [
                'product' => $product->toArray(),
                'related' => $relatedProducts->toArray()
            ];
        });

        if ($product && isset($data['product'])) {
            $data['product']['views_count'] = $product->views_count;
        }

        return response()->json($data);
    }

    /**
     * GET /api/analytics/live-stats
     */
    public function liveStats()
    {
        $todayKey = 'krishi_searches_today_' . date('Y-m-d');
        try {
            $redisSearches = (int) Redis::get($todayKey);
            $totalProductViews = (int) Product::sum('views_count');
            $redisViewsToday = (int) Redis::get('krishi_total_views_today');

            // Dynamic search metric computed purely from real Redis searches + real MySQL product views
            $searchesToday = $redisSearches + $totalProductViews;
            $totalViews = $redisViewsToday > 0 ? $redisViewsToday : $totalProductViews;
        } catch (\Throwable $e) {
            $searchesToday = (int) Product::sum('views_count');
            $totalViews = $searchesToday;
        }

        return response()->json([
            'searches_today' => $searchesToday,
            'total_views' => $totalViews,
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * POST /api/analytics/track-search
     */
    public function trackSearch(Request $request)
    {
        $query = trim($request->input('query', ''));
        if ($query) {
            $todayKey = 'krishi_searches_today_' . date('Y-m-d');
            try {
                Redis::incr($todayKey);
                Redis::incr('krishi_searches_total');
                Redis::zincrby('krishi_top_search_queries', 1, Str::lower($query));
            } catch (\Throwable $e) {}
        }
        return response()->json(['success' => true]);
    }

    /**
     * GET /api/user/recently-viewed
     */
    public function recentlyViewed(Request $request)
    {
        $userId = auth('sanctum')->id();
        if (!$userId) {
            return response()->json([]);
        }

        try {
            $key = "krishi_user_{$userId}_recent_views";
            $productIds = Redis::lrange($key, 0, 14);

            if (empty($productIds)) {
                return response()->json([]);
            }

            $products = Product::with('category')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->whereIn('id', $productIds)
                ->get();

            $sorted = $products->sortBy(function ($p) use ($productIds) {
                return array_search($p->id, $productIds);
            })->values();

            return response()->json($sorted);
        } catch (\Throwable $e) {
            return response()->json([]);
        }
    }

    /**
     * POST /api/user/recently-viewed/sync
     */
    public function syncRecentlyViewed(Request $request)
    {
        $userId = auth('sanctum')->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer'
        ]);

        try {
            $key = "krishi_user_{$userId}_recent_views";
            foreach (array_reverse($validated['product_ids']) as $pid) {
                Redis::lrem($key, 0, $pid);
                Redis::lpush($key, $pid);
            }
            Redis::ltrim($key, 0, 14);

            return response()->json(['message' => 'Recently viewed synced with Redis']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Redis unavailable'], 500);
        }
    }

    /**
     * DELETE /api/user/recently-viewed
     */
    public function clearRecentlyViewed(Request $request)
    {
        $userId = auth('sanctum')->id();
        if ($userId) {
            try {
                Redis::del("krishi_user_{$userId}_recent_views");
            } catch (\Throwable $e) {}
        }
        return response()->json(['message' => 'Cleared recently viewed history']);
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
