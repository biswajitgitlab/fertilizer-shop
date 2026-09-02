import React from 'react';
import { Link } from 'react-router-dom';
import { CropPlan } from '../../types';
import { Calendar, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const CropPlanCard: React.FC<{ plan: CropPlan }> = ({ plan }) => {
  const completedTasks = plan.tasks.filter(t => t.status === 'Done').length;
  const totalTasks = plan.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-200/70 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-600/10 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 space-y-4 flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-100/90 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {plan.crop} Schedule
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
            {plan.fieldArea} Acres
          </span>
        </div>

        <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {plan.crop} Growth Calendar
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Sown: <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(plan.sowingDate)}</span> • Harvest: <span className="font-semibold text-gray-800 dark:text-slate-200">{formatDate(plan.expectedHarvestDate)}</span>
        </p>

        {/* Task Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-600 dark:text-slate-400">NPK Dosing Progress</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{progressPercent}% ({completedTasks}/{totalTasks} Done)</span>
          </div>
          <div className="h-2.5 bg-emerald-100/60 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-200/40 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-emerald-100/80 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-slate-400 font-medium">
          Stage: <span className="font-bold text-emerald-800 dark:text-emerald-300">{plan.currentStage}</span>
        </div>

        <Link
          to={`/planner/${plan.id}`}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 transition-all hover:shadow-xs"
        >
          <span>View Schedule</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

