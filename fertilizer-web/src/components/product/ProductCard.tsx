import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { RatingStars } from './RatingStars';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';
import {
  AnimatedSparkles,
  AnimatedShield,
  AnimatedHeart,
  AnimatedCart,
  AnimatedCheck,
  AnimatedPulseBadge
} from '../common/AnimatedIcons';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600";

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
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

  // 3D Perspective Mouse Tracking State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const glareOpacity = useSpring(isHovered, { stiffness: 200, damping: 20 });
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    isHovered.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    isHovered.set(0);
  };

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
    <div className="perspective-1000 w-full h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-gray-100/90 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:border-emerald-400/60 dark:hover:border-emerald-500/50 transition-all duration-200 flex flex-col overflow-hidden h-full transform-gpu"
      >
        {/* Dynamic 3D Specular Glare Reflection Overlay */}
        <motion.div
          style={{
            opacity: glareOpacity,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)`
            ),
          }}
          className="pointer-events-none absolute inset-0 z-30 rounded-3xl mix-blend-overlay transition-opacity duration-300"
        />

        {/* Top 3D Depth Image Container */}
        <Link
          to={`/products/${product.slug}`}
          className="relative block aspect-4/3 sm:aspect-square overflow-hidden bg-emerald-950/20 transform-gpu"
          style={{ transform: "translateZ(25px)" }}
        >
          <motion.img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover object-center transform-gpu"
          />

          {/* Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 3D Floating Top Badges */}
          <div
            className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 transform-gpu"
            style={{ transform: "translateZ(45px)" }}
          >
            <span className="bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1">
              <AnimatedSparkles size={12} className="text-emerald-400" />
              {typeof product.category === 'object' ? (product.category as any).name : product.category}
            </span>
            {product.npk && (product.npk.n > 0 || product.npk.p > 0 || product.npk.k > 0) && (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                NPK {product.npk.n}:{product.npk.p}:{product.npk.k}
              </span>
            )}
          </div>

          {/* 3D Floating Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ transform: "translateZ(45px)" }}
              className="absolute top-3 right-3 z-20 bg-rose-600/95 backdrop-blur-md text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-lg border border-rose-400/40"
            >
              -{discount}% OFF
            </motion.div>
          )}

          {/* 3D Floating Wishlist Button */}
          <button
            onClick={toggleWishlist}
            style={{ transform: "translateZ(40px)" }}
            className="absolute bottom-3 right-3 z-20 p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110"
            aria-label="Save to wishlist"
          >
            <AnimatedHeart isLiked={isLiked} size={16} />
          </button>
        </Link>

        {/* 3D Info Section */}
        <div
          className="p-5 flex flex-col flex-1 justify-between gap-3 bg-gradient-to-b from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/50 text-gray-900 dark:text-white transform-gpu"
          style={{ transform: "translateZ(15px)" }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <RatingStars rating={product.rating} count={product.reviewsCount} />
              {product.stock > 0 ? (
                <AnimatedPulseBadge text="In Stock" color="emerald" />
              ) : (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                  Out of Stock
                </span>
              )}
            </div>

            <Link to={`/products/${product.slug}`} className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug tracking-tight">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
              <AnimatedShield size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Govt Certified • Pack: <strong className="text-gray-800 dark:text-slate-200">{product.unit}</strong></span>
            </div>
          </div>

          {/* Price & 3D Action Button */}
          <div className="pt-3 border-t border-gray-100/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-400 tracking-tight">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 line-through font-medium">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-bold">Incl. GST &amp; Lab Guarantee</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              style={{ transform: "translateZ(30px)" }}
              className={`px-3.5 py-2.5 rounded-2xl transition-all duration-300 flex items-center gap-1.5 font-bold text-xs cursor-pointer ${
                isInCart
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300/60 dark:border-emerald-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Add to Cart"
            >
              {isInCart ? (
                <>
                  <AnimatedCheck size={16} className="text-emerald-700 dark:text-emerald-300" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <AnimatedCart size={16} className="text-white" active />
                  <span>Add</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


