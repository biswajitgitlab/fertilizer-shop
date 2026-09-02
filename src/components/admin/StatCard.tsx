import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle
}) => {
  return (
    <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 group">
      {/* Ambient hover top bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {change && (
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2">{subtitle}</p>}
    </div>
  );
};
