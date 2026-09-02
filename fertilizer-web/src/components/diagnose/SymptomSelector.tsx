import React from 'react';
import { getSymptomsForCrop, SymptomItem } from '../../utils/constants';

interface SymptomSelectorProps {
  selectedCrop: string;
  selectedSymptoms: string[];
  onToggleSymptom: (label: string) => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  selectedCrop,
  selectedSymptoms,
  onToggleSymptom
}) => {
  const cropSymptoms: SymptomItem[] = getSymptomsForCrop(selectedCrop);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Showing symptoms specific to: <strong>{selectedCrop}</strong>
        </span>
        <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
          Select all symptoms present in your field
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cropSymptoms.map((s) => {
          const isSelected = selectedSymptoms.includes(s.label);
          
          let badgeColor = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800";
          if (s.category === 'Insect/Pest') badgeColor = "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800";
          if (s.category === 'Nutrient Deficiency') badgeColor = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800";
          if (s.category === 'Viral/Abiotic') badgeColor = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800";

          return (
            <button
              type="button"
              key={s.id}
              onClick={() => onToggleSymptom(s.label)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-md font-bold ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{s.icon}</span>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold leading-snug">{s.label}</span>
                </div>
                {s.hindiLabel && (
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                    {s.hindiLabel}
                  </p>
                )}
                <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
                  {s.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
