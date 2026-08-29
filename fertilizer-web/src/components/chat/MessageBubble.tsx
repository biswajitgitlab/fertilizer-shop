import React from 'react';
import { ChatMessage } from '../../types';
import { Sprout, User } from 'lucide-react';

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex gap-2.5 mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sprout className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
        isBot
          ? 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200/60'
          : 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
      }`}>
        <p className="whitespace-pre-line">{message.text}</p>
        <span className={`block text-[9px] mt-1 text-right ${isBot ? 'text-gray-400' : 'text-emerald-200'}`}>
          {message.timestamp}
        </span>
      </div>

      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
