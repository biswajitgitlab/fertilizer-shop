import React, { useState, useEffect } from 'react';
import { plannerApi } from '../api/plannerApi';
import { CropPlan } from '../types';
import { CropPlanCard } from '../components/planner/CropPlanCard';
import { PlanCreator } from '../components/planner/PlanCreator';
import { Calendar, Plus, Sprout, Sparkles, ShieldCheck, TrendingUp, Layers } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Planner: React.FC = () => {
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await plannerApi.getMyPlans();
        setPlans(data);
      } catch (e) {
        console.error("Plans error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const totalAcres = plans.reduce((acc, p) => acc + (p.fieldArea || 0), 0);
  const completedTasksCount = plans.reduce(
    (acc, p) => acc + (p.tasks?.filter((t) => t.status === 'Done').length || 0),
    0
  );
  const totalTasksCount = plans.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-green-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-300">
      {/* Modern Light Green Decorative Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/35 dark:bg-emerald-900/15 rounded-full blur-3xl pointer-events-none glow-blob" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-teal-300/30 dark:bg-teal-900/15 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-lime-200/40 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-5s' }} />
      
      {/* Geometric Ambient Dots */}
      <div className="planner-grid-pattern absolute inset-0 opacity-[0.15] dark:opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-slate-800/80 shadow-lg shadow-emerald-900/5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 shrink-0">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Smart Agriculture Crop Planner</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Seasonal Fertilizer & Spray Schedules
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 max-w-2xl">
                  Calculate exact NPK doses, foliar spray dates, and dosage schedules tailored to your sowing date and acreage.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreator(!showCreator)}
              icon={<Plus className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 shrink-0 py-3 px-5 rounded-2xl transition-all duration-200"
            >
              {showCreator ? 'View Existing Schedules' : 'Create New Schedule'}
            </Button>
          </div>
        </div>

        {/* Agriculture Quick Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Active Crop Plans</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{plans.length} Schedules</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Total Cultivated Area</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{totalAcres} Acres</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">NPK Dosing Progress</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {totalTasksCount > 0 ? `${Math.round((completedTasksCount / totalTasksCount) * 100)}% Done` : '100% Ready'}
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Yield Optimization</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+25% Precision</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {showCreator ? (
          <PlanCreator />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-64 bg-white/70 dark:bg-slate-800/60 rounded-3xl border border-emerald-100/60 dark:border-slate-800" />
            <div className="h-64 bg-white/70 dark:bg-slate-800/60 rounded-3xl border border-emerald-100/60 dark:border-slate-800" />
            <div className="h-64 bg-white/70 dark:bg-slate-800/60 rounded-3xl border border-emerald-100/60 dark:border-slate-800" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-slate-800 p-12 text-center space-y-4 max-w-xl mx-auto shadow-lg shadow-emerald-900/5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No active seasonal schedules yet</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 max-w-md mx-auto">
                Create a customized, date-driven fertilizer calendar for Paddy, Wheat, Cotton, Sugarcane, or Mustard.
              </p>
            </div>
            <Button
              onClick={() => setShowCreator(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20"
            >
              Create Crop Schedule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <CropPlanCard key={p.id} plan={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

