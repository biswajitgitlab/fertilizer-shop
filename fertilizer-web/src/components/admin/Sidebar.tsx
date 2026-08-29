import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Stethoscope,
  BarChart2, Warehouse, Tag, ArrowLeft, LogOut, ShieldCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC<{
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}> = ({ onCloseMobile, collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Crop Diagnoses', path: '/admin/diagnoses', icon: Stethoscope },
    { name: 'Sales Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Role & Permissions', path: '/admin/roles', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  return (
    <div className={`w-full bg-slate-950/90 text-slate-300 h-full flex flex-col justify-between p-3 overflow-x-hidden transition-all duration-300 ${collapsed ? 'items-center' : ''}`}>
      <div className="space-y-5 w-full">
        {/* Admin Brand Logo & Collapse Toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1 py-2 border-b border-slate-800/60 pb-3`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black bg-white p-1 shrink-0 shadow-md shadow-emerald-950/40">
              <img src="/logo.png" alt="SarkarFertilizer Logo" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white leading-tight truncate">SarkarAdmin</h2>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block truncate">Merchant Portal</span>
              </div>
            )}
          </div>
          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onToggleCollapse && collapsed && (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Admin User Info */}
        {!collapsed ? (
          <div className="bg-slate-900/80 rounded-xl p-2.5 flex items-center gap-2.5 border border-slate-800/60">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@sarkarfertilizer.com'}</p>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs mx-auto" title={user?.name || 'Admin'}>
            {user?.name?.[0] || 'A'}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 w-full">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                title={collapsed ? link.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    collapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{link.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1 pt-3 border-t border-slate-800/80 w-full">
        {/* Theme Switch Button */}
        <button
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-900/80 rounded-xl transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 text-slate-300" />}
          {!collapsed && <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <NavLink
          to="/"
          title={collapsed ? "Exit to Customer Store" : undefined}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-xl transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Exit to Store</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          title={collapsed ? "Log Out" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-900/30 rounded-xl transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Log Out</span>}
        </button>
      </div>
    </div>
  );
};
