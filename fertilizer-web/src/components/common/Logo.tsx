import React from 'react';
import { useSiteSettingsStore } from '../../store/siteSettingsStore';

interface LogoProps {
  variant?: 'navbar' | 'sidebar' | 'hero' | 'icon' | 'footer';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  collapsed?: boolean;
  isAdmin?: boolean;
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'navbar',
  size,
  collapsed = false,
  isAdmin = false,
  className = '',
  showSubtitle = true,
}) => {
  const { appName, appTagline, logoUrl } = useSiteSettingsStore();

  // Size mapping for the logo mark container
  const getSizeClasses = () => {
    if (size) {
      switch (size) {
        case 'xs': return 'w-7 h-7 rounded-lg p-0.5';
        case 'sm': return 'w-9 h-9 rounded-xl p-0.5';
        case 'md': return 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-0.5';
        case 'lg': return 'w-14 h-14 rounded-2xl p-1';
        case 'xl': return 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1';
      }
    }
    
    switch (variant) {
      case 'navbar':
        return 'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl p-0.5';
      case 'sidebar':
        return collapsed ? 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-0.5' : 'w-12 h-12 sm:w-13 sm:h-13 rounded-xl p-0.5';
      case 'hero':
        return 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1';
      case 'footer':
        return 'w-10 h-10 rounded-xl p-0.5';
      case 'icon':
      default:
        return 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-0.5';
    }
  };

  const containerClasses = getSizeClasses();

  // Logo Icon Mark
  const logoMark = (
    <div className={`relative flex items-center justify-center shrink-0 bg-white/95 dark:bg-slate-900/95 border border-emerald-500/30 dark:border-emerald-500/40 shadow-md shadow-emerald-500/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 ${containerClasses} ${className}`}>
      <img
        src={logoUrl || '/logo.png'}
        alt={`${appName} Logo`}
        className="w-full h-full object-contain filter drop-shadow transition-all duration-300 group-hover:brightness-110"
      />
    </div>
  );

  if (variant === 'icon' || collapsed) {
    return logoMark;
  }

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 group select-none">
      {logoMark}

      <div className="leading-tight flex flex-col justify-center min-w-0">
        {/* Main Title Text */}
        {variant === 'sidebar' ? (
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
            <span className="text-slate-900 dark:text-white">{appName}</span>
          </h2>
        ) : variant === 'footer' || variant === 'hero' ? (
          <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-0.5 truncate">
            <span className="text-white">{appName}</span>
          </span>
        ) : (
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5 truncate">
            <span className="text-slate-900 dark:text-white">{appName}</span>
          </span>
        )}

        {/* Subtitle / Portal Tag */}
        {showSubtitle && (
          <>
            {variant === 'sidebar' ? (
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block truncate mt-0.5">
                Merchant Portal
              </span>
            ) : isAdmin ? (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate mt-0.5">
                Admin Portal
              </span>
            ) : variant === 'footer' ? (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide block truncate mt-0.5">
                {appTagline}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hidden sm:block truncate mt-0.5">
                {appTagline}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
