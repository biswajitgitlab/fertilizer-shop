import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import { useUIStore } from '../../store/uiStore';

export const AdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title = "Admin Portal"
}) => {
  const { theme, sidebarCollapsed } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={`h-screen w-screen font-sans relative overflow-hidden flex transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white'
        : 'bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white'
    }`}>
      
      {/* Background Mesh Gradients */}
      <div className={`fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-400/15'
      }`} />
      <div className={`fixed bottom-0 right-1/4 w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none z-0 ${
        theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-300/20'
      }`} />
      <div className={`fixed top-1/3 right-10 w-[400px] h-[400px] rounded-full blur-[110px] pointer-events-none z-0 ${
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className={`relative w-72 max-w-xs z-10 shadow-2xl border-r h-full overflow-x-hidden overflow-y-auto animate-in slide-in-from-left duration-200 ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} collapsed={false} />
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto z-10">
        
        {/* Senior Designer Glassmorphic Top Header */}
        <AdminHeader
          title={title}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Page Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Senior Designer Glassmorphic Admin Footer */}
        <AdminFooter />

      </div>
    </div>
  );
};
