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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-500/20 px-3 py-2 md:hidden shadow-2xl">
      <div className="flex items-center justify-around relative">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
            isActive('/') ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Home</span>
        </Link>

        {/* 2. My Crops / Planner */}
        <Link
          to="/planner"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
            isActive('/planner') ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className={`w-5 h-5 ${isActive('/planner') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>My Crops</span>
        </Link>

        {/* 3. Center Elevated Crop Doctor Button */}
        <Link
          to="/diagnose"
          className="relative -mt-6 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 p-0.5 shadow-xl shadow-emerald-500/40 group-active:scale-95 transition-transform border-4 border-slate-950 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Stethoscope className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 transition-colors animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-400 mt-1 uppercase tracking-wider">
            Heal Crop
          </span>
        </Link>

        {/* 4. Store */}
        <Link
          to="/products"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold relative transition-all ${
            isActive('/products') ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isActive('/products') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span>Store</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
            isActive('/profile') || isActive('/login') ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${isActive('/profile') || isActive('/login') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>{isAuthenticated ? "Profile" : "Account"}</span>
        </Link>

      </div>
    </nav>
  );
};
