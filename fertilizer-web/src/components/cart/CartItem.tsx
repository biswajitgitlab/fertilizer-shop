import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../../hooks/useCart';

export const CartItem: React.FC<{ item: CartItemType }> = ({ item }) => {
  const { updateQty, removeItem } = useCart();
  const { product, quantity } = item;

  const isOutOfStock = product.stock <= 0;
  const exceedsStock = quantity > product.stock && !isOutOfStock;

  return (
    <div className={`flex items-start gap-3 p-3 bg-white dark:bg-slate-800/90 rounded-2xl border transition-all ${
      isOutOfStock
        ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/20'
        : exceedsStock
        ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/40 dark:bg-amber-950/20'
        : 'border-gray-100 dark:border-slate-700'
    } shadow-2xs text-gray-900 dark:text-white`}>
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shrink-0 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
            <span className="text-[9px] font-black text-rose-200 uppercase tracking-tighter text-center leading-tight">OUT OF STOCK</span>
          </div>
        )}
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

        {/* STOCK STATUS WARNING BADGES */}
        {isOutOfStock ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Out of Stock — Please remove from cart</span>
          </div>
        ) : exceedsStock ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Only {product.stock} unit(s) available in stock</span>
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 dark:text-slate-400 font-medium">Unit: {product.unit}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className={`text-xs sm:text-sm font-black ${isOutOfStock ? 'line-through text-gray-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
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
