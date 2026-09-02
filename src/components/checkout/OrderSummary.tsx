import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingBag, Tag, ShieldCheck, ChevronDown, ChevronUp, Check, X, Truck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderSummary: React.FC = () => {
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon.trim().toUpperCase());
    if (res.success) {
      toast.success(res.message);
      setInputCoupon('');
    } else {
      toast.error(res.message || 'Invalid coupon code');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Mobile Header Toggle (Shopify Style) */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full lg:hidden flex items-center justify-between p-4 bg-emerald-50/60 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-900 text-left cursor-pointer transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/60"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-black text-gray-900 dark:text-white">
            {isMobileOpen ? 'Hide' : 'Show'} Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
          </span>
          {isMobileOpen ? (
            <ChevronUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          )}
        </div>
        <span className="text-sm font-black text-emerald-900 dark:text-emerald-400">{formatCurrency(total)}</span>
      </button>

      {/* Content Container (Collapsible on Mobile, Always Block on Desktop) */}
      <div className={`p-6 space-y-5 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
        
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wide">Order Summary</h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">{items.length} {items.length === 1 ? 'product' : 'products'} in your cart</p>
            </div>
          </div>
          <span className="text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {items.reduce((acc, item) => acc + item.quantity, 0)} Total Qty
          </span>
        </div>

        {/* Cart Items Scrollable List with Shopify-style Badges & Truncation */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-100/80 dark:border-slate-800/80 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 rounded-xl px-1 transition-colors"
            >
              {/* Product Thumbnail with Qty Badge */}
              <div className="relative shrink-0">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-2xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=400';
                  }}
                />
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-700 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {item.quantity}
                </span>
              </div>

              {/* Product Details (min-w-0 prevents text overflow/overlapping) */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate" title={item.product.name}>
                  {item.product.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate">
                  {formatCurrency(item.product.price)} × {item.quantity}
                </p>
              </div>

              {/* Item Total Price */}
              <div className="text-right shrink-0">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Promo / Coupon Code Input Box */}
        <div className="bg-gray-50/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 space-y-2">
          {couponCode ? (
            <div className="flex items-center justify-between bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs px-3 py-2 rounded-xl font-semibold">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Coupon <strong className="font-black uppercase">{couponCode}</strong> applied</span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-emerald-800 dark:text-emerald-300 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                title="Remove coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. KRISHI10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full text-xs font-medium pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none uppercase placeholder:normal-case placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-gray-600 dark:text-slate-400 font-medium">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Discount Savings
              </span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" /> Delivery Fee
            </span>
            <span>
              {shippingFee === 0 ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-black bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  FREE
                </span>
              ) : (
                formatCurrency(shippingFee)
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-gray-500 dark:text-slate-500">
            <span>GST Tax (18%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          {/* Grand Total */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-3 flex justify-between items-center text-base">
            <div className="space-y-0.5">
              <span className="font-black text-gray-900 dark:text-white block">Total Amount</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">Inclusive of all taxes & delivery</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-800 dark:text-emerald-400 block">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* E-commerce Security & Guarantee Badges */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-4 grid grid-cols-2 gap-2 text-[10px] text-gray-500 dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% Original Products</span>
          </div>
        </div>

      </div>
    </div>
  );
};

