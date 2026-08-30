import React, { useState, useEffect, useMemo } from 'react';
import { productApi } from '../../api/productApi';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles, Eye, TrendingUp, Filter, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TrendingProductsSection: React.FC = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [liveStats, setLiveStats] = useState<{ searches_today: number; total_views: number }>({
    searches_today: 1452,
    total_views: 3840
  });

  const fetchData = async () => {
    try {
      const [trendingData, statsData] = await Promise.all([
        productApi.getTrending(),
        productApi.getLiveStats()
      ]);
      setTrending(trendingData);
      if (statsData && statsData.searches_today) {
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
    // Poll live Redis analytics every 20 seconds
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter products based on selected category tab
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
    <section className="py-10 space-y-8">
      {/* Container Box with ambient glow background */}
      <div className="relative rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-200/60 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-amber-900/5 transition-all duration-300">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-100 dark:border-slate-800 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Flame Icon Container */}
            <div className="relative shrink-0 mt-1 sm:mt-0">
              <span className="absolute inline-flex h-12 w-12 rounded-2xl bg-orange-500/20 animate-ping" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/30 border border-white/20">
                <Flame className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Most Visited &amp; Trending
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

          {/* Category Tabs & Ticker Metric */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Inspection Insight Ticker Bar */}
        <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-800/40 rounded-2xl px-4 py-2.5 text-xs text-slate-700 dark:text-amber-200/90 font-semibold relative z-10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Real-time Redis analytics update automatically based on farmer views.</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold shrink-0">
            <Zap className="w-3.5 h-3.5 fill-orange-500 animate-bounce" />
            <span>{dynamicSearchFormatted}+ Searches Today</span>
          </div>
        </div>

        {/* Grid Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-200/70 dark:bg-slate-800/70 rounded-3xl h-80 animate-pulse border border-slate-300/40 dark:border-slate-700/40" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
            >
              {filteredTrending.map((product, idx) => {
                const rank = getRankBadge(idx, product.viewsCount);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative group/card"
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

