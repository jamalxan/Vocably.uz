'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AiChat() {
  const { token, chatMessages, setChatMessages } = useApp();
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(data.history);
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-indigo-600 flex items-center gap-1.5">
          <Sparkles size={14} /> Ingliz tili AI yordamchisi
        </span>
        <span className="hidden sm:inline">Faqat til, grammatika va tarjima bo'yicha</span>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Sparkles className="mx-auto mb-3 text-indigo-400" size={32} />
            <p className="text-sm">Assalomu alaykum! Ingliz tili yoki tarjima bo'yicha savolingiz bormi?</p>
            <p className="text-[10px] text-slate-400 mt-1">Masalan: "arise" so'zini bir nechta gapda ishlatib ko'rsat</p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={13} />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              {msg.parts.map((p, idx) => (
                <span key={idx} className="whitespace-pre-wrap">
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} />
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-slate-400 flex items-center gap-1.5">
              <Loader2 className="animate-spin" size={13} /> javob yozmoqda...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          placeholder="Xabaringizni yozing..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendChatMessage();
          }}
          className="flex-1 min-w-0 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSendChatMessage}
          disabled={chatLoading}
          className="px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
        >
          Yuborish
        </button>
      </div>
    </div>
  );
}
