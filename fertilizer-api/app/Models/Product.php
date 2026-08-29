<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'short_desc', 'usage_instructions',
        'composition_json', 'suitable_crops_json', 'price', 'discount_price', 'stock_qty',
        'unit', 'min_order_qty', 'images_json', 'weight_kg', 'is_active', 'is_featured', 'seo_meta'
    ];

    protected $casts = [
        'composition_json' => 'array',
        'suitable_crops_json' => 'array',
        'images_json' => 'array',
        'seo_meta' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['stock'];

    public function getStockAttribute()
    {
        return $this->attributes['stock_qty'] ?? 0;
    }

    public function setStockAttribute($value)
    {
        $this->attributes['stock_qty'] = $value;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bundles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(ProductBundle::class, 'bundle_product')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
