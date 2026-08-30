import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

export const FloatingCartBanner: React.FC = () => {
  const { itemCount, total, subtotal, freeShippingThreshold, setDrawerOpen, isOpen } = useCart();

  const amountForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);

  // Hide when cart is empty or when the main CartDrawer is already open
  if (itemCount === 0 || isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-[64px] left-2.5 right-2.5 z-[95] md:hidden"
      >
        <div className="bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-3 shadow-[0_12px_35px_rgba(0,0,0,0.6)] text-white flex items-center justify-between gap-3 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Left Info Section */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/30 text-slate-950 font-black">
                <ShoppingBag className="w-5 h-5 text-slate-950" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-slate-950">
                {itemCount}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-sm font-black text-white">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-200/90 font-medium truncate mt-0.5">
                <Truck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {amountForFreeDelivery > 0 ? (
                    <>Add <strong className="text-emerald-300">{formatCurrency(amountForFreeDelivery)}</strong> for FREE Delivery</>
                  ) : (
                    <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      Unlocked FREE Delivery!
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
