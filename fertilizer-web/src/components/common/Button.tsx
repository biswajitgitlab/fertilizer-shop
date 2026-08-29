import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:ring-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none',
    secondary: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500',
    outline: 'border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:ring-emerald-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
    ghost: 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus:ring-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[50px]'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
