import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Tag, ChevronDown, AlertTriangle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';
import {
  AnimatedCart,
  AnimatedTruck,
  AnimatedSparkles,
  AnimatedShield
} from '../common/AnimatedIcons';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    toggleDrawer,
    setDrawerOpen,
    couponCode,
    applyCoupon,
    removeCoupon,
    removeItem,
    hasOutOfStockItems,
    getOutOfStockItems,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    freeShippingThreshold
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [showAvailableTokens, setShowAvailableTokens] = useState(false);

  const amountForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Lock background scroll when Cart Drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickApplyToken = async (code: string) => {
    const res = await applyCoupon(code);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleCheckoutClick = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  const availableTokens = [
    { code: 'NEWFARMER', text: 'Flat ₹150 OFF (1st Order)' },
    { code: 'WELCOME10', text: '10% OFF (≥ ₹299)' },
    { code: 'KRISHISAVE', text: 'Flat ₹250 OFF (≥ ₹999)' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-hidden">
          {/* Backdrop (z-[200] covers header, chat, and mobile bottom nav) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={toggleDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="w-screen max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl flex flex-col justify-between border-l border-emerald-500/20 text-gray-900 dark:text-white relative"
            >
              
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-emerald-500/20 flex items-center justify-between bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900/90 backdrop-blur-xl text-white shrink-0">
                <div className="flex items-center gap-2">
                  <AnimatedCart size={22} className="text-emerald-400" active />
                  <h2 className="text-base font-bold">Shopping Cart</h2>
                  <span className="bg-emerald-800 text-emerald-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
                <button
                  onClick={toggleDrawer}
                  className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FREE SHIPPING PROGRESS BANNER */}
              {items.length > 0 && (
                <div className="shrink-0 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-3.5 space-y-2 border-b border-emerald-800/80">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <AnimatedTruck size={18} className="text-emerald-400 shrink-0" />
                      <span className="text-[11px] sm:text-xs">
                        {amountForFreeDelivery > 0 ? (
                          <>Add <strong className="text-emerald-300 font-extrabold">{formatCurrency(amountForFreeDelivery)}</strong> more for <span className="text-emerald-300 underline">FREE Delivery</span></>
                        ) : (
                          <span className="text-emerald-300 font-extrabold">
                            🎉 Unlocked FREE Delivery!
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-200 shrink-0 font-bold">
                      {freeDeliveryProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeDeliveryProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* SCROLLABLE MAIN CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <AnimatedCart size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">Your cart is empty</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
                      Explore certified fertilizers, insecticides, herbicides, and crop vitamins for your farm.
                    </p>
                    <Button size="sm" onClick={toggleDrawer}>
                      Shop Fertilizers
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* OUT OF STOCK ALERT BANNER */}
                    {hasOutOfStockItems && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-2 text-rose-900 dark:text-rose-200 shadow-xs">
                        <div className="flex items-start gap-2 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <span>Action Required: Some items in your cart are out of stock or exceed available quantity.</span>
                        </div>
                        <button
                          onClick={() => {
                            getOutOfStockItems().forEach((item) => removeItem(item.product.id));
                            toast.success("Removed unavailable items from cart");
                          }}
                          className="w-full text-[11px] font-black text-white bg-rose-600 hover:bg-rose-700 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          Remove Out of Stock Items
                        </button>
                      </div>
                    )}

                    {/* Cart Items List */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <CartItem key={item.product.id} item={item} />
                      ))}
                    </div>

                    {/* DISCOUNT TOKEN / COUPON CARD (Inside scrollable body to prevent layout overflow) */}
                    <div className="pt-2">
                      <div className="bg-emerald-50/60 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-emerald-200/70 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-slate-200">
                              Discount Token / Coupon
                            </span>
                          </div>
                          {couponCode && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                              Token Active
                            </span>
                          )}
                        </div>

                        {couponCode ? (
                          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                            <div className="flex items-center gap-2 truncate">
                              <AnimatedSparkles size={16} className="text-amber-500 shrink-0" />
                              <span className="truncate">
                                Token <strong className="font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded mr-1">{couponCode}</strong> Applied
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={removeCoupon}
                              className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-bold text-xs shrink-0 ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter Token (e.g. NEWFARMER)"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                className="flex-1 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 uppercase focus:outline-none focus:border-emerald-500 font-mono font-bold text-gray-900 dark:text-white"
                              />
                              <Button type="submit" size="sm" variant="secondary">
                                Apply
                              </Button>
                            </form>

                            {/* Accordion Toggle for Available Discount Tokens */}
                            <div className="border-t border-emerald-200/60 dark:border-slate-700/60 pt-2">
                              <button
                                type="button"
                                onClick={() => setShowAvailableTokens(!showAvailableTokens)}
                                className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 cursor-pointer py-0.5"
                              >
                                <span className="flex items-center gap-1.5">
                                  <AnimatedSparkles size={14} className="text-amber-500" />
                                  <span>View Available Tokens ({availableTokens.length})</span>
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAvailableTokens ? 'rotate-180' : ''}`} />
                              </button>

                              {showAvailableTokens && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-1.5 pt-2"
                                >
                                  {availableTokens.map((t) => (
                                    <div
                                      key={t.code}
                                      className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs"
                                    >
                                      <div className="truncate mr-2">
                                        <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 mr-1.5 text-[10px]">
                                          {t.code}
                                        </span>
                                        <span className="text-gray-600 dark:text-slate-300 font-medium text-[10px]">{t.text}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickApplyToken(t.code)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* STICKY FOOTER (Clean & Non-Overlapping Mobile Purchase UI) */}
              {items.length > 0 && (
                <div className="shrink-0 p-4 sm:p-5 pb-8 sm:pb-5 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 space-y-3 relative z-20 pointer-events-auto shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                  
                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-400 font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>Discount Token ({couponCode})</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span>{shippingFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-slate-500 text-[11px]">
                      <span>GST Tax (18%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-slate-800 flex justify-between text-base font-black text-gray-900 dark:text-white">
                      <span>Grand Total</span>
                      <span className="text-emerald-800 dark:text-emerald-400">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Primary Checkout CTA */}
                  <Button
                    onClick={handleCheckoutClick}
                    disabled={hasOutOfStockItems}
                    className="w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    {hasOutOfStockItems ? "Remove Out of Stock Items to Checkout" : `Proceed to Checkout (${formatCurrency(total)})`}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                    <AnimatedShield size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>100% Secure Checkout &amp; Farm Guarantee</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

