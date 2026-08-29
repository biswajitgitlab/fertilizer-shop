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
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-5 shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group">
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        {change && (
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-2">{subtitle}</p>}
    </div>
  );
};
