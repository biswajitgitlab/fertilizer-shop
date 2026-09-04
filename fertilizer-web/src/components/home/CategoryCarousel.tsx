import React, { useRef, useState, useEffect } from 'react';
import { Sprout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../types';

interface CategoryCarouselProps {
  categories: Category[];
  getCategoryImage: (name: string, defaultImg?: string) => string;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, getCategoryImage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Dynamically calculate visible items per page based on viewport width
  useEffect(() => {
    const updateItemsPerPage = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setItemsPerPage(4);
      } else if (w >= 640) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

  // Sync current active page on touch scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const pageWidth = scrollRef.current.clientWidth || 1;
    const currentPage = Math.min(totalPages - 1, Math.max(0, Math.round(scrollLeft / pageWidth)));
    setActivePage(currentPage);
  };

  // Scroll smoothly by page index
  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const pageWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: pageIndex * pageWidth, behavior: 'smooth' });
      setActivePage(pageIndex);
    }
  };

  // Auto-scroll by page every 5 seconds
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const timer = setInterval(() => {
      const nextPageIndex = (activePage + 1) % totalPages;
      scrollToPage(nextPageIndex);
    }, 5000);
    return () => clearInterval(timer);
  }, [activePage, isPaused, totalPages]);

  return (
    <div className="relative w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Interactive Crop &amp; Category Navigation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Certified Crop Inputs
          </h2>
        </div>
      </div>

      {/* Horizontal Swipeable Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const imgUrl = getCategoryImage(cat.name, cat.icon || cat.image);
          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="snap-start shrink-0 w-[calc(100%-1.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-0.75rem)] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 shadow-xl cursor-pointer group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50 dark:bg-slate-800/80">
                <img
                  src={imgUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover brightness-105 contrast-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 dark:opacity-80 dark:group-hover:opacity-95 transition-opacity duration-300" />
                <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {cat.count || 10}+ Products
                </span>
              </div>

              <div className="p-4 space-y-1 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {cat.name}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>Browse catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Viewport Page Indicator Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <button
              key={pageIdx}
              onClick={() => scrollToPage(pageIdx)}
              aria-label={`Go to category page ${pageIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                pageIdx === activePage
                  ? 'w-9 sm:w-12 bg-emerald-500 shadow-md shadow-emerald-500/40'
                  : 'w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
