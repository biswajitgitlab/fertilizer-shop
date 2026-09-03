import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Stethoscope, Package, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isCartActive = isActive('/cart');
  const isOrdersActive = isActive('/orders') || location.pathname.startsWith('/orders/');
  const isProfileActive = isActive('/profile') || isActive('/login');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/96 dark:bg-slate-900/96 backdrop-blur-2xl border-t border-emerald-500/20 shadow-[0_-10px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_-10px_35px_rgba(0,0,0,0.85)] transition-all duration-300">
      <div className="flex items-center justify-between relative max-w-md mx-auto px-2 py-1.5">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all px-3 py-1.5 rounded-2xl ${
            isActive('/')
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="leading-none">Home</span>
        </Link>

        {/* 2. Orders (My Orders) */}
        <Link
          to={isAuthenticated ? "/orders" : "/products"}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all px-3 py-1.5 rounded-2xl ${
            isOrdersActive
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <Package className={`w-5 h-5 ${isOrdersActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="leading-none">{isAuthenticated ? 'Orders' : 'Store'}</span>
        </Link>

        {/* 3. Center Stacked Elevated Heal Crop Button */}
        <Link
          to="/diagnose"
          className="relative -mt-7 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-500 p-0.5 shadow-xl shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-900 group-active:scale-95 transition-transform flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 dark:bg-slate-900 backdrop-blur-md flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <Stethoscope className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 transition-colors animate-pulse" />
            </div>
          </div>
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider leading-none">
            Heal Crop
          </span>
        </Link>

        {/* 4. Cart — most important ecom CTA */}
        <Link
          to="/cart"
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold relative transition-all px-3 py-1.5 rounded-2xl ${
            isCartActive
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-black shadow-xs'
              : itemCount > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${isCartActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-black min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center shadow-md border border-white dark:border-slate-900">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <span className="leading-none">Cart</span>
        </Link>

        {/* 5. Profile / Account */}
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all px-3 py-1.5 rounded-2xl ${
            isProfileActive
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-black shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="leading-none">{isAuthenticated ? "Me" : "Login"}</span>
        </Link>

      </div>
    </nav>
  );
};
