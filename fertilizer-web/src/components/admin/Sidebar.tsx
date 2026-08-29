import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Stethoscope,
  BarChart2, Warehouse, Tag, ArrowLeft, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
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
  ];

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6">
        {/* Admin Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-white p-1">
            <img src="/logo.png" alt="SarkarFertilizer Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base font-black text-white leading-tight">SarkarAdmin</h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Merchant Portal</span>
          </div>
        </div>

        {/* Admin User Info */}
        <div className="mx-2 bg-slate-900 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@sarkarfertilizer.com'}</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-1 pt-4 border-t border-slate-800">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Store</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-900/30 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
