import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrendingProductsSection: React.FC = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const data = await productApi.getTrending();
        if (isMounted) {
          setTrending(data);
        }
      } catch (e) {
        console.error("Failed to load trending products:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchTrending();
    return () => { isMounted = false; };
  }, []);

  if (!isLoading && trending.length === 0) return null;

  return (
    <section className="py-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Most Visited &amp; Trending
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Live Interest
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Popular inputs &amp; fertilizers frequently inspected by farmers across India this week
            </p>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-100 dark:bg-slate-800 rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative"
            >
              {/* Popularity Rank Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/40 shadow-lg pointer-events-none">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>{product.viewsCount && product.viewsCount > 0 ? `${product.viewsCount} Visits` : '🔥 Top Pick'}</span>
              </div>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
