import React, { useState, useEffect, useMemo, useRef } from 'react';
import { productApi } from '../../api/productApi';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles, TrendingUp, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
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
    <section className="py-6 sm:py-8 space-y-4">
      <div className="relative rounded-2xl sm:rounded-3xl bg-emerald-50/90 dark:bg-[#043427]/90 backdrop-blur-xl border border-amber-200/60 dark:border-emerald-800/50 p-4 sm:p-7 shadow-xl shadow-amber-900/5 transition-all duration-300">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Mobile Title Block */}
        <div className="flex flex-col gap-4 pb-4 border-b border-amber-100 dark:border-slate-800 relative z-10">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <span className="absolute inline-flex h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-orange-500/20 animate-ping" />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/30 border border-white/20">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Most Visited &amp; Trending
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-rose-500/15 dark:from-orange-950/80 dark:via-amber-950/80 dark:to-rose-950/80 text-orange-700 dark:text-orange-300 border border-orange-300/80 dark:border-orange-800 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    Live Interest
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed hidden xs:block mt-0.5">
                  Popular inputs &amp; fertilizers frequently inspected by farmers across India this week
                </p>
              </div>
            </div>

            {/* Desktop Navigation Chevrons */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollTrack('left')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous trending products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('right')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Next trending products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips Bar (Touch-friendly Pill Carousel) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Live Analytics Ticker Bar */}
        <div className="mt-3 mb-4 flex items-center justify-between gap-2 bg-amber-500/5 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-800/40 rounded-xl sm:rounded-2xl px-3.5 py-2 text-[11px] sm:text-xs text-slate-700 dark:text-amber-200/90 font-semibold relative z-10">
          <div className="flex items-center gap-1.5 truncate">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Swipe left to explore top ranked inputs</span>
          </div>
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-black shrink-0 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 fill-orange-500 animate-bounce" />
            <span>{dynamicSearchFormatted}+ Searches Today</span>
          </div>
        </div>

        {/* Mobile-Optimized Swipeable Track (2.2 Card Peek Layout on Mobile) */}
        {isLoading ? (
          <div className="flex gap-3 sm:gap-6 overflow-hidden relative z-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="shrink-0 w-[160px] xs:w-[175px] sm:w-[240px] md:w-[270px] lg:w-[290px] bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl sm:rounded-3xl h-64 sm:h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth relative z-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredTrending.map((product, idx) => {
                const rank = getRankBadge(idx, product.viewsCount);
                return (
                  <div
                    key={product.id}
                    className="snap-start shrink-0 w-[160px] xs:w-[175px] sm:w-[240px] md:w-[270px] lg:w-[290px] transition-all"
                  >
                    <ProductCard product={product} trendingRankLabel={rank.label} disableHoverEffect={true} />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Mobile Swipe Progress Indicator Bar */}
        {!isLoading && filteredTrending.length > 2 && (
          <div className="mt-2 flex items-center justify-center gap-2 relative z-10">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>
          </div>
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

