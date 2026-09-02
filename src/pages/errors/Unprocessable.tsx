import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileWarning, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, Copy, Check, RefreshCw, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export const Unprocessable: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const customMessage = searchParams.get('message') || 'The server understood the request format, but the data parameters failed validation constraints.';
  const field = searchParams.get('field') || 'Multiple Payload Parameters';

  const handleCopyDiagnostic = () => {
    const diagnosticText = `HTTP 422 Unprocessable Content\nTimestamp: ${new Date().toISOString()}\nTarget Field: ${field}\nDetails: ${customMessage}`;
    navigator.clipboard.writeText(diagnosticText);
    setCopied(true);
    toast.success("Diagnostic details copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-cyan-500/15 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-cyan-500/30 dark:border-cyan-400/20 backdrop-blur-2xl shadow-2xl space-y-8 text-center">
          
          {/* Animated Hero Header Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 dark:bg-cyan-400/20 animate-pulse-ring pointer-events-none" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 dark:from-cyan-950/80 dark:to-emerald-950/80 border border-cyan-500/40 dark:border-cyan-400/30 flex items-center justify-center shadow-inner animate-float-slow">
              <FileWarning className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-validation-bounce" />
              
              <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white p-2 rounded-xl shadow-lg border border-cyan-300">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status & Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold tracking-widest uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              HTTP 422 — Validation Error
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Unprocessable Payload & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Data Verification Failure
              </span>
            </h1>

            <p className="text-slate-600 dark:text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              The submitted request could not be processed due to invalid parameters, missing required fields, or logical constraint violations.
            </p>
          </div>

          {/* Dynamic Validation Breakdown Checklist */}
          <div className="bg-slate-900/5 dark:bg-slate-950/70 rounded-2xl p-5 border border-cyan-500/20 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-emerald-300 text-xs">
              <span>Validation Check Results</span>
              <button
                onClick={handleCopyDiagnostic}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Info'}</span>
              </button>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider">{field}</span>
                  <p className="text-slate-600 dark:text-emerald-200/80 text-[11px]">{customMessage}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 pt-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-emerald-300/70">Request Headers & Authorization Verified</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back & Fix Input</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-900/80 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-emerald-200 font-bold text-sm border border-slate-300 dark:border-emerald-500/20 transition-all"
            >
              <Home className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Return Home</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
