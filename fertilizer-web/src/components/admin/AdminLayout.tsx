import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu, Sparkles, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title = "Admin Portal"
}) => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-white flex">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col shrink-0 ${isCollapsed ? 'w-20' : 'w-64'} h-full z-20 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl overflow-x-hidden overflow-y-auto transition-all duration-300`}>
        <Sidebar collapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-slate-950 z-10 shadow-2xl border-r border-slate-800 h-full overflow-x-hidden overflow-y-auto">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Body (Independently Scrollable Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto z-10">
        
        {/* Glassmorphic Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar (Show menu)" : "Collapse Sidebar (Hide menu)"}
              className="hidden lg:flex items-center gap-1.5 p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Live System
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden sm:block w-72">
              <input
                type="text"
                placeholder="Search orders, farmers, SKUs..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Notifications Button */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
            </button>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-xs shadow-md shadow-emerald-950/50 border border-emerald-400/30">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-100 leading-tight">{user?.name || 'Store Admin'}</p>
                  <Shield className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="text-[10px] text-emerald-400/90 font-semibold tracking-wide uppercase">Manager</p>
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
