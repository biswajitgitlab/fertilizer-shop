import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Database, Lock, Command, Sparkles, ExternalLink } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { Logo } from '../common/Logo';

export const AdminFooter: React.FC = () => {
  const { theme } = useUIStore();

  return (
    <footer className={`mt-auto border-t px-4 sm:px-8 py-5 transition-colors duration-300 backdrop-blur-xl relative z-10 ${
      theme === 'dark'
        ? 'bg-slate-950/70 border-slate-800/80 text-slate-400'
        : 'bg-white/80 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Footer Row: Brand, Health Badges & Shortcuts */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Left: Branding & Enterprise Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
              <Logo variant="icon" size="xs" />
              <span className="tracking-tight text-sm">Fertilizer Shop Admin</span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-800">•</span>

            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              v2.4.0 Enterprise
            </span>
          </div>

          {/* Center: System Performance & Health Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px]">
            {/* Live Status Pill */}
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational</span>
            </span>

            {/* API Latency */}
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>18ms Latency</span>
            </span>

            {/* Redis Engine */}
            <span className="hidden md:inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>Redis Engine</span>
            </span>

            {/* Security SSL */}
            <span className="hidden md:inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 Encrypted</span>
            </span>
          </div>

          {/* Right: Quick Links */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 text-[11px] font-semibold">
            <Link to="/admin/analytics" className="hover:text-emerald-500 transition-colors">
              Analytics
            </Link>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <Link to="/admin/roles" className="hover:text-emerald-500 transition-colors">
              Roles & Access
            </Link>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <Link to="/admin/inventory" className="hover:text-emerald-500 transition-colors">
              Stock Audit
            </Link>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <Link to="/" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Sub-bar: Keyboard Hint & Copyright */}
        <div className={`pt-3 border-t text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 ${
          theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Command className="w-3 h-3" /> K
            </span>
            <span>Press for Command Palette</span>
          </div>

          <p className="text-center sm:text-right text-slate-500 dark:text-slate-400 font-medium">
            © {new Date().getFullYear()} SarkarFertilizer Inc. All Rights Reserved. Enterprise Admin Portal.
          </p>
        </div>
      </div>
    </footer>
  );
};
