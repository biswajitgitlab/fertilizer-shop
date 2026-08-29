import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  compact?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, count, size = 'sm', compact = false }) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-200/60 dark:border-amber-800/50 shrink-0">
        <Star className={`${iconSize} fill-amber-400 text-amber-400 shrink-0`} />
        <span>{rating}</span>
        {count !== undefined && (
          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">({count})</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 ml-0.5">{rating}</span>
      {count !== undefined && (
        <span className="text-[11px] text-gray-500 dark:text-slate-400">({count})</span>
      )}
    </div>
  );
};
