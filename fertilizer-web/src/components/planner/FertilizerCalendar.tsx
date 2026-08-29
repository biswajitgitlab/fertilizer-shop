import React from 'react';
import { CropTask } from '../../types';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const FertilizerCalendar: React.FC<{ tasks: CropTask[] }> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <CalendarIcon className="w-5 h-5 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-900">Fertilizer Application Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
        {tasks.map((t, index) => {
          const isDone = t.status === 'Done';
          return (
            <div key={t.id} className="relative space-y-1">
              <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                isDone ? 'bg-emerald-600' : 'bg-amber-400'
              }`} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">{formatDate(t.date)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isDone ? 'Completed' : 'Scheduled'}
                </span>
              </div>
              <p className="text-xs font-black text-emerald-900">{t.stage}: {t.product}</p>
              <p className="text-[11px] text-gray-500">Dose: {t.qty} • Application: {t.method}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
