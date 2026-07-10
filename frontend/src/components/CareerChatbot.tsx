import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Bot, Maximize2, Minimize2 } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const CareerChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: `Hello! I am your SkillUp Mentor. Ask me anything about engineering roles, technical prep, or learning roadmaps.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI simulation delay
    setTimeout(() => {
      let reply = "I am processing your query. Please target certifications like AWS Developer Associate or Scrum CSM. Building Capstone Projects like distributed caching layers also boosts portfolio indices.";
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('certif')) {
        reply = "Recommended Certifications:\n1. Cloud: AWS Certified Solutions Architect or GCP Associate.\n2. Engineering Methodologies: Scrum Master CSM.\n3. Security: CompTIA Security+.";
      } else if (lower.includes('project') || lower.includes('capstone')) {
        reply = "Recommended Capstone Projects:\n1. Scalable URL Shortener: Deploy using Redis caching, Node/Python APIs, and Docker.\n2. Collaborative Canvas: Draw a canvas room syncing changes via WebSockets.";
      } else if (lower.includes('salary') || lower.includes('expect')) {
        reply = "Salary Guidelines:\n- Entry-Level: $70,000 to $95,000 depending on location.\n- Mid-Level: $110,000 to $145,000.\n- Strategy: Certifications and metrics-focused projects give strong leverage to negotiate up to 15% higher starting salaries.";
      } else if (lower.includes('interview') || lower.includes('prepare')) {
        reply = "Interview Prep Tips:\n1. Algorithms: Solve 1 dynamic coding problem daily using Python/Java.\n2. System Design: Study ByteByteGo templates (load balancers, caching, DB scaling).\n3. STAR Method: Structure behavioral interview answers targeting action outcomes.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 1000);
  };

  const presetQuestions = [
    "What certifications are best?",
    "What salary should I expect?",
    "What capstone project should I build?",
    "How to prepare for interviews?"
  ];

  return (
    <div 
      className={
        isFullscreen && isOpen
          ? "fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen"
          : "fixed bottom-6 right-6 z-50"
      }
    >
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#2563EB] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div 
          className={
            isFullscreen 
              ? "flex-1 flex flex-col w-full h-full"
              : "bg-white border border-[#E5E7EB] rounded-lg shadow-xl w-96 max-w-[calc(100vw-2rem)] h-[480px] flex flex-col overflow-hidden"
          }
        >
          {/* Header */}
          <div className="bg-[#2563EB] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">SkillUp Assistant</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }} 
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg text-sm max-w-[75%] shadow-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white rounded-br-none'
                      : 'bg-white text-[#1E293B] border border-[#E5E7EB] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold uppercase shadow">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white text-[#475569] p-3 rounded-lg text-sm border border-[#E5E7EB] rounded-bl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#64748B] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#64748B] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#64748B] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips - Render only if scrolled or clean */}
          <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-wrap gap-1.5">
            {presetQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs font-bold bg-white text-[#2563EB] border border-blue-100 hover:bg-blue-50 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-[#E5E7EB] flex gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SkillUp Mentor..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
            <button
              type="submit"
              className="bg-[#2563EB] text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
