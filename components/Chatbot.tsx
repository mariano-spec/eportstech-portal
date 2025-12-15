import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Minimize2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatbotProps {
  lang: Language;
}

const Chatbot: React.FC<ChatbotProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Greeting - Updated to Spanish as default
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: `👋 ¡Hola! Soy NEXI_tech. ¿En qué puedo ayudarte con las soluciones de EportsTech hoy?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await generateChatResponse(history, userMsg.text, lang);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
       console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-primary-600'} text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col border border-gray-200 overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-primary-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full relative">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary-900 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm">NEXI_tech</h4>
                <p className="text-xs text-primary-200">EportsTech Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-200 hover:text-white">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary-600" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="text-primary-600 hover:text-primary-800 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 text-center py-1 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">Powered by Gemini AI</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;