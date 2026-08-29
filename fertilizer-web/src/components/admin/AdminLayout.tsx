import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu, Sparkles, Shield, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

export const AdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title = "Admin Portal"
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={`h-screen w-screen font-sans relative overflow-hidden flex transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white' : 'bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white'
    }`}>
      
      {/* Background Mesh Gradients */}
      <div className={`fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-400/15'
      }`} />
      <div className={`fixed bottom-0 right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-300/20'
      }`} />
      <div className={`fixed top-1/3 right-10 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-300/15'
      }`} />

      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col shrink-0 ${sidebarCollapsed ? 'w-20' : 'w-64'} h-full z-20 transition-all duration-300 ${
        theme === 'dark'
          ? 'border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl'
          : 'border-r border-slate-200 bg-white shadow-xs'
      }`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className={`relative w-64 max-w-xs z-10 shadow-2xl border-r h-full overflow-x-hidden overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} collapsed={false} />
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto z-10">
        
        {/* Glassmorphic Sticky Top Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 text-white shadow-lg shadow-black/20'
            : 'bg-white/85 border-slate-200 text-slate-900 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl transition-all ${
                theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Open Mobile Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Single Sidebar Collapse Toggle Button */}
            <button
              onClick={toggleSidebarCollapsed}
              title={sidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
              className={`hidden lg:flex items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer border ${
                theme === 'dark'
                  ? 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 border-slate-800'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200'
              }`}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-emerald-500" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-center gap-2.5">
              <h1 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                <span>{title}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Live System
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative hidden sm:block w-72">
              <input
                type="text"
                placeholder="Search orders, farmers, SKUs..."
                className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 transition-all shadow-inner ${
                  theme === 'dark'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/40'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
              />
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
              }`} />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                theme === 'dark'
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 border-slate-800'
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-amber-600" />
              )}
            </button>

            {/* Notifications Button */}
            <button className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* Admin Profile Chip */}
            <div className={`flex items-center gap-2.5 pl-3 border-l ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-xs shadow-md border border-emerald-400/30">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1">
                  <p className={`text-xs font-bold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    {user?.name || 'Store Admin'}
                  </p>
                  <Shield className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-[10px] text-emerald-500 font-semibold tracking-wide uppercase">Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

      </div>
    </div>
  );
};
