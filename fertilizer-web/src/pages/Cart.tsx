import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { ShoppingBag, Tag, ArrowRight, ShieldCheck, ArrowLeft, Truck, Sparkles, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { RecentlyViewedSection } from '../components/product/RecentlyViewedSection';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    removeItem,
    hasOutOfStockItems,
    getOutOfStockItems,
    freeShippingThreshold
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const amountForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApply = async (e: React.FormEvent) => {
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

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Your Cart is Empty</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Look through our government certified chemical & organic fertilizers, insecticides, weed killers, and crop growth tonics.
        </p>
        <Link to="/products">
          <Button icon={<ArrowLeft className="w-4 h-4" />}>
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-32 md:pb-10 space-y-4 sm:space-y-6 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your Shopping Cart ({items.length} Products)</h1>

      {/* FREE SHIPPING PROGRESS BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>
              {amountForFreeDelivery > 0 ? (
                <>Shop <strong className="text-emerald-300 font-extrabold">{formatCurrency(amountForFreeDelivery)}</strong> more for <span className="text-emerald-300 underline">FREE Delivery</span></>
              ) : (
                <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                  🎉 Congratulations! You've Unlocked FREE Delivery!
                </span>
              )}
            </span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-lg text-emerald-200">
            {freeDeliveryProgress}% Goal
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
        
        {/* Cart Items Column */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {/* OUT OF STOCK WARNING BANNER */}
          {hasOutOfStockItems && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-3xl space-y-3 text-rose-900 dark:text-rose-200 shadow-sm">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-rose-950 dark:text-rose-100">Inventory Alert — Unavailable Items in Cart</h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                    Some items in your cart are currently out of stock or exceed available quantity. Please remove or adjust unavailable items to proceed with checkout.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  getOutOfStockItems().forEach((item) => removeItem(item.product.id));
                  toast.success("Removed unavailable items from cart");
                }}
                className="text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Remove Out of Stock Items Now
              </button>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          {/* TOKEN / COUPON OFFERS FOR NEW & EXISTING CUSTOMERS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white">Available Discount Tokens &amp; Offers</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  code: 'NEWFARMER',
                  title: 'New Customer Offer',
                  discountText: 'Flat ₹150 OFF',
                  minOrderText: '1st Order Only (min ₹499)',
                  color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200',
                  badge: 'NEW USER'
                },
                {
                  code: 'WELCOME10',
                  title: 'Welcome Discount',
                  discountText: '10% OFF',
                  minOrderText: 'On orders >= ₹299',
                  color: 'border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200',
                  badge: 'POPULAR'
                },
                {
                  code: 'KRISHISAVE',
                  title: 'Farmer Mega Savings',
                  discountText: 'Flat ₹250 OFF',
                  minOrderText: 'On orders >= ₹999',
                  color: 'border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200',
                  badge: 'BEST VALUE'
                }
              ].map((token) => (
                <div
                  key={token.code}
                  className={`p-4 rounded-2xl border ${token.color} space-y-2 relative flex flex-col justify-between`}
                >
                  <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200">
                    {token.badge}
                  </span>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">{token.title}</span>
                    <h4 className="text-base font-black">{token.discountText}</h4>
                    <p className="text-[11px] text-gray-600 dark:text-slate-300 font-medium">{token.minOrderText}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white">
                      {token.code}
                    </span>
                    <button
                      onClick={() => handleQuickApplyToken(token.code)}
                      disabled={couponCode === token.code}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        couponCode === token.code
                          ? 'bg-emerald-600 text-white cursor-default flex items-center gap-1'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      {couponCode === token.code ? (
                        <>
                          <Check className="w-3 h-3" /> Applied
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Side Card — desktop only; mobile uses sticky footer bar */}
        <div className="hidden lg:block lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
            Cart Summary
          </h3>

          {/* Coupon form */}
          {couponCode ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Token '{couponCode}' Applied</span>
              </div>
              <button onClick={removeCoupon} className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                placeholder="Token Code (e.g. NEWFARMER)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 uppercase focus:outline-none focus:border-emerald-500 font-mono font-bold text-gray-900 dark:text-white"
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
            </form>
          )}

          {/* Calculations */}
          <div className="space-y-2 text-xs text-gray-600 dark:text-slate-400 font-medium pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Discount Token</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>{shippingFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-slate-500">
              <span>GST Tax (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 pt-3 flex justify-between text-lg font-black text-gray-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-emerald-800 dark:text-emerald-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            disabled={hasOutOfStockItems}
            className="w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            {hasOutOfStockItems ? "Remove Out of Stock Items to Checkout" : `Proceed to Checkout (${formatCurrency(total)})`}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Guaranteed 100% Genuine Lab Tested Products</span>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY CHECKOUT BAR — shown below cart items on mobile only */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 px-3 py-2 bg-white/96 dark:bg-slate-900/96 backdrop-blur-2xl border-t border-emerald-200/60 dark:border-slate-700/60 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          {/* Price summary pill */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-400">{formatCurrency(total)}</span>
              {discount > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                  -{formatCurrency(discount)} saved
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium truncate">
              {shippingFee === 0 ? '🎉 Free Delivery Unlocked' : `+${formatCurrency(shippingFee)} delivery`} • GST incl.
            </p>
          </div>
          {/* Checkout CTA */}
          <Button
            onClick={() => navigate('/checkout')}
            disabled={hasOutOfStockItems}
            className="shrink-0 px-5 py-3 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation active:scale-[0.97] transition-transform"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {hasOutOfStockItems ? 'Fix Cart' : 'Checkout'}
          </Button>
        </div>
      </div>

      {/* RECENTLY VIEWED PRODUCTS FOR EASY ADD-BACK */}
      <RecentlyViewedSection />
    </div>
  );
};
