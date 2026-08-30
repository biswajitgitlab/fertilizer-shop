import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { RatingStars } from './RatingStars';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  AnimatedSparkles,
  AnimatedShield,
  AnimatedHeart,
  AnimatedCart,
  AnimatedCheck,
  AnimatedPulseBadge
} from '../common/AnimatedIcons';

import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  trendingRankLabel?: string;
  disableHoverEffect?: boolean;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600";

export const ProductCard: React.FC<ProductCardProps> = ({ product, trendingRankLabel }) => {
  const { addToCart, items } = useCart();
  const { isAdmin } = useAuth();
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isInCart = items.some(item => item.product.id === product.id);
  const [isLiked, setIsLiked] = useState(false);

  const [imgSrc, setImgSrc] = useState<string>(() => {
    const raw = product.images?.[0];
    if (!raw || raw.includes('placeholder')) {
      return FALLBACK_IMAGE;
    }
    return raw;
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="w-full h-full">
      <motion.div
        className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-100/90 dark:border-slate-800 shadow-sm sm:shadow-lg hover:shadow-xl hover:border-emerald-400/60 dark:hover:border-emerald-500/50 hover:shadow-emerald-950/10 dark:hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col overflow-hidden h-full"
      >
        {/* Top Image Container */}
        <Link
          to={`/products/${product.slug}`}
          className="relative block aspect-square overflow-hidden bg-emerald-950/10"
        >
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />

          {/* Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Floating Top Badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-20 pointer-events-none max-w-[85%]">
            {trendingRankLabel && (
              <span className="bg-amber-500/95 dark:bg-slate-900/95 backdrop-blur-md text-white dark:text-amber-300 border border-amber-400/60 dark:border-amber-500/50 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md flex items-center gap-1 w-max">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-amber-400 shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-none">{trendingRankLabel}</span>
              </span>
            )}
            <span className="bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1 w-max">
              <AnimatedSparkles size={10} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[75px] sm:max-w-none">
                {typeof product.category === 'object' ? (product.category as any).name : product.category}
              </span>
            </span>
            {product.npk && (product.npk.n > 0 || product.npk.p > 0 || product.npk.k > 0) && (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2.5 rounded-md sm:rounded-lg shadow-xs w-max">
                NPK {product.npk.n}:{product.npk.p}:{product.npk.k}
              </span>
            )}
          </div>

          {/* Floating Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ rotate: -4 }}
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-20 bg-rose-600/95 backdrop-blur-md text-white font-black text-[9px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md border border-rose-400/40"
            >
              -{discount}%
            </motion.div>
          )}

          {/* Floating Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 z-20 p-1.5 sm:p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110"
            aria-label="Save to wishlist"
          >
            <AnimatedHeart isLiked={isLiked} size={14} />
          </button>
        </Link>

        {/* Info Section */}
        <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between gap-2 sm:gap-3 bg-gradient-to-b from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/50 text-gray-900 dark:text-white">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
              <RatingStars rating={product.rating} count={product.reviewsCount} compact />
              {product.stock > 0 ? (
                <AnimatedPulseBadge text="In Stock" color="emerald" />
              ) : (
                <span className="text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 whitespace-nowrap shrink-0">
                  Out of Stock
                </span>
              )}
            </div>

            <Link to={`/products/${product.slug}`} className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug tracking-tight">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1 mt-1 text-[9px] sm:text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              <AnimatedShield size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Govt Certified • {product.unit}</span>
            </div>
          </div>

          {/* Price & Action Button (Flipkart / Amazon Mobile E-Commerce Style) */}
          <div className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm sm:text-lg font-black text-emerald-900 dark:text-emerald-400 tracking-tight whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[9px] sm:text-xs text-gray-400 dark:text-slate-500 line-through font-medium whitespace-nowrap">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[8px] sm:text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-bold truncate">Incl. GST</p>
            </div>

            {isAdmin ? (
              <Link
                to={`/admin/products/edit/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-auto px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 shrink-0 whitespace-nowrap transition-all"
              >
                <AnimatedShield size={14} className="text-amber-500 shrink-0" />
                <span>Edit</span>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full sm:w-auto px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 font-black text-[11px] sm:text-xs cursor-pointer shadow-xs shrink-0 whitespace-nowrap ${
                  isInCart
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300/80 dark:border-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Add to Cart"
              >
                {isInCart ? (
                  <>
                    <AnimatedCheck size={14} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <AnimatedCart size={14} className="text-white shrink-0" active />
                    <span>Add</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};


