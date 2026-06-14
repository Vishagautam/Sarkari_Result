import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EligibilityProfile } from '../types';
import { Send, Sparkles, X, MessageSquareCode, ShieldAlert, Bot } from 'lucide-react';

interface AiAssistantProps {
  onClose: () => void;
  profile: EligibilityProfile;
}

const PRESETS = [
  "Which active jobs are best for 12th pass?",
  "What B.Tech jobs are live?",
  "Tell me current Railways vacancies.",
  "What is the SSC CHSL syllabus?",
  "Which exams are closing this month?"
];

export default function AiAssistant({ onClose, profile }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Namaste! 🙏 I am **AI Sarkari Mitra**, your dedicated Careers & Jobs assistant. I have cross-referenced your profile with active notifications. Ask me anything about educational requirements, age relaxations, exam dates, syllabus, or apply steps!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyMissingError, setKeyMissingError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setKeyMissingError(null);

    const historyPayload = [...messages, userMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyPayload,
          profile: profile
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 || errorData.error?.includes('missing') || errorData.error?.includes('Key')) {
          setKeyMissingError(errorData.message || "Gemini API Key is not configured. Please add GEMINI_API_KEY in the Settings > Secrets menu inside AI Studio.");
        } else {
          throw new Error(errorData.details || errorData.error || "Failed to contact chat server");
        }
      } else {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "⚠️ Sorry, I encountered an issue reaching the AI backend. Make sure your server is running and the internet is connected properly." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Sidebar Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
              <span>AI Sarkari Mitra</span>
              <span className="bg-pink-600/20 text-pink-400 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black">Interactive AI</span>
            </h3>
            <p className="text-[10px] text-slate-400">Careers & Exams Advisor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800/50 rounded-lg cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`}
          >
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center text-white text-[10px] uppercase font-bold shrink-0 mt-1">
                AI
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
            }`}>
              {/* Parse rudimentary bold markdown formatting */}
              {msg.text.split('\n').map((line, linIdx) => {
                // Map crude bold lines
                let cleanLine = line;
                const boldRegex = /\*\*(.*?)\*\*/g;
                let match;
                const parts: React.ReactNode[] = [];
                let lastIndex = 0;

                while ((match = boldRegex.exec(line)) !== null) {
                  const beforeText = line.substring(lastIndex, match.index);
                  if (beforeText) parts.push(beforeText);
                  parts.push(<strong key={match.index} className="font-black text-pink-400">{match[1]}</strong>);
                  lastIndex = boldRegex.lastIndex;
                }
                const afterText = line.substring(lastIndex);
                if (afterText) parts.push(afterText);

                return (
                  <p key={linIdx} className={linIdx > 0 ? 'mt-1.5' : ''}>
                    {parts.length > 0 ? parts : cleanLine}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center text-white text-[10px] uppercase font-bold shrink-0">
              AI
            </div>
            <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-xl rounded-tl-none px-4 py-3 text-xs flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>Searching active vacancies and rules...</span>
            </div>
          </div>
        )}

        {/* API Key missing Guide */}
        {keyMissingError && (
          <div className="bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs rounded-xl p-3.5 flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Secrets Configuration Required</p>
              <p className="mt-1 leading-normal text-rose-300/80">{keyMissingError}</p>
              <div className="mt-2.5 bg-slate-950 p-2 rounded border border-rose-900 font-mono text-[10px] text-slate-300 select-all">
                GEMINI_API_KEY="YOUR_KEY"
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Clips */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-2">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="shrink-0 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-full px-3 py-1 cursor-pointer transition-all active:scale-95"
          >
            {p}
          </button>
        ))}
      </div>

      {/* User Input controls */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Mitra about eligibility, syllabus..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-gray-100 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSend(input)}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
