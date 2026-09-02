import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plannerApi } from '../api/plannerApi';
import { CropPlan } from '../types';
import { FertilizerCalendar } from '../components/planner/FertilizerCalendar';
import { TaskList } from '../components/planner/TaskList';
import { formatDate } from '../utils/formatters';
import { ArrowLeft, Sprout, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const PlannerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<CropPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        if (!id) return;
        const data = await plannerApi.getPlanById(id);
        setPlan(data);
      } catch (e) {
        console.error("Plan detail error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;
    try {
      const updated = await plannerApi.toggleTaskStatus(plan.id, taskId);
      setPlan(updated);
      toast.success("Task status updated!");
    } catch (e) {
      toast.error("Failed to update task status.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-green-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16 text-center animate-pulse text-emerald-800 dark:text-emerald-300 font-bold">
        Loading crop schedule details...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-green-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crop Schedule Not Found</h2>
        <Link to="/planner" className="text-emerald-600 font-bold hover:underline">Back to Planner</Link>
      </div>
    );
  }

  const completedCount = plan.tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-green-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-300">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/35 dark:bg-emerald-900/15 rounded-full blur-3xl pointer-events-none glow-blob" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-teal-300/30 dark:bg-teal-900/15 rounded-full blur-3xl pointer-events-none glow-blob" style={{ animationDelay: '-3s' }} />
      
      {/* Grid Pattern */}
      <div className="planner-grid-pattern absolute inset-0 opacity-[0.15] dark:opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200/80 dark:border-slate-800 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>Back to All Schedules</span>
          </Link>
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 px-3 py-1 rounded-full border border-emerald-100 dark:border-slate-800">
            Schedule #{plan.id}
          </span>
        </div>

        {/* Plan Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-xs">
              <Sprout className="w-3 h-3" />
              {plan.crop} Crop Schedule
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{plan.crop} ({plan.fieldArea} Acres Field)</h1>
            <p className="text-xs sm:text-sm text-emerald-200">
              Sown on {formatDate(plan.sowingDate)} • Expected Harvest: {formatDate(plan.expectedHarvestDate)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-[170px] relative z-10">
            <span className="text-xs font-bold text-emerald-200 block">Current Stage</span>
            <span className="text-lg font-black text-white">{plan.currentStage}</span>
            <span className="text-[10px] font-semibold text-emerald-300 block mt-1">{completedCount}/{plan.tasks.length} Applications Done</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Task List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>Application Tasks & Recommended Products</span>
              </h2>
            </div>
            <TaskList tasks={plan.tasks} onToggleTask={handleToggleTask} />
          </div>

          {/* Right Column: Visual Timeline */}
          <div className="lg:col-span-5">
            <FertilizerCalendar tasks={plan.tasks} />
          </div>
        </div>

      </div>
    </div>
  );
};

