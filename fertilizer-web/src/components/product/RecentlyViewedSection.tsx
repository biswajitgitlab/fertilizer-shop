import React, { useRef, useEffect } from 'react';
import { useRecentlyViewedStore } from '../../store/recentlyViewedStore';
import { ProductCard } from './ProductCard';
import { History, ChevronLeft, ChevronRight, Trash2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const RecentlyViewedSection: React.FC<{ currentProductId?: string | number }> = ({ currentProductId }) => {
  const { items, isSyncedWithServer, fetchRecentlyViewed, clearRecentlyViewed } = useRecentlyViewedStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentlyViewed();
  }, [fetchRecentlyViewed]);

  // Filter out current product if on Product Detail page
  const filteredItems = currentProductId
    ? items.filter(item => String(item.id) !== String(currentProductId))
    : items;

  if (filteredItems.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 space-y-4">
      <div className="relative rounded-3xl bg-emerald-50/90 dark:bg-[#043427]/90 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-800/50 p-6 sm:p-8 shadow-xl shadow-emerald-900/5 transition-all duration-300">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold border border-emerald-300/60 dark:border-emerald-800/60">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
                Recently Viewed Products
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60">
                  {filteredItems.length} items
                </span>
                {isSyncedWithServer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-300/60 dark:border-teal-800">
                    <ShieldCheck className="w-3 h-3 text-teal-500" />
                    Account Synced
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
                Products you inspected during your browsing session
              </p>
            </div>
          </div>

          {/* Scroll Controls & Clear */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer ml-1"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-5 snap-x snap-mandatory no-scrollbar scroll-smooth relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredItems.map((prod) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 sm:w-72 shrink-0 snap-start"
            >
              <ProductCard product={prod} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
