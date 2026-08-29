import React from 'react';
import { Link } from 'react-router-dom';
import { CropPlan } from '../../types';
import { Calendar, Sprout, ArrowRight, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const CropPlanCard: React.FC<{ plan: CropPlan }> = ({ plan }) => {
  const completedTasks = plan.tasks.filter(t => t.status === 'Done').length;
  const totalTasks = plan.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5" />
            {plan.crop} Crop Plan
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{plan.fieldArea} Acres Field</span>
        </div>

        <h3 className="text-base font-black text-gray-900 dark:text-white">{plan.crop} Fertilizer Schedule</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Sown: <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(plan.sowingDate)}</span> • Harvest: <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(plan.expectedHarvestDate)}</span>
        </p>

        {/* Task Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-600 dark:text-slate-400">Application Progress</span>
            <span className="text-emerald-700 dark:text-emerald-400">{progressPercent}% ({completedTasks}/{totalTasks} Done)</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-slate-400 font-medium">
          Stage: <span className="font-bold text-gray-900 dark:text-white">{plan.currentStage}</span>
        </div>

        <Link
          to={`/planner/${plan.id}`}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 hover:underline"
        >
          <span>View Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
