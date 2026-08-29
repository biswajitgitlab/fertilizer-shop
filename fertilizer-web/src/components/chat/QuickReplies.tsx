import React from 'react';

interface QuickRepliesProps {
  onSelect: (query: string) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ onSelect }) => {
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
          onClick={() => onSelect(opt)}
          className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-full px-3 py-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
