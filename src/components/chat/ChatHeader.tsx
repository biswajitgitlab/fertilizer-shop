import React from 'react';
import { Sprout, X, Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onClear?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onClear }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-emerald-800/50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-inner">
            <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-950 rounded-full" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold leading-tight text-white flex items-center gap-1.5">
            KrishiMitra AI <span className="bg-emerald-800/80 text-emerald-200 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-700/50">PRO</span>
          </h3>
          <p className="text-[10px] text-emerald-300 font-medium">Online • Agri & Fertilizer Specialist</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onClear && (
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-emerald-900/80 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Clear Chat History"
            aria-label="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-emerald-900/80 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Close Chat"
          aria-label="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
