import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, Check, Zap, Gift, Flame, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
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

// Authentic High-Energy E-Commerce Animated GIFs
const GIF_GIFT_BOX = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR1aGVqYnkya2k5bW9kZ3Z1OHBmbWRzZDFtcTNxdnBsNjdrcGRsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/u0oG8b3xZ768w/giphy.gif";
const GIF_HOT_FLAME = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Yyb3JvaHZvZjBoc3N1eW13Y3N0bzU3MW5sOG5ucDNzMHB2M3FnaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKrEzvLbsVAud8I/giphy.gif";
const GIF_DISCOUNT_BADGE = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanBxdHJsM242aXBzazVmdmxvb2Jmb2kzbWpjdDF6bHkzbmtwbDVnMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/26tknCqiYwe7XMJwI/giphy.gif";
const GIF_SPARKLES_CELEBRATION = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWp3d2JvYWFqdXFwOWk4NmRzeHRoYjYxOHQwdzB1dzg5cWZqcmNqMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/4NnTap3gKZC92/giphy.gif";

export const DynamicCouponOfferBanner: React.FC = () => {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [claimCount, setClaimCount] = useState<number>(1420);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; ms: number }>({ minutes: 14, seconds: 59, ms: 90 });
  
  const { applyCoupon, couponCode: activeCartCoupon } = useCart();

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
            { id: 3, code: 'KRISHISAVE', type: 'FIXED', value: 250, min_order: 999 }
          ]);
        }
      } catch (e) {
        setCoupons([
          { id: 1, code: 'NEWFARMER', type: 'FIXED', value: 150, min_order: 499, is_new_customer_only: true },
          { id: 2, code: 'WELCOME10', type: 'PERCENT', value: 10, min_order: 299 },
          { id: 3, code: 'KRISHISAVE', type: 'FIXED', value: 250, min_order: 999 }
        ]);
      }
    };

    fetchPublicCoupons();
  }, []);

  // Live E-commerce Countdown Timer (Urgency Trigger)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.ms > 0) return { ...prev, ms: prev.ms - 10 };
        if (prev.seconds > 0) return { minutes: prev.minutes, seconds: prev.seconds - 1, ms: 90 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59, ms: 90 };
        return { minutes: 14, seconds: 59, ms: 90 }; // Reset loop for continuous urgency
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate offers every 6s
  useEffect(() => {
    if (coupons.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % coupons.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [coupons.length]);

  // Social Proof Claims Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setClaimCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (coupons.length === 0) return null;

  const current = coupons[activeIndex] || coupons[0];

  const handleCopyAndApply = async (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setShowConfetti(true);
    setTimeout(() => setCopiedCode(null), 3000);
    setTimeout(() => setShowConfetti(false), 3000);

    const res = await applyCoupon(code);
    if (res.success) {
      toast.success(`🎉 Code "${code}" applied to your cart!`);
    } else {
      toast.success(`📋 Code "${code}" copied to clipboard!`);
    }
  };

  const getDiscountDisplay = (c: PublicCoupon) => {
    const isPercent = String(c.type).toUpperCase() === 'PERCENT';
    return isPercent ? `${c.value}% OFF` : `FLAT ₹${c.value} OFF`;
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl p-4 sm:p-6 text-white my-4 transition-all">
      
      {/* Background Animated Glows & Shimmer */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Confetti Explosion Particles */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 1.5 + 0.5,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`absolute w-3 h-3 rounded-md ${
                  ['bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400', 'bg-yellow-300'][i % 5]
                }`}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dashed E-commerce Ticket Stub Edge Notches */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-8 bg-emerald-50 dark:bg-emerald-950 rounded-r-full border-r-2 border-y-2 border-amber-500/40 hidden sm:block" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-8 bg-emerald-50 dark:bg-emerald-950 rounded-l-full border-l-2 border-y-2 border-amber-500/40 hidden sm:block" />

      {/* Main Banner Content Grid */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
        
        {/* Left Column: Animated GIF Icon & Offer Heading */}
        <div className="flex items-center gap-4 text-left w-full lg:w-auto">
          
          {/* Animated GIF Badge Container */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-300 p-1 shadow-xl shadow-amber-500/20 relative overflow-hidden flex items-center justify-center">
              <img
                src={GIF_GIFT_BOX}
                alt="Offer Gift Animation"
                className="w-full h-full object-cover rounded-xl bg-slate-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = GIF_SPARKLES_CELEBRATION;
                }}
              />
            </div>
            {/* Animated Flame Badge Overlay */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center p-0.5 shadow-md">
              <img src={GIF_HOT_FLAME} alt="Hot Flame" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Offer Titles & Rules */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-slate-950" /> FESTIVE MEGA OFFER
              </span>
              
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-white/20 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span>{claimCount.toLocaleString()} Claims Today</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-white">
                    {getDiscountDisplay(current)}
                  </h3>
                  {current.is_new_customer_only && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      1st Order Exclusive
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200/90 font-medium">
                  {Number(current.min_order) > 0
                    ? `Applicable on order subtotals of ₹${current.min_order} or more`
                    : 'Valid on all order values • Direct Farm Delivery'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Countdown Clock & Copy Ticket Stub */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
          
          {/* Live Countdown Urgency Timer */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-3 py-2 text-xs font-bold text-slate-300 shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="text-left font-mono">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 block leading-none">ENDS IN</span>
              <span className="text-amber-300 font-extrabold text-xs">
                {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s : {String(timeLeft.ms).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* E-Commerce Copy Ticket Stub Box */}
          <div className="flex items-center bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-dashed border-amber-400/80 rounded-2xl p-1.5 pl-3 space-x-3 shadow-xl">
            <div className="text-left font-mono">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block leading-none">COUPON CODE</span>
              <span className="text-base sm:text-lg font-black text-amber-400 tracking-wider uppercase">{current.code}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopyAndApply(current.code)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
                activeCartCoupon === current.code || copiedCode === current.code
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold'
              }`}
            >
              {activeCartCoupon === current.code || copiedCode === current.code ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" /> Applied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy &amp; Apply
                </>
              )}
            </motion.button>
          </div>

        </div>

      </div>

      {/* Slide Navigation Dots */}
      {coupons.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-3">
          {coupons.map((c, idx) => (
            <button
              key={c.code}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Show offer ${c.code}`}
            />
          ))}
        </div>
      )}

    </div>
  );
};
