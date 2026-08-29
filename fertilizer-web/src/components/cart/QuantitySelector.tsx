import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onDecrease,
  onIncrease,
  max = 99,
  size = 'md'
}) => {
  const btnClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const textClasses = size === 'sm' ? 'w-8 text-xs font-bold' : 'w-10 text-sm font-black';

  return (
    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1 shadow-2xs">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className={`${btnClasses} rounded-lg bg-white text-gray-700 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 transition-colors cursor-pointer shadow-xs`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className={`${textClasses} text-center text-gray-900`}>{quantity}</span>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${btnClasses} rounded-lg bg-white text-gray-700 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 transition-colors cursor-pointer shadow-xs`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
