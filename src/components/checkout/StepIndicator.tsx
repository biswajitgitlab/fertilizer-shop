import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1: Address, 2: Review, 3: Payment, 4: Done
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Address" },
    { num: 2, label: "Order Review" },
    { num: 3, label: "Payment" },
    { num: 4, label: "Confirmation" }
  ];

  return (
    <div className="flex items-center justify-between max-w-xl mx-auto py-4 px-2">
      {steps.map((s, i) => {
        const isPassed = currentStep > s.num;
        const isCurrent = currentStep === s.num;
        return (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                isPassed
                  ? 'bg-emerald-600 text-white'
                  : isCurrent
                  ? 'bg-emerald-800 dark:bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/80 shadow-md'
                  : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              }`}>
                {isPassed ? <Check className="w-5 h-5 stroke-[3]" /> : s.num}
              </div>
              <span className={`text-[11px] font-bold ${
                isCurrent || isPassed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full ${
                currentStep > s.num ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
