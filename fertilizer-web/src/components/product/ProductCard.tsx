import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { RatingStars } from './RatingStars';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600";

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isInCart = items.some(item => item.product.id === product.id);

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

  return (
    <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-2xl hover:border-emerald-300/80 transition-all duration-500 flex flex-col overflow-hidden h-full transform hover:-translate-y-1">
      
      {/* Top Liquid Glass Image Container */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-4/3 sm:aspect-square overflow-hidden bg-emerald-950/20">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-slate-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {typeof product.category === 'object' ? (product.category as any).name : product.category}
          </span>
          {product.npk && (product.npk.n > 0 || product.npk.p > 0 || product.npk.k > 0) && (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
              NPK {product.npk.n}:{product.npk.p}:{product.npk.k}
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-rose-400/30">
            -{discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); toast.success("Added to wishlist"); }}
          className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur-md text-gray-700 hover:text-rose-600 hover:bg-white rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer transform translate-y-2 group-hover:translate-y-0"
        >
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3 bg-gradient-to-b from-white via-white to-slate-50/50">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <RatingStars rating={product.rating} count={product.reviewsCount} />
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Link to={`/products/${product.slug}`} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug tracking-tight">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Govt Certified • Pack: <strong className="text-gray-800">{product.unit}</strong></span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-900 tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-700/80 font-bold">Incl. GST &amp; Lab Guarantee</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2.5 rounded-2xl transition-all duration-300 flex items-center gap-1.5 font-bold text-xs cursor-pointer ${
              isInCart
                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300/60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transform active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add to Cart"
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
