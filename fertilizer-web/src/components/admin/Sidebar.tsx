import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Stethoscope,
  BarChart2, Warehouse, Tag, ArrowLeft, LogOut, ShieldCheck,
  Sun, Moon, UserCheck, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Logo } from '../common/Logo';

import { adminAuthApi } from '../../api/adminApi';

export const Sidebar: React.FC<{
  onCloseMobile?: () => void;
  collapsed?: boolean;
}> = ({ onCloseMobile, collapsed }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  const isCollapsed = collapsed !== undefined ? collapsed : sidebarCollapsed;

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Staff Management', path: '/admin/users', icon: UserCheck },
    { name: 'Customer CRM', path: '/admin/customers', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Crop Diagnoses', path: '/admin/diagnoses', icon: Stethoscope },
    { name: 'Sales Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Role & Permissions', path: '/admin/roles', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {
      // ignore
    }
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className={`w-full h-full flex flex-col justify-between p-3 overflow-x-hidden transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-950/90 text-slate-300' : 'bg-white text-slate-700'
    } ${isCollapsed ? 'items-center' : ''}`}>
      <div className="space-y-4 w-full">
        {/* Admin Brand Logo Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'justify-between px-2 py-3'} border-b ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <Logo variant="sidebar" collapsed={isCollapsed} />
          {!onCloseMobile && (
            <button
              onClick={toggleSidebarCollapsed}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className={`p-1.5 rounded-xl transition-all border cursor-pointer hidden lg:flex items-center justify-center ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border-slate-800/80'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-500" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Admin User Profile Card */}
        {!isCollapsed ? (
          <div className={`rounded-xl p-2.5 flex items-center gap-2.5 border transition-colors ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-500 text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {user?.name || 'Administrator'}
              </p>
              <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {user?.email || 'admin@fertilizershop.com'}
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-500 text-xs mx-auto shadow-xs"
            title={user?.name || 'Administrator'}
          >
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
                title={isCollapsed ? link.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className={`space-y-1 pt-3 border-t w-full ${
        theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {/* Quick Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={isCollapsed ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          } ${
            theme === 'dark'
              ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-900/80'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 shrink-0 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 shrink-0 text-amber-600" />
          )}
          {!isCollapsed && (
            <span className="truncate font-bold">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Exit to Store */}
        <NavLink
          to="/"
          title={isCollapsed ? 'Exit to Customer Store' : undefined}
          className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          } ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Exit to Store</span>}
        </NavLink>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Log Out' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          } ${
            theme === 'dark' ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Log Out</span>}
        </button>
      </div>
    </div>
  );
};
