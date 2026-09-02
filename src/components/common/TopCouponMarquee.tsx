import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight, Zap, Copy, Check } from 'lucide-react';
import { apiClient } from '../../api/axiosInstances';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

export const TopCouponMarquee: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const { applyCoupon, couponCode: activeCartCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await apiClient.get('/coupons/public');
        const data = res.data;
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          setCoupons(list);
        } else {
          setCoupons([
            { code: 'NEWFARMER', value: 150, type: 'FIXED', min_order: 499 },
            { code: 'WELCOME10', value: 10, type: 'PERCENT', min_order: 299 },
            { code: 'KRISHISAVE', value: 250, type: 'FIXED', min_order: 999 }
          ]);
        }
      } catch (e) {
        setCoupons([
          { code: 'NEWFARMER', value: 150, type: 'FIXED', min_order: 499 },
          { code: 'WELCOME10', value: 10, type: 'PERCENT', min_order: 299 }
        ]);
      }
    };
    fetchCoupons();
  }, []);

  if (coupons.length === 0) return null;

  const handleCopyApply = async (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);

    const res = await applyCoupon(code);
    if (res.success) {
      toast.success(`🎉 Token "${code}" applied to your cart!`);
    } else {
      toast.success(`📋 Token "${code}" copied!`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white text-[11px] font-bold py-1.5 px-4 border-b border-emerald-500/20 shadow-md relative z-[100] overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Ticker Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-slate-950" /> FLASH OFFERS
          </span>
        </div>

        {/* Marquee Ticker Display */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-center gap-6 animate-marquee whitespace-nowrap">
            {coupons.map((c, i) => {
              const isPercent = String(c.type).toUpperCase() === 'PERCENT';
              const text = isPercent ? `${c.value}% OFF` : `₹${c.value} OFF`;
              return (
                <div key={i} className="inline-flex items-center gap-2">
                  <span className="text-emerald-300 font-extrabold">{text}</span>
                  <span className="text-slate-400">on orders ≥ ₹{c.min_order}</span>
                  <button
                    onClick={() => handleCopyApply(c.code)}
                    className="font-mono bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-0.5 rounded-md text-amber-300 hover:text-amber-200 transition cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {activeCartCoupon === c.code || copiedCode === c.code ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" /> APPLIED
                      </>
                    ) : (
                      <>
                        <span>USE CODE <strong>{c.code}</strong></span>
                        <Copy className="w-2.5 h-2.5 text-slate-300" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10px] font-bold shrink-0">
          <span>100% Guaranteed Genuine Products</span>
        </div>

      </div>
    </div>
  );
};
