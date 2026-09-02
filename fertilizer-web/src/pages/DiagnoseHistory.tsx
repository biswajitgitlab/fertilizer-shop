import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diagnoseApi } from '../api/diagnoseApi';
import { Diagnosis } from '../types';
import { Stethoscope, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const DiagnoseHistory: React.FC = () => {
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await diagnoseApi.getHistory();
        setHistory(data);
      } catch (e) {
        console.error("History error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Crop Diagnosis Reports</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {user ? `Saved lab reports for ${user.name}` : 'AI scans & store treatment recommendations'}
            </p>
          </div>
        </div>

        <Link
          to="/diagnose"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          + New Crop Scan
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-28 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-12 text-center space-y-3">
          <Stethoscope className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No diagnosis reports found</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Run a free AI diagnosis on your crop leaves today.</p>
          <Link to="/diagnose" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
            Start Free AI Diagnosis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((diag) => {
            const isVerified = Boolean(diag.adminReviewed);
            return (
              <div 
                key={diag.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                      {diag.crop} Crop Analysis
                    </span>
                    {isVerified ? (
                      <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Scientist Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {diag.confidence}% AI Confidence
                  </span>
                </div>

                <h3 className="text-base font-black text-gray-900 dark:text-white">{diag.title}</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{diag.description}</p>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-slate-500 font-medium">Growth Stage: {diag.growthStage}</span>
                  <Link to={`/diagnose/${diag.id}`} className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                    <span>View Full Prescription</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
