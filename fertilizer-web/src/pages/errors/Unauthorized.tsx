import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowLeft, KeyRound, Lock, RefreshCw, Home, Sparkles } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const isAdmin = searchParams.get('portal') === 'admin' || redirectPath.startsWith('/admin');

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/30 dark:border-amber-400/20 backdrop-blur-2xl shadow-2xl space-y-8 text-center">
          
          {/* Animated Hero Header Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 dark:bg-amber-400/20 animate-pulse-ring pointer-events-none" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 dark:from-amber-950/80 dark:to-emerald-950/80 border border-amber-500/40 dark:border-amber-400/30 flex items-center justify-center shadow-inner animate-float-slow">
              <KeyRound className="w-12 h-12 sm:w-14 sm:h-14 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              
              <div className="absolute -bottom-2 -right-2 bg-amber-500 dark:bg-amber-400 text-slate-950 p-2 rounded-xl shadow-lg border border-amber-300">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5" />
              HTTP 401 — Authentication Required
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Session Expired or <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Login Required
              </span>
            </h1>

            <p className="text-slate-600 dark:text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              You need an active authenticated session to view this page or complete your request. Please log in with your credentials to continue.
            </p>
          </div>

          {/* Diagnostic Context Card */}
          <div className="bg-slate-900/5 dark:bg-slate-950/60 rounded-2xl p-4 border border-amber-500/20 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Security Status
              </span>
              <span>Token Unverified</span>
            </div>
            <p className="text-slate-500 dark:text-emerald-200/60 font-mono text-[11px] truncate">
              Requested Path: <span className="text-slate-700 dark:text-emerald-300 font-semibold">{redirectPath}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(isAdmin ? '/admin/login' : '/login')}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-600 hover:from-amber-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAdmin ? 'Sign In to Admin Portal' : 'Log In to Account'}</span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-emerald-200 font-bold text-sm border border-slate-300 dark:border-emerald-500/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center p-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-500/20 transition-all"
              title="Return to Home Store"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
