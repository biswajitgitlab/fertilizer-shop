import React from 'react';

interface QuickRepliesProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ onSelect, disabled = false }) => {
  const options = [
    "🌾 Paddy Fertilizer Dose",
    "🐛 Cotton Whitefly Pest Control",
    "🍃 Herbicide for Weeds",
    "📦 Track Order Status",
    "👨‍🌾 Talk to Human Expert"
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-3 no-scrollbar">
      {options.map((opt, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-3 py-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
