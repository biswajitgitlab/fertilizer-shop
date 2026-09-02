<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ReviewController extends Controller
{
    /**
     * Get reviews and rating summary for a product (Cached in Redis)
     * GET /api/products/{id}/reviews
     */
    public function index(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $summary = Cache::remember("product_{$product->id}_reviews_summary", 600, function () use ($product) {
            $reviews = ProductReview::with('user:id,name')
                ->where('product_id', $product->id)
                ->latest()
                ->get();

            $totalReviews = $reviews->count();
            $avgRating = $totalReviews > 0 ? round($reviews->avg('rating'), 1) : 0.0;

            $ratingCounts = [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ];

            return [
                'average_rating' => $avgRating,
                'total_reviews' => $totalReviews,
                'rating_counts' => $ratingCounts,
                'reviews' => $reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'user_name' => $review->user ? $review->user->name : 'Farmer Customer',
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'verified_purchase' => (bool) $review->verified_purchase,
                        'created_at' => $review->created_at ? $review->created_at->format('M d, Y') : now()->format('M d, Y'),
                    ];
                })->toArray()
            ];
        });

        $userId = auth()->id() ?? 1; // Default active demo user
        
        // Check if user has purchased this product with a DELIVERED / CONFIRMED order
        $hasDeliveredOrder = OrderItem::where('product_id', $product->id)
            ->whereHas('order', function ($q) use ($userId) {
                $q->where(function ($sub) use ($userId) {
                    $sub->where('user_id', $userId);
                })
                ->whereIn('status', ['DELIVERED', 'COMPLETED', 'CONFIRMED']);
            })
            ->exists();

        $alreadyReviewed = ProductReview::where('product_id', $product->id)
            ->where('user_id', $userId)
            ->exists();

        $userCanReview = $hasDeliveredOrder && !$alreadyReviewed;
        $eligibilityReason = null;

        if ($alreadyReviewed) {
          $eligibilityReason = 'You have already submitted a review for this product.';
        } elseif (!$hasDeliveredOrder) {
          $eligibilityReason = 'Verified buyer check: You can only review products from completed & delivered orders.';
        }

        return response()->json([
            'average_rating' => $summary['average_rating'],
            'total_reviews' => $summary['total_reviews'],
            'rating_counts' => $summary['rating_counts'],
            'user_can_review' => $userCanReview,
            'already_reviewed' => $alreadyReviewed,
            'has_delivered_order' => $hasDeliveredOrder,
            'eligibility_reason' => $eligibilityReason,
            'reviews' => $summary['reviews']
        ]);
    }

    /**
     * Store a new product review
     * POST /api/products/{id}/reviews
     */
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $product = Product::findOrFail($productId);
        $userId = auth()->id() ?? 1;

        // REAL E-COMMERCE RULE: Check if user has purchased this product and order status is DELIVERED / CONFIRMED
        $hasDeliveredOrder = OrderItem::where('product_id', $product->id)
            ->whereHas('order', function ($q) use ($userId) {
                $q->where(function ($sub) use ($userId) {
                    $sub->where('user_id', $userId);
                })
                ->whereIn('status', ['DELIVERED', 'COMPLETED', 'CONFIRMED']);
            })
            ->exists();

        if (!$hasDeliveredOrder) {
            return response()->json([
                'status' => 'error',
                'message' => 'Review privilege denied: Only verified buyers with completed & delivered orders can leave a review.'
            ], 403);
        }

        $review = ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $userId,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'verified_purchase' => true,
        ]);

        // Invalidate Redis cache to ensure new review is visible immediately
        Cache::forget("product_{$product->id}_reviews_summary");
        Cache::forget("product_{$product->slug}");

        return response()->json([
            'status' => 'success',
            'message' => 'Review submitted successfully!',
            'review' => [
                'id' => $review->id,
                'user_name' => auth()->user() ? auth()->user()->name : 'Farmer Customer',
                'rating' => $review->rating,
                'comment' => $review->comment,
                'verified_purchase' => true,
                'created_at' => now()->format('M d, Y'),
            ]
        ], 201);
    }
}
