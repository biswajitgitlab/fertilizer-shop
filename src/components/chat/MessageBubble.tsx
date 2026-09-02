import React from 'react';
import { ChatMessage } from '../../types';
import { Sprout, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex gap-2.5 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md border border-emerald-400/30">
          <Sprout className="w-4 h-4 text-emerald-100" />
        </div>
      )}

      <div className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
        isBot
          ? 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 rounded-tl-none border border-emerald-200/60 dark:border-slate-800 shadow-md backdrop-blur-xs'
          : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-md border border-emerald-500/20'
      }`}>
        <div className={`prose prose-xs sm:prose-sm max-w-none ${isBot ? 'dark:prose-invert prose-emerald' : 'prose-invert'} ${!isBot && 'whitespace-pre-line'}`}>
          {isBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
        </div>
        <span className={`block text-[10px] mt-1.5 text-right ${isBot ? 'text-gray-400 dark:text-slate-400 font-medium' : 'text-emerald-200 font-medium'}`}>
          {message.timestamp}
        </span>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-emerald-950 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md border border-slate-700">
          <User className="w-4 h-4 text-emerald-300" />
        </div>
      )}
    </div>
  );
};

