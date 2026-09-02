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
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sprout className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
        isBot
          ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-700 shadow-sm'
          : 'bg-emerald-600 text-white rounded-tr-none shadow-md'
      }`}>
        <div className={`prose prose-sm max-w-none ${isBot ? 'dark:prose-invert prose-emerald' : 'prose-invert'} ${!isBot && 'whitespace-pre-line'}`}>
          {isBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
        </div>
        <span className={`block text-[10px] mt-2 text-right ${isBot ? 'text-gray-400 dark:text-slate-500' : 'text-emerald-200'}`}>
          {message.timestamp}
        </span>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

