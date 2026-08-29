import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingBag, Tag, ShieldCheck } from 'lucide-react';

export const OrderSummary: React.FC = () => {
  const { items, subtotal, discount, shippingFee, tax, total, couponCode } = useCart();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <ShoppingBag className="w-5 h-5 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-900">Order Summary ({items.length} Products)</h3>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 max-w-[70%]">
              <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover bg-gray-50 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 truncate">{item.product.name}</p>
                <p className="text-[10px] text-gray-500">Qty: {item.quantity} x {formatCurrency(item.product.price)}</p>
              </div>
            </div>
            <span className="font-black text-gray-900">{formatCurrency(item.product.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Calculation breakdown */}
      <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600 font-medium">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-bold">
            <span>Discount ({couponCode})</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>GST Tax (18%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-black text-gray-900">
          <span>Payable Amount</span>
          <span className="text-emerald-800">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
