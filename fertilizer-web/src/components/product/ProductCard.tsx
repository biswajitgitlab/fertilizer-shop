import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { RatingStars } from './RatingStars';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isInCart = items.some(item => item.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Top Image Box */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            {typeof product.category === 'object' ? (product.category as any).name : product.category}
          </span>
          {product.npk && (product.npk.n > 0 || product.npk.p > 0 || product.npk.k > 0) && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              NPK {product.npk.n}:{product.npk.p}:{product.npk.k}
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-2 py-1 rounded-lg shadow-md">
            -{discount}%
          </div>
        )}

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => { e.preventDefault(); toast.success("Added to wishlist"); }}
          className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-xs text-gray-600 hover:text-rose-600 rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <RatingStars rating={product.rating} count={product.reviewsCount} />
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Link to={`/products/${product.slug}`} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 mt-1 font-medium">
            Pack Unit: <span className="text-gray-800 font-semibold">{product.unit}</span>
          </p>
        </div>

        {/* Pricing & Add Button */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-800">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Incl. 18% GST</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              isInCart
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add to Cart"
          >
            {isInCart ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
