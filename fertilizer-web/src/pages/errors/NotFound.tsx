import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, ShoppingBag, Sprout, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-teal-500/15 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-emerald-500/30 dark:border-emerald-400/20 backdrop-blur-2xl shadow-2xl space-y-8 text-center">
          
          {/* Animated Hero Header Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 animate-pulse-ring pointer-events-none" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-lime-500/20 dark:from-emerald-950/80 dark:to-teal-950/80 border border-emerald-500/40 dark:border-emerald-400/30 flex items-center justify-center shadow-inner animate-float-slow">
              <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-radar-spin" />
              
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-xl shadow-lg border border-emerald-300">
                <Sprout className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-widest uppercase">
              <Search className="w-3.5 h-3.5" />
              HTTP 404 — Page Not Found
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Lost in the Fields & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 bg-clip-text text-transparent">
                Route Unreachable
              </span>
            </h1>

            <p className="text-slate-600 dark:text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              The page you are looking for might have been moved, renamed, or is temporarily unavailable in our catalog.
            </p>
          </div>

          {/* Suggested Links */}
          <div className="bg-slate-900/5 dark:bg-slate-950/70 rounded-2xl p-4 border border-emerald-500/20 text-left space-y-2 text-xs">
            <div className="text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
              Explore Popular Sections
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <Link to="/products" className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 hover:bg-emerald-500/10 text-slate-700 dark:text-emerald-200 font-semibold flex items-center gap-2 transition-all">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                <span>Fertilizers Catalog</span>
              </Link>
              <Link to="/diagnose" className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 hover:bg-emerald-500/10 text-slate-700 dark:text-emerald-200 font-semibold flex items-center gap-2 transition-all">
                <Sprout className="w-4 h-4 text-emerald-500" />
                <span>AI Crop Diagnosis</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Back to Store Front</span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-emerald-200 font-bold text-sm border border-slate-300 dark:border-emerald-500/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
