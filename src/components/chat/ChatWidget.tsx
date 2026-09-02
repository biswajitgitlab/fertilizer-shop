import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { QuickReplies } from './QuickReplies';
import { ChatMessage } from '../../types';
import { chatApi } from '../../api/chatApi';
import { AnimatedSparkles, AnimatedCropDoctor } from '../common/AnimatedIcons';
import { useCart } from '../../hooks/useCart';

export const ChatWidget: React.FC = () => {
  const { chatOpen, toggleChat, setChatOpen } = useUIStore();
  const { itemCount } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: "Namaste! I am KrishiMitra, your digital farming & fertilizer assistant. Ask me anything about NPK dosage, insecticides, weed killers, or your orders!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = async () => {
    await chatApi.startSession();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "bot",
        text: "Chat history cleared! How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isTyping) return;
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          id: response.id || `bot-${Date.now()}`,
          sender: "bot",
          text: response.text,
          timestamp: response.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e: any) {
      const errText = e?.response?.status === 429
        ? "Too many chat messages sent! Please wait 1 minute before asking more questions."
        : "I am having trouble connecting right now, but you can explore our products or call toll-free 1800-888-FARM!";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: errText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed ${itemCount > 0 ? 'bottom-[128px]' : 'bottom-20'} sm:bottom-6 right-3 sm:right-6 z-50 transition-all duration-300 pointer-events-none`}>
      
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            className="pointer-events-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all cursor-pointer border-2 border-emerald-400/80 fixed right-3 bottom-20 sm:bottom-6 sm:right-6"
            aria-label="Open Chat Support"
          >
            <div className="relative">
              <AnimatedCropDoctor size={24} className="text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-emerald-600 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-bold pr-1 hidden sm:inline">Ask KrishiMitra AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Panel - Compact Card on Mobile and Desktop */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto fixed bottom-[84px] left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 w-[auto] sm:w-[390px] h-[500px] max-h-[75vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-emerald-800/40 flex flex-col justify-between overflow-hidden"
          >
            <ChatHeader onClose={() => setChatOpen(false)} onClear={handleClearChat} />

            {/* Messages Scroll Area with Agricultural Theme Background Pattern */}
            <div 
              className="flex-1 overflow-y-auto p-3 sm:p-4 bg-emerald-50/40 dark:bg-slate-950/80 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.04' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            >
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/50 dark:border-slate-800 w-fit backdrop-blur-xs shadow-xs italic font-semibold">
                  <AnimatedSparkles size={16} className="text-emerald-500 animate-spin" />
                  <span>KrishiMitra AI is generating advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Chips */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-2 border-t border-emerald-100/50 dark:border-slate-800">
              <QuickReplies disabled={isTyping} onSelect={(query) => handleSendMessage(query)} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                disabled={isTyping}
                placeholder={isTyping ? "KrishiMitra AI is replying..." : "Ask about crops, fertilizers, pests..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              />
              <motion.button
                whileHover={!isTyping && inputMessage.trim() ? { scale: 1.05 } : {}}
                whileTap={!isTyping && inputMessage.trim() ? { scale: 0.95 } : {}}
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
