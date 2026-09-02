import React from 'react';
import { Sprout, X, Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onClear?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onClear }) => {
  return (
    <div className="bg-emerald-950 text-white p-3.5 flex items-center justify-between border-b border-emerald-900 rounded-t-2xl">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-950 rounded-full" />
        </div>
        <div>
          <h3 className="text-xs font-bold leading-tight">KrishiMitra AI Assistant</h3>
          <p className="text-[10px] text-emerald-300">Online • Agriculture & Fertilizer Advisor</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onClear && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-emerald-900 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1 hover:bg-emerald-900 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
