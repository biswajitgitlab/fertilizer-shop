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
    <div className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs items-center">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
        <p className="text-[11px] text-gray-400 font-medium">Unit: {product.unit}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-black text-emerald-800">
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

      <button
        onClick={() => removeItem(product.id)}
        className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        title="Remove Item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
