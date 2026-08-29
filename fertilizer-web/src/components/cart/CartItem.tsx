import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../../hooks/useCart';

export const CartItem: React.FC<{ item: CartItemType }> = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xs text-gray-900 dark:text-white">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shrink-0">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {product.name}
          </h4>
          <button
            onClick={() => removeItem(product.id)}
            className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Remove Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-400 font-medium">Unit: {product.unit}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400">
            {formatCurrency(product.price * quantity)}
          </span>

          <QuantitySelector
            quantity={quantity}
            onDecrease={() => updateQty(product.id, quantity - 1)}
            onIncrease={() => updateQty(product.id, quantity + 1)}
            max={product.stock}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
