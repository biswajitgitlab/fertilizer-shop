import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'sm',
  className = '',
}) => {
  // Auto-detect variant from status text if not specified
  const getAutoVariant = (str: string): BadgeVariant => {
    const s = str.toLowerCase();
    if (['paid', 'active', 'delivered', 'verified', 'completed', 'approved', 'success'].some((k) => s.includes(k))) {
      return 'success';
    }
    if (['pending', 'processing', 'warning', 'in_transit', 'low_stock'].some((k) => s.includes(k))) {
      return 'warning';
    }
    if (['failed', 'cancelled', 'rejected', 'expired', 'suspended', 'danger', 'error'].some((k) => s.includes(k))) {
      return 'danger';
    }
    if (['shipped', 'info', 'kcc'].some((k) => s.includes(k))) {
      return 'info';
    }
    return 'neutral';
  };

  const activeVariant = variant || getAutoVariant(status);

  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    info: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5 font-black uppercase tracking-wider',
    md: 'text-xs px-3 py-1 font-bold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border shadow-2xs ${variantStyles[activeVariant]} ${sizeStyles[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
