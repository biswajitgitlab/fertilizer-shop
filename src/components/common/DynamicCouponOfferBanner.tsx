import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Tag, Clock, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../api/axiosInstances';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

export interface PublicCoupon {
  id: number | string;
  code: string;
  type: 'PERCENT' | 'FIXED' | 'percent' | 'fixed';
  value: number | string;
  min_order: number | string;
  is_new_customer_only?: boolean;
  expires_at?: string;
}

// A highly premium, interactive, glassmorphic ticket component
const CouponTicket: React.FC<{
  coupon: PublicCoupon;
  timeLeft: { hours: number; minutes: number; seconds: number };
  isActive: boolean;
}> = ({ coupon, timeLeft, isActive }) => {
  const [copied, setCopied] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { applyCoupon, couponCode: activeCartCoupon } = useCart();

  const isApplied = activeCartCoupon === coupon.code || copied;

  const handleCopyAndApply = async () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setShowParticles(true);
    
    setTimeout(() => setShowParticles(false), 2000);
    setTimeout(() => setCopied(false), 4000);

    const res = await applyCoupon(coupon.code);
    if (res.success) {
      toast.success(`🎉 ${coupon.code} applied!`);
    } else {
      toast.success(`📋 Copied ${coupon.code}`);
    }
  };

  const getDiscountDisplay = () => {
    const isPercent = String(coupon.type).toUpperCase() === 'PERCENT';
    return isPercent ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;
  };

  return (
    <div className="w-full h-full p-2 sm:p-4 perspective-1000">
      <motion.div
        whileHover={{ scale: 1.01, rotateX: 2, rotateY: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row group"
      >
        {/* Animated Shimmer Sweep */}
        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent skew-x-[-30deg] group-hover:animate-shimmer pointer-events-none z-20" />

        {/* Particles on click */}
        <AnimatePresence>
          {showParticles && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2rem]">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: '50%', y: '50%', scale: 0, opacity: 1 }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: Math.random() * 1.5,
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    ['bg-emerald-400', 'bg-amber-400', 'bg-teal-400', 'bg-rose-400'][i % 4]
                  }`}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* --- LEFT SIDE: THE OFFER --- */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center relative">
          
          {/* Subtle Background Icon */}
          <Tag className="absolute -left-6 -bottom-6 w-40 h-40 text-emerald-500/5 dark:text-emerald-400/5 -rotate-12 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Special Offer
              </span>
              {coupon.is_new_customer_only && (
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
                  1st Order
                </span>
              )}
            </div>

            <div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
                {getDiscountDisplay()}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {Number(coupon.min_order) > 0
                  ? `On purchases above ₹${coupon.min_order}`
                  : 'Valid on entire premium catalog'}
              </p>
            </div>
          </div>
        </div>

        {/* --- PERFORATED DIVIDER (Desktop) --- */}
        <div className="hidden md:flex flex-col justify-between items-center relative w-8">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-l-[3px] border-dashed border-slate-300 dark:border-slate-700/60" />
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -mt-3 shadow-inner z-10" />
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -mb-3 shadow-inner z-10" />
        </div>
        
        {/* --- PERFORATED DIVIDER (Mobile) --- */}
        <div className="flex md:hidden w-full items-center justify-between relative h-8">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0 border-t-[3px] border-dashed border-slate-300 dark:border-slate-700/60" />
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -ml-3 shadow-inner z-10" />
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 -mr-3 shadow-inner z-10" />
        </div>

        {/* --- RIGHT SIDE: ACTION TICKET --- */}
        <div className="w-full md:w-[320px] bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 sm:p-7 flex flex-col justify-center items-center gap-4 relative">
          
          <div className="w-full flex items-center justify-center gap-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm backdrop-blur-md">
            <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ends In:</span>
            <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm sm:text-base tracking-widest">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          <div className="w-full relative group/code cursor-pointer" onClick={handleCopyAndApply}>
            {/* Pulsing glow behind the button */}
            {!isApplied && (
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-30 group-hover/code:opacity-60 transition duration-500 animate-pulse" />
            )}
            
            <div className={`relative w-full border-2 border-dashed rounded-2xl p-2 sm:p-3 flex items-center justify-between transition-all duration-300 ${
              isApplied 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-white dark:bg-slate-900 border-emerald-500/40 dark:border-emerald-500/40 hover:border-emerald-500 text-slate-900 dark:text-white shadow-xl'
            }`}>
              <div className="pl-2 sm:pl-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${isApplied ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Coupon Code
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-wider">
                  {coupon.code}
                </span>
              </div>
              
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                isApplied ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 group-hover/code:bg-emerald-500 group-hover/code:text-white'
              }`}>
                {isApplied ? <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" /> : <Copy className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export const DynamicCouponOfferBanner: React.FC = () => {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 59, seconds: 59 });
  const [isHovered, setIsHovered] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const res = await apiClient.get('/coupons/public');
        const data = res.data;
        let list: PublicCoupon[] = [];
        if (Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        if (list.length > 0) {
          setCoupons(list);
        } else {
          setCoupons([
            { id: 1, code: 'NEWFARMER', type: 'FIXED', value: 150, min_order: 499, is_new_customer_only: true },
            { id: 2, code: 'WELCOME10', type: 'PERCENT', value: 10, min_order: 299 },
            { id: 3, code: 'MEGA250', type: 'FIXED', value: 250, min_order: 999 },
          ]);
        }
      } catch (e) {
        setCoupons([
          { id: 1, code: 'NEWFARMER', type: 'FIXED', value: 150, min_order: 499, is_new_customer_only: true },
          { id: 2, code: 'WELCOME10', type: 'PERCENT', value: 10, min_order: 299 },
          { id: 3, code: 'MEGA250', type: 'FIXED', value: 250, min_order: 999 },
        ]);
      }
    };
    fetchPublicCoupons();
  }, []);

  // Premium subtle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 59, seconds: 59 }; 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync scroll position to update active index natively
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth || 1;
    const index = Math.min(coupons.length - 1, Math.max(0, Math.round(scrollLeft / width)));
    setActiveIndex(index);
  };

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  // Auto-play that pauses on hover/touch
  useEffect(() => {
    if (coupons.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % coupons.length;
      scrollToSlide(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [coupons.length, isHovered, activeIndex]);

  if (coupons.length === 0) return null;

  return (
    <div className="relative w-full rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden my-6 pb-8 pt-2">
      
      {/* Background Mesh Gradients for Premium Look */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] bg-emerald-500/10 dark:bg-teal-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Header / Title */}
      <div className="relative z-10 px-6 sm:px-10 pt-6 pb-2 flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            Exclusive Farmer Deals <FlameIcon />
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Swipe to unlock seasonal discounts</p>
        </div>
        
        {/* Navigation Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rotate-180 text-slate-700 dark:text-slate-300" />
          </button>
          <button 
            onClick={() => scrollToSlide(Math.min(coupons.length - 1, activeIndex + 1))}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* NATIVE SCROLL SNAP TRACK */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="flex overflow-x-auto w-full snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing relative z-10 py-4 px-2 sm:px-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {coupons.map((current, idx) => (
          <div key={current.code} className="snap-center shrink-0 w-full flex items-center justify-center">
            <CouponTicket coupon={current} timeLeft={timeLeft} isActive={idx === activeIndex} />
          </div>
        ))}
      </div>

      {/* Interactive Dot Indicators */}
      {coupons.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          {coupons.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                activeIndex === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
              aria-label="Change offer slide"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Simple animated flame SVG icon component
const FlameIcon = () => (
  <svg className="w-6 h-6 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C12 2 8 6.588 8 11.176C8 13.91 9.878 16.326 12 17.5C12 17.5 10 15 10 13C10 13 16 17.5 16 21C16 21 21 16 21 11.176C21 6.588 12 2 12 2ZM11.111 22C10.667 21.75 9.778 21 9.778 19.5C9.778 18 10.667 17 11.556 16.25C12.444 15.5 14 14 14 14C14 14 14.889 15 14.889 16.5C14.889 18 13.111 20 11.111 22Z" />
  </svg>
);
