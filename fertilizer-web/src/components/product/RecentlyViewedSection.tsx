import React, { useRef } from 'react';
import { useRecentlyViewedStore } from '../../store/recentlyViewedStore';
import { ProductCard } from './ProductCard';
import { History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const RecentlyViewedSection: React.FC<{ currentProductId?: string | number }> = ({ currentProductId }) => {
  const { items, clearRecentlyViewed } = useRecentlyViewedStore();
  const scrollRef = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Recently Viewed Products
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                {filteredItems.length} items
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium hidden sm:block">
              Products you inspected during your browsing session
            </p>
          </div>
        </div>

        {/* Scroll Controls & Clear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800/60 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer ml-1"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
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
    </section>
  );
};
