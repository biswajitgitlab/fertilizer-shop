import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Stethoscope, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAdmin) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-emerald-500/20 px-2 py-2 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] transition-all duration-300">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all px-2.5 py-1 rounded-2xl ${
            isActive('/')
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Home</span>
        </Link>

        {/* 2. My Crops / Planner */}
        <Link
          to="/planner"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all px-2.5 py-1 rounded-2xl ${
            isActive('/planner')
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive('/planner') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>My Crops</span>
        </Link>

        {/* 3. Center Elevated Crop Doctor Glass Button */}
        <Link
          to="/diagnose"
          className="relative -mt-6 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-500 p-0.5 shadow-xl shadow-emerald-500/40 ring-4 ring-white/90 dark:ring-slate-900/90 group-active:scale-95 transition-transform flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <Stethoscope className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 transition-colors animate-pulse" />
            </div>
          </div>
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
            Heal Crop
          </span>
        </Link>

        {/* 4. Store */}
        <Link
          to="/products"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative transition-all px-2.5 py-1 rounded-2xl ${
            isActive('/products')
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive('/products') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </div>
          <span>Store</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all px-2.5 py-1 rounded-2xl ${
            isActive('/profile') || isActive('/login')
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive('/profile') || isActive('/login') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>{isAuthenticated ? "Profile" : "Account"}</span>
        </Link>

      </div>
    </nav>
  );
};
