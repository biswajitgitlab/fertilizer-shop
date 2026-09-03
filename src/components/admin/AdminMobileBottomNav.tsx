import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Warehouse, Menu } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface AdminMobileBottomNavProps {
  onOpenMobileSidebar: () => void;
}

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({
  onOpenMobileSidebar
}) => {
  const { theme } = useUIStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t px-2 py-1.5 backdrop-blur-2xl transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] ${
      theme === 'dark'
        ? 'bg-slate-950/95 border-slate-800/90 text-slate-300'
        : 'bg-white/95 border-slate-200 text-slate-700'
    }`}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                active
                  ? 'text-emerald-500 font-extrabold bg-emerald-500/15 border border-emerald-500/30 shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="leading-tight">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-emerald-400'
              : 'text-slate-600 hover:text-emerald-600'
          }`}
          aria-label="Open Full Admin Drawer"
        >
          <div className="p-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Menu className="w-4 h-4" />
          </div>
          <span className="leading-tight">All Menu</span>
        </button>
      </div>
    </nav>
  );
};
