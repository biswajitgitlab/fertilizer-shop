import React from 'react';
import { COMMON_SYMPTOMS } from '../../utils/constants';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onToggleSymptom: (label: string) => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  selectedSymptoms,
  onToggleSymptom
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {COMMON_SYMPTOMS.map((s) => {
        const isSelected = selectedSymptoms.includes(s.label);
        return (
          <button
            type="button"
            key={s.id}
            onClick={() => onToggleSymptom(s.label)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              isSelected
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm font-bold ring-2 ring-emerald-500/20'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};
