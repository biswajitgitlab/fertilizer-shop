import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Sprout, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HeroSlide {
  id: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  highlightText: string;
  subtitle: string;
  imageUrl: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  tagline: string;
  statBadgeText: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-npk',
    badge: 'Government Certified Genuine Inputs',
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
    title: 'Smarter Harvests.',
    highlightText: 'Liquid Certified Care.',
    subtitle: '100% Genuine NPK 19:19:19, Urea, DAP, Micronutrients & High-Yield Seeds delivered directly to your farm gate.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=95&w=2000',
    primaryCtaText: 'Browse Store Products',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Try AI Crop Doctor',
    secondaryCtaLink: '/diagnose',
    tagline: '100% Water Soluble • NPK 19:19:19',
    statBadgeText: '12,500+ Farm Bags Delivered'
  },
  {
    id: 'slide-pest',
    badge: 'Fast Field Dispatch • 48 hr Delivery',
    badgeIcon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    title: 'Precision Crop Care.',
    highlightText: 'Zero Pest Loss Guaranteed.',
    subtitle: 'NABL & ICAR approved Insecticides, Fungicides, and Herbicides to protect Wheat, Paddy, Tomato, & Cotton crops.',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=95&w=2000',
    primaryCtaText: 'Explore Pesticides',
    primaryCtaLink: '/products?category=pesticides-insecticides',
    secondaryCtaText: 'Speak to Agronomist',
    secondaryCtaLink: '/planner',
    tagline: 'Targeted Pest Control • 99% Efficacy',
    statBadgeText: 'Protected 45,000+ Acres'
  },
  {
    id: 'slide-organic',
    badge: '100% Eco-Friendly Bio Nutrition',
    badgeIcon: <Sprout className="w-3.5 h-3.5 text-emerald-400" />,
    title: 'Soil Regeneration.',
    highlightText: 'Bio-Organic Boosters.',
    subtitle: 'Enrich soil organic carbon and beneficial microbes with Vermicompost, Humic Acid & Seaweed Concentrates.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=95&w=2000',
    primaryCtaText: 'Shop Bio Fertilizers',
    primaryCtaLink: '/products?category=organic-bio-fertilizers',
    secondaryCtaText: 'View Soil Lab Testing',
    secondaryCtaLink: '/products',
    tagline: 'Organic NPK • Soil Health Restoration',
    statBadgeText: '25%+ Higher Root Development'
  }
];

export const HeroCarousel: React.FC<{ slides?: HeroSlide[] }> = ({ slides = DEFAULT_SLIDES }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sync scroll position with current slide index
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth || 1;
    const index = Math.min(slides.length - 1, Math.max(0, Math.round(scrollLeft / width)));
    setCurrent(index);
  };

  // Smoothly scroll to a specific slide index
  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
      setCurrent(index);
    }
  };

  // Flipkart-style Auto-Rotation
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (current + 1) % slides.length;
      scrollToSlide(nextIndex);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, isPaused, slides.length]);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Flipkart Horizontal Card Swipe Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto w-full snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="snap-center shrink-0 w-full min-h-[460px] sm:min-h-[420px] lg:min-h-[480px] lg:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-950 relative flex flex-col justify-between group select-none"
          >
            {/* Ultra-Crisp 4K Background Image */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-105 contrast-105"
              loading={idx === 0 ? "eager" : "lazy"}
            />

            {/* Ambient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Overlay Content Body */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 sm:p-8 lg:p-12 space-y-4 pointer-events-none">
              
              {/* Top Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
                <div className="inline-flex items-center gap-2 bg-slate-950/70 backdrop-blur-xl border border-emerald-400/40 text-emerald-300 text-[11px] sm:text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg">
                  {slide.badgeIcon}
                  <span className="truncate max-w-[260px] sm:max-w-none">{slide.badge}</span>
                </div>

                <div className="hidden md:inline-flex items-center gap-2 bg-slate-950/80 backdrop-blur-xl text-emerald-400 border border-emerald-500/30 text-[11px] font-black px-3 py-1 rounded-full shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{slide.statBadgeText}</span>
                </div>
              </div>

              {/* Center Content Body */}
              <div className="max-w-2xl space-y-2 sm:space-y-3.5 my-auto pt-2 pb-2">
                <div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                    {slide.title}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-200">
                      {slide.highlightText}
                    </span>
                  </h1>
                </div>

                <p className="text-xs sm:text-sm lg:text-base text-white/95 drop-shadow-sm leading-relaxed font-medium">
                  {slide.subtitle}
                </p>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 pointer-events-auto">
                  <Link
                    to={slide.primaryCtaLink}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-500/30 active:scale-95 cursor-pointer"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {slide.secondaryCtaText && slide.secondaryCtaLink && (
                    <Link
                      to={slide.secondaryCtaLink}
                      className="inline-flex items-center gap-2 bg-slate-950/60 hover:bg-slate-950/80 text-white backdrop-blur-xl border border-white/40 font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <span>{slide.secondaryCtaText}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Tagline Pill */}
              <div className="pt-2 pointer-events-auto">
                <div className="text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/30 w-max shadow-md">
                  {slide.tagline}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Flipkart-Style Capsule Slide Indicator Track (Positioned Below Carousel) */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === current
                ? 'w-9 sm:w-12 bg-emerald-500 shadow-md shadow-emerald-500/40'
                : 'w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
