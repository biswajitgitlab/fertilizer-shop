import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    toggleDrawer,
    setDrawerOpen,
    couponCode,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    freeShippingThreshold
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

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

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickApplyToken = (code: string) => {
    const res = applyCoupon(code);
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={toggleDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-100">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold">Shopping Cart</h2>
              <span className="bg-emerald-800 text-emerald-200 text-xs font-black px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={toggleDrawer}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FREE SHIPPING PROGRESS BANNER */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 space-y-2 border-b border-emerald-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
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
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-200 shrink-0">
                  {freeDeliveryProgress}%
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore certified fertilizers, insecticides, herbicides, and crop vitamins for your farm.
                </p>
                <Button size="sm" onClick={toggleDrawer}>
                  Shop Fertilizers
                </Button>
              </div>
            ) : (
              items.map((item) => <CartItem key={item.product.id} item={item} />)
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 space-y-4">
              
              {/* Coupon Form & Available Offers */}
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Token '{couponCode}' Applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-600 hover:underline cursor-pointer">
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
                      className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 uppercase focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      Apply
                    </Button>
                  </form>

                  {/* Quick-Apply Tokens */}
                  <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-gray-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Available Discount Tokens
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-0.5">
                      {[
                        { code: 'NEWFARMER', text: 'Flat ₹150 OFF (1st Order Only)' },
                        { code: 'WELCOME10', text: '10% OFF (≥ ₹299)' },
                        { code: 'KRISHISAVE', text: 'Flat ₹250 OFF (≥ ₹999)' }
                      ].map((t) => (
                        <div key={t.code} className="flex items-center justify-between text-[11px] bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100">
                          <div>
                            <span className="font-mono font-bold text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200 mr-1.5">
                              {t.code}
                            </span>
                            <span className="text-gray-600 font-medium text-[10px]">{t.text}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickApplyToken(t.code)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST Tax (18%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-emerald-800">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button onClick={handleCheckoutClick} className="w-full text-base py-3" icon={<ArrowRight className="w-5 h-5" />}>
                Proceed to Checkout ({formatCurrency(total)})
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Checkout & Farm Guarantee</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
