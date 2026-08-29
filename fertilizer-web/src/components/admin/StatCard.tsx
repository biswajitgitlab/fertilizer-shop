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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {change && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>}
    </div>
  );
};
