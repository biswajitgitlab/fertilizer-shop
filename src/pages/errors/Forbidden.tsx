import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldX, Lock, ArrowLeft, UserCheck, ShieldAlert, Home, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, logout } = useAuthStore();

  const requiredPerm = searchParams.get('perm') || 'Administrative Permission';
  const requestedPath = searchParams.get('path') || window.location.pathname;

  const handleSwitchAccount = () => {
    logout();
    navigate(requestedPath.startsWith('/admin') ? '/admin/login' : '/login');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/15 dark:bg-rose-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-rose-500/30 dark:border-rose-500/20 backdrop-blur-2xl shadow-2xl space-y-8 text-center">
          
          {/* Animated Hero Header Badge with Radar Scan Ring */}
          <div className="relative inline-flex items-center justify-center">
            {/* Outer radar scanning ring */}
            <div className="absolute w-36 h-36 rounded-full border border-rose-500/30 dark:border-rose-400/20 animate-radar-spin pointer-events-none flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-rose-500 absolute top-0" />
            </div>

            <div className="absolute inset-0 rounded-full bg-rose-500/20 dark:bg-rose-500/15 animate-pulse-ring pointer-events-none" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-500/20 via-emerald-500/10 to-teal-500/20 dark:from-rose-950/80 dark:to-slate-950 border border-rose-500/40 dark:border-rose-400/30 flex items-center justify-center shadow-inner animate-float-slow">
              <ShieldX className="w-12 h-12 sm:w-14 sm:h-14 text-rose-500 dark:text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
              
              <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-2 rounded-xl shadow-lg border border-rose-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              HTTP 403 — Access Forbidden
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Restricted Area & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-rose-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Access Denied
              </span>
            </h1>

            <p className="text-slate-600 dark:text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              You do not have the required permissions or security role to view this module. Please switch accounts or contact your System Administrator.
            </p>
          </div>

          {/* Role & Permission Diagnosis Card */}
          <div className="bg-slate-900/5 dark:bg-slate-950/70 rounded-2xl p-4 border border-rose-500/20 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Security Context
              </span>
              <span className="bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-mono">
                {user?.role || 'Guest User'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-emerald-200/70 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div>
                Missing Permission: <span className="text-rose-600 dark:text-rose-400 font-semibold block sm:inline">{requiredPerm}</span>
              </div>
              <div className="truncate">
                Resource: <span className="text-slate-800 dark:text-emerald-300 font-semibold">{requestedPath}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/')}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-emerald-500 to-teal-600 hover:from-rose-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>{isAdmin ? 'Return to Admin Dashboard' : 'Back to Home Store'}</span>
            </button>

            <button
              onClick={handleSwitchAccount}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-emerald-200 font-bold text-sm border border-slate-300 dark:border-emerald-500/20 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Switch Account</span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center p-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-500/20 transition-all"
              title="Go to Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
