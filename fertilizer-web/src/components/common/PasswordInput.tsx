import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  icon = <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />,
  className = "",
  containerClassName = "relative",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={containerClassName}>
      {icon}
      <input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={className}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 p-1 rounded-lg transition-all duration-200 transform active:scale-90 hover:bg-emerald-500/10 focus:outline-none cursor-pointer group z-10"
        title={showPassword ? 'Hide password' : 'Show password'}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-300 transform group-hover:scale-110">
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-emerald-400 transition-all duration-300 rotate-0 scale-100" />
          ) : (
            <Eye className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-all duration-300 -rotate-12 scale-100" />
          )}
        </div>
      </button>
    </div>
  );
};
