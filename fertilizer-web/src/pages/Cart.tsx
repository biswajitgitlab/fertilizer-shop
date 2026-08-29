import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { ShoppingBag, Tag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (applyCoupon(couponInput)) {
      toast.success("Coupon code applied!");
      setCouponInput('');
    } else {
      toast.error("Invalid coupon code.");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Your Shopping Cart ({items.length} Products)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items Column */}
        <div className="lg:col-span-8 space-y-3">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        {/* Order Summary Side Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Cart Summary
          </h3>

          {/* Coupon form */}
          {couponCode ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Coupon '{couponCode}' Applied</span>
              </div>
              <button onClick={removeCoupon} className="text-rose-600 hover:underline cursor-pointer">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon (e.g. KRISHI10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 uppercase focus:outline-none focus:border-emerald-500"
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
            </form>
          )}

          {/* Calculations */}
          <div className="space-y-2 text-xs text-gray-600 font-medium pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
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

            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-emerald-800">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/checkout')} className="w-full text-base py-3.5" icon={<ArrowRight className="w-5 h-5" />}>
            Proceed to Checkout ({formatCurrency(total)})
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed 100% Genuine Lab Tested Products</span>
          </div>
        </div>

      </div>
    </div>
  );
};
