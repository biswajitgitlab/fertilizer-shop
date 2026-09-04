import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Calendar, ShieldCheck, PhoneCall, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ServiceItem {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  fallbackUrl: string;
  imageTag: string;
  imageDetailTitle: string;
  imageDetailValue: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'ai-diagnose',
    badge: 'Instant AI Diagnostics',
    badgeIcon: <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />,
    title: 'Scan Leaf Diseases & Get Spray Plans',
    description: 'Scan affected crop leaves with your smartphone camera. Our trained AI model detects 150+ fungal, bacterial, and pest infestations with 98%+ precision.',
    metric: 'Instant 98.4% AI Match',
    ctaText: 'Test AI Doctor Now',
    ctaLink: '/diagnose',
    imageUrl: '/images/services/ai_crop_doctor_scan.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=95&w=1000',
    imageTag: 'AI Camera Active',
    imageDetailTitle: 'Fungal Leaf Blight',
    imageDetailValue: 'Instant Spray Recipe'
  },
  {
    id: 'soil-testing',
    badge: 'Precision Lab Testing',
    badgeIcon: <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />,
    title: 'Soil & Water 14-Parameter Analysis',
    description: 'Send soil samples to ICAR & NABL verified labs to get 14-parameter NPK, pH, EC, and micronutrient recommendation charts in 48 hours.',
    metric: '48-Hour Digital Lab Report',
    ctaText: 'View Soil Lab Testing',
    ctaLink: '/products',
    imageUrl: '/images/services/soil_water_testing_lab.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=95&w=1000',
    imageTag: 'NABL Certified',
    imageDetailTitle: '14 Nutrients Tested',
    imageDetailValue: 'Custom NPK Formula'
  },
  {
    id: 'doorstep-delivery',
    badge: 'Heavy Load Logistics',
    badgeIcon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    title: 'Custom NPK & Doorstep Delivery',
    description: 'Order custom NPK formulations and 50kg moisture-proof bag orders delivered directly to your farm gate across Punjab, Haryana, UP & MP.',
    metric: 'Live GPS Order Tracking',
    ctaText: 'Explore Inputs',
    ctaLink: '/products',
    imageUrl: '/images/services/doorstep_fertilizer_delivery.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=95&w=1000',
    imageTag: 'Farm Gate Dispatch',
    imageDetailTitle: 'Custom NPK Mix',
    imageDetailValue: 'Fast Farm Delivery'
  },
  {
    id: 'drone-spray',
    badge: 'Drone Fleet Booking',
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    title: 'Precision Drone Spray Service',
    description: 'Book certified agricultural spray drones for liquid fertilizers and crop protection sprays. Save 90% water and achieve 100% uniform canopy coverage.',
    metric: '10 Acres in 15 Mins',
    ctaText: 'Book Spray Drone',
    ctaLink: '/products',
    imageUrl: '/images/services/agri_drone_spraying.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=95&w=1000',
    imageTag: '90% Water Savings',
    imageDetailTitle: 'High Precision',
    imageDetailValue: 'Zero Field Trampling'
  },
  {
    id: 'crop-planner',
    badge: 'Automated Schedule',
    badgeIcon: <Calendar className="w-3.5 h-3.5 text-sky-400" />,
    title: 'Personalized Crop Dosage Calendar',
    description: 'Input your sowing date for Paddy, Wheat, Cotton, Sugarcane, or Vegetables. Receive automated alerts for basal, tillering, and top-dressing sprays.',
    metric: '30%+ Fertilizer Savings',
    ctaText: 'Open Smart Planner',
    ctaLink: '/planner',
    imageUrl: '/images/services/smart_crop_calendar.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=95&w=1000',
    imageTag: 'Automated SMS Alerts',
    imageDetailTitle: 'Growth Stage 2',
    imageDetailValue: 'Dosage in 2 Days'
  },
  {
    id: 'agronomist-call',
    badge: 'Expert Tele-Consult',
    badgeIcon: <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />,
    title: '1-on-1 Certified Agronomist Advice',
    description: 'Speak directly with senior agronomists for customized fertilizer schedules, soil disease recovery, and yield optimization.',
    metric: 'Free Tele-Agronomist Support',
    ctaText: 'Speak to Agronomist',
    ctaLink: '/planner',
    imageUrl: '/images/services/agronomist_consultation.png',
    fallbackUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=95&w=1000',
    imageTag: 'Doctor Verified',
    imageDetailTitle: 'Senior Agronomist',
    imageDetailValue: 'Call Support Active'
  }
];

export const ServicesCarousel: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate items per page dynamically
  useEffect(() => {
    const updateItemsPerPage = () => {
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerPage(3);
      else if (w >= 640) setItemsPerPage(2);
      else setItemsPerPage(1);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(SERVICES.length / itemsPerPage));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const pageWidth = scrollRef.current.clientWidth || 1;
    const currentPage = Math.min(totalPages - 1, Math.max(0, Math.round(scrollLeft / pageWidth)));
    setActivePage(currentPage);
  };

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const pageWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: pageIndex * pageWidth, behavior: 'smooth' });
      setActivePage(pageIndex);
    }
  };

  // Auto-scroll every 6 seconds
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const timer = setInterval(() => {
      const nextPageIndex = (activePage + 1) % totalPages;
      scrollToPage(nextPageIndex);
    }, 6000);
    return () => clearInterval(timer);
  }, [activePage, isPaused, totalPages]);

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
          High-Yield Smart Farming Solutions
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Agriculture Services Built for Maximum Yield
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Next-generation technology, NABL lab-tested inputs, precision drone spraying, and automated crop calendars.
        </p>
      </div>

      {/* Flipkart Horizontal Swipeable Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {SERVICES.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-400 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            {/* Top Visual Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50 dark:bg-slate-800/80">
              <img
                src={item.imageUrl}
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = item.fallbackUrl;
                }}
                className="w-full h-full object-cover brightness-105 contrast-105 hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
                {item.imageTag}
              </div>

              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-100">{item.imageDetailTitle}</span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {item.imageDetailValue}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {item.badgeIcon}
                  <span>{item.badge}</span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{item.metric}</span>
                </span>

                <Link
                  to={isAuthenticated ? item.ctaLink : '/login'}
                  className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flipkart Capsule Indicator Track */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <button
              key={pageIdx}
              onClick={() => scrollToPage(pageIdx)}
              aria-label={`Go to services page ${pageIdx + 1}`}
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
