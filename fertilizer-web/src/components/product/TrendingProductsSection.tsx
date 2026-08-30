import React, { useState, useEffect, useMemo, useRef } from 'react';
import { productApi } from '../../api/productApi';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TrendingProductsSection: React.FC = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [liveStats, setLiveStats] = useState<{ searches_today: number; total_views: number }>({
    searches_today: 0,
    total_views: 0
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fetchData = async () => {
    try {
      const [trendingData, statsData] = await Promise.all([
        productApi.getTrending(),
        productApi.getLiveStats()
      ]);
      setTrending(trendingData);
      if (statsData) {
        setLiveStats(statsData);
      }
    } catch (e) {
      console.error("Failed to load live trending analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrending = useMemo(() => {
    if (activeCategory === 'all') return trending;
    return trending.filter(p => {
      const cat = (typeof p.category === 'object' ? (p.category as any)?.name : p.category) || p.categorySlug || '';
      return cat.toLowerCase().includes(activeCategory.toLowerCase());
    });
  }, [trending, activeCategory]);

  if (!isLoading && trending.length === 0) return null;

  const categories = [
    { id: 'all', label: 'All Trending' },
    { id: 'fertilizer', label: 'Fertilizers' },
    { id: 'pesticide', label: 'Crop Protection' },
    { id: 'organic', label: 'Organic & Bio' },
  ];

  const getRankBadge = (idx: number, views?: number) => {
    const ranks = [
      { label: '#1 Top Trending', color: 'from-amber-500 to-orange-600 text-white' },
      { label: '#2 High Demand', color: 'from-orange-500 to-rose-600 text-white' },
      { label: '#3 Most Inspected', color: 'from-rose-500 to-pink-600 text-white' },
      { label: '#4 Trending Pick', color: 'from-emerald-500 to-teal-600 text-white' },
    ];
    const defaultRank = { label: views ? `${views.toLocaleString()} Visits` : '🔥 Popular', color: 'from-slate-700 to-slate-900 text-white' };
    return ranks[idx] || defaultRank;
  };

  const dynamicSearchFormatted = useMemo(() => {
    return liveStats.searches_today.toLocaleString();
  }, [liveStats.searches_today]);

  return (
    <section className="py-8 space-y-6">
      <div className="relative rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-200/60 dark:border-slate-800 p-5 sm:p-8 shadow-xl shadow-amber-900/5 transition-all duration-300">
        
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-amber-100 dark:border-slate-800 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0 mt-1 sm:mt-0">
              <span className="absolute inline-flex h-12 w-12 rounded-2xl bg-orange-500/20 animate-ping" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/30 border border-white/20">
                <Flame className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Most Visited &amp; Trending Carousel
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-rose-500/15 dark:from-orange-950/80 dark:via-amber-950/80 dark:to-rose-950/80 text-orange-700 dark:text-orange-300 border border-orange-300/80 dark:border-orange-800 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  Live Interest
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
                Popular inputs &amp; fertilizers frequently inspected by farmers across India this week
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Analytics Ticker */}
        <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-800/40 rounded-2xl px-4 py-2 text-xs text-slate-700 dark:text-amber-200/90 font-semibold relative z-10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Swipe horizontally to view popular inputs.</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold shrink-0">
            <Zap className="w-3.5 h-3.5 fill-orange-500 animate-bounce" />
            <span>{dynamicSearchFormatted}+ Searches Today</span>
          </div>
        </div>

        {/* Swipeable Multi-Card Track */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden relative z-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="shrink-0 w-64 sm:w-72 bg-slate-200/70 dark:bg-slate-800/70 rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent relative z-10"
            >
              {filteredTrending.map((product, idx) => {
                const rank = getRankBadge(idx, product.viewsCount);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="snap-start shrink-0 w-[240px] sm:w-[280px] lg:w-[300px]"
                  >
                    <ProductCard product={product} trendingRankLabel={rank.label} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && filteredTrending.length === 0 && (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
            No products found matching "{activeCategory}".
          </div>
        )}
      </div>
    </section>
  );
};
