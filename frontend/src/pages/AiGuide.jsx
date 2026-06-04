import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Sparkles, Trash2, Bot, User, ArrowRight } from 'lucide-react';

export default function AiGuide() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Merhaba ${user?.name || 'Öğrenci'}! Ben senin AI Rehberinim. Yapay zekâ okuryazarlığı, makine öğrenmesi, veri güvenliği, deepfake, telif hakları ve etik kullanım konularında merak ettiğin her şeyi bana sorabilirsin. Nasıl yardımcı olabilirim?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'Deepfake videoları nasıl ayırt edebilirim?',
    'Ödevimi tamamen ChatGPT’ye yazdırmak etik mi?',
    'Yapay zekâ araçlarında veri gizliliğimi nasıl korurum?',
    'Gemini ve ChatGPT arasındaki fark nedir?',
    'Yapay zekâda telif hakları tartışması nedir?'
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Format chat history for Gemini API
      // Backend expects: history: [{role: "user"|"model", parts: [{text: "..."}]}]
      const historyFormatted = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await axios.post('/api/ai/chat', {
        message: messageText,
        history: historyFormatted
      });

      // Append model response
      setMessages(prev => [...prev, { role: 'model', text: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen internet bağlantınızı veya API yapılandırmasını kontrol edin.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        role: 'model',
        text: `Sohbet geçmişi temizlendi. Merhaba ${user?.name || 'Öğrenci'}! Yapay zekâ okuryazarlığı ve etik kullanım konularında sana nasıl yardımcı olabilirim?`
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative h-[85vh] flex flex-col">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[90px] pointer-events-none pulse-glow"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
              AI Rehber
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={8} />
                Gemini Aktif
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Lise seviyesinde yapay zekâ ve etik asistanınız.
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          title="Sohbeti Temizle"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Suggestion Chips (Visible if only welcome message is present) */}
      {messages.length === 1 && (
        <div className="py-4 shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Önerilen Sorular</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl glass-input text-slate-300 hover:text-white hover:border-teal-500/50 cursor-pointer flex items-center gap-1.5 transition-all text-left"
              >
                {s}
                <ArrowRight size={12} className="text-teal-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {messages.map((msg, index) => {
          const isModel = msg.role === 'model';
          return (
            <div key={index} className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`p-2 rounded-xl shrink-0 border ${
                isModel
                  ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
              }`}>
                {isModel ? <Bot size={16} /> : <User size={16} />}
              </div>

              {/* Message bubble */}
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed font-light ${
                isModel
                  ? 'glass-panel border-white/5 text-slate-200 rounded-tl-none'
                  : 'bg-gradient-to-br from-sky-600/30 to-indigo-600/20 border border-sky-500/20 text-slate-100 rounded-tr-none'
              }`}>
                {/* Parse line breaks nicely */}
                {msg.text.split('\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Loading / Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl border bg-teal-500/10 border-teal-500/20 text-teal-400">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl glass-panel border-white/5 rounded-tl-none flex items-center gap-1.5 py-5 px-6">
              <span className="w-2.5 h-2.5 bg-teal-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 bg-teal-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 bg-teal-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="pt-4 border-t border-white/10 shrink-0">
        <div className="relative flex items-center">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Yapay zekâ hakkında merak ettiğin bir konuyu sor..."
            className="w-full pl-4 pr-12 py-3.5 rounded-xl glass-input text-sm focus:outline-none resize-none overflow-hidden max-h-24 pr-14"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 p-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 disabled:brightness-50 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
