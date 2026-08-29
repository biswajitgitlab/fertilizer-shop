import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plannerApi } from '../api/plannerApi';
import { CropPlan } from '../types';
import { FertilizerCalendar } from '../components/planner/FertilizerCalendar';
import { TaskList } from '../components/planner/TaskList';
import { formatDate } from '../utils/formatters';
import { ArrowLeft, Sprout, Calendar, ShieldCheck } from 'lucide-react';
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
    return <div className="max-w-4xl mx-auto py-16 text-center animate-pulse">Loading crop schedule...</div>;
  }

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Crop Schedule Not Found</h2>
        <Link to="/planner" className="text-emerald-600 font-bold hover:underline">Back to Planner</Link>
      </div>
    );
  }

  const completedCount = plan.tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link to="/planner" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Schedules</span>
        </Link>
        <span className="text-xs font-bold text-gray-400">Schedule #{plan.id}</span>
      </div>

      {/* Plan Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            {plan.crop} Crop Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">{plan.crop} ({plan.fieldArea} Acres Field)</h1>
          <p className="text-xs text-emerald-200">
            Sown on {formatDate(plan.sowingDate)} • Expected Harvest: {formatDate(plan.expectedHarvestDate)}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-xs font-bold text-emerald-200 block">Current Stage</span>
          <span className="text-lg font-black text-white">{plan.currentStage}</span>
          <span className="text-[10px] text-emerald-300 block mt-1">{completedCount}/{plan.tasks.length} Applications Done</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Task List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-black text-gray-900">Application Tasks & Recommended Products</h2>
          <TaskList tasks={plan.tasks} onToggleTask={handleToggleTask} />
        </div>

        {/* Right Column: Visual Timeline */}
        <div className="lg:col-span-5">
          <FertilizerCalendar tasks={plan.tasks} />
        </div>
      </div>

    </div>
  );
};
