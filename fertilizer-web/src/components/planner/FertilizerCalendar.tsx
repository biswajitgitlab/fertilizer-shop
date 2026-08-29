import React from 'react';
import { CropTask } from '../../types';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const FertilizerCalendar: React.FC<{ tasks: CropTask[] }> = ({ tasks }) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-emerald-200/80 dark:border-slate-800 p-6 shadow-xl shadow-emerald-900/5 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-emerald-100 dark:border-slate-800 pb-3.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black text-gray-900 dark:text-white">Fertilizer Application Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300/60 dark:before:bg-emerald-800">
        {tasks.map((t) => {
          const isDone = t.status === 'Done';
          return (
            <div key={t.id} className="relative space-y-1 group">
              <div
                className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 transition-all ${
                  isDone ? 'bg-emerald-600 shadow-xs shadow-emerald-600/50 scale-110' : 'bg-amber-400'
                }`}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{formatDate(t.date)}</span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isDone ? 'Completed' : 'Scheduled'}
                </span>
              </div>
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">{t.stage}: {t.product}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">Dose: {t.qty} • Application: {t.method}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

