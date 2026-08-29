<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Return all categories with product count (cached in Redis)
     */
    public function index()
    {
        $categories = Cache::remember('categories_all', 3600, function () {
            return Category::withCount('products')->orderBy('sort_order')->get();
        });

        return response()->json($categories);
    }
}
