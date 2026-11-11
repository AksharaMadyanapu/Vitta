import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Bot,
} from 'lucide-react';
import { api, SourceChip, ChatResponse } from '@/api/client';

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
      text: 'Hello Rakesh. I am your Runway cash mentor. Ask me anything about your workshop bills or test financial choices.',
      sources: [
        { label: 'Deccan Precision', value: 'Live Engine' },
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
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        text: 'Sorry, I could not reach the forecast intelligence service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Round Coral "Ask" button in bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#FF6B4A] text-white shadow-soft-hover hover:bg-[#E85535] flex items-center justify-center transition-all duration-250 hover:scale-105 active:scale-95"
        title="Ask Runway"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="flex flex-col items-center">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Ask</span>
          </div>
        )}
      </button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-22 right-6 z-40 w-[380px] max-w-[calc(100vw-48px)] h-[540px] bg-white rounded-[24px] shadow-soft-hover flex flex-col overflow-hidden"
          >
            {/* Header: Deep green with cream text */}
            <div className="p-4 bg-[#0F3D33] text-[#FBF7F0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold font-serif text-[#FBF7F0]">Ask Runway</h4>
                  <p className="text-[10px] text-[#8FB4AC]">Grounded in live simulation data</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-[#194E42] text-[#FBF7F0] flex items-center justify-center hover:bg-[#28584E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF7F0]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'copilot' && (
                    <div className="w-6 h-6 rounded-full bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold font-serif">
                      R
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#FF6B4A] text-white rounded-br-none shadow-soft'
                        : 'bg-white text-[#0F3D33] rounded-bl-none shadow-soft'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#F1E9DC] flex flex-wrap gap-1">
                        {m.sources.map((chip, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1E9DC] text-[#0F3D33]"
                          >
                            <span className="text-[#527A71]">{chip.label}:</span>
                            <span className="font-semibold">{chip.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 text-xs text-[#527A71]">
                  <div className="w-6 h-6 rounded-full bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center text-[10px] font-bold">
                    R
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-2.5 shadow-soft">
                    <span>Analyzing cash flow...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Exactly 3 Suggested Questions */}
            <div className="p-3 bg-white border-t border-[#F1E9DC] shrink-0">
              <span className="text-[10px] font-semibold text-[#527A71] uppercase tracking-wider block mb-1.5 px-1">
                Suggested questions:
              </span>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-[#F1E9DC]/60 text-[#0F3D33] hover:bg-[#CDEBDD] transition-colors truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#F1E9DC] flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask about cash, bills, or runway..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#FBF7F0] rounded-full text-xs text-[#0F3D33] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-full bg-[#FF6B4A] text-white hover:bg-[#E85535] disabled:opacity-40 transition-colors shrink-0 shadow-soft"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
