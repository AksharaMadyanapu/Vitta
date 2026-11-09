import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  CornerDownLeft,
  ChevronDown,
  ShieldCheck,
  Bot,
  User,
} from 'lucide-react';
import { api, SourceChip, ChatResponse } from '@/api/client';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  sources?: SourceChip[];
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Why am I short on 5 Dec?',
  'Who is paying me late?',
  'What should I do this week?',
  'Can I afford a ₹5L purchase?',
];

export const RunwayCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'copilot',
      text: 'Hello Rakesh. I am Runway Copilot. I analyze your live bank balances, simulation trajectories, and counterparties. Ask me anything about your cash flow or test decisions.',
      sources: [
        { label: 'Deccan Precision', value: 'Live Engine' },
        { label: 'Grounding', value: '100% Real Facts' },
      ],
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res: ChatResponse = await api.chatCopilot(text.trim());
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: res.reply,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        text: 'Sorry, I encountered an issue contacting the intelligence engine. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1E1B4B] text-white shadow-xl border border-[#3F3DDB]/30 hover:bg-[#2E2A72] transition-colors group"
        >
          <div className="w-6 h-6 rounded-full bg-[#3F3DDB] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask Runway</span>
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
        </motion.button>
      )}

      {/* Floating Copilot Modal/Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-[16px] bg-white border border-[#E8EAF0] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#1E1B4B] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3F3DDB] flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold font-heading">Runway Copilot</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/20 text-[#4ADE80]">
                      Grounded
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A5B4FC]">
                    Grounded in real simulation numbers
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#A5B4FC] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[14px] p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#3F3DDB] text-white rounded-br-none'
                        : 'bg-white border border-[#E8EAF0] text-[#111827] shadow-sm rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Source Chips under Copilot replies */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#F1F2F6] flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mr-1 self-center">
                          Sources:
                        </span>
                        {msg.sources.map((chip, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EEF0FD] text-[#3F3DDB] border border-[#C7D2FE]"
                          >
                            <span className="text-[#6B7280]">{chip.label}:</span>
                            <strong className="font-semibold">{chip.value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white border border-[#E8EAF0] p-3 rounded-[14px] text-xs text-[#6B7280] flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#3F3DDB] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#3F3DDB] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#3F3DDB] animate-bounce [animation-delay:0.4s]" />
                    <span>Analyzing cash-flow trajectories...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips */}
            <div className="p-2.5 bg-white border-t border-[#E8EAF0] shrink-0">
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1.5 px-1">
                Suggested questions:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F6FA] text-[#374151] border border-[#E8EAF0] hover:bg-[#EEF0FD] hover:text-[#3F3DDB] hover:border-[#C7D2FE] transition-colors shrink-0 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E8EAF0] flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask about cash runway, bills, or purchases..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-[#F9FAFB] border border-[#E8EAF0] rounded-lg text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#3F3DDB] transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-lg bg-[#3F3DDB] text-white hover:bg-[#3230C8] disabled:opacity-40 transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

