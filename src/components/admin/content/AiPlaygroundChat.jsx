'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, Loader2, RotateCcw, Send, Sparkles, User } from 'lucide-react';

// TZ-vocably-v2.md §11.5 — "AI sozlamalari" ekranining chat ko'rinishidagi
// sinov qatlami. Admin bir taskKey (masalan `reading.parse`) ni tanlaydi,
// o'sha bosqichga hozir tayinlangan model bilan erkin suhbat orqali sinaydi —
// `/api/admin/ai/playground` haqiqiy `aiRouter.callTask`ni chaqiradi, mock
// emas. Suhbat faqat shu komponent state'ida yashaydi (DB'ga saqlanmaydi) —
// bu ataylab shunday: bu sinov maydonchasi, kontent manbai emas.
export default function AiPlaygroundChat({ token, taskKeys }) {
  const [taskKey, setTaskKey] = useState(taskKeys[0] || '');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [messages, setMessages] = useState([]); // [{role:'user'|'assistant'|'error', content}]
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastMeta, setLastMeta] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setLastMeta(null);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !taskKey) return;
    const history = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/admin/ai/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskKey,
          systemPrompt: systemPrompt.trim() || undefined,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error || "AI javob bermadi" }]);
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setLastMeta({ model: data.model, tokensIn: data.tokensIn, tokensOut: data.tokensOut, costUsd: data.costUsd });
    } catch {
      setMessages((prev) => [...prev, { role: 'error', content: "Tarmoq bilan bog'lanishda xato yuz berdi." }]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden" style={{ height: '70vh', minHeight: 480 }}>
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
        <Sparkles size={16} className="text-accent flex-shrink-0" />
        <select
          value={taskKey}
          onChange={(e) => {
            setTaskKey(e.target.value);
            resetChat();
          }}
          className="px-2.5 py-1.5 bg-bg rounded-lg text-xs font-mono font-semibold text-ink outline-none focus:ring-2 ring-accent/40"
        >
          {taskKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-muted">Hozirgi taskKey uchun tayinlangan modelni real chaqiruv bilan sinaydi.</span>
        <button
          type="button"
          onClick={resetChat}
          title="Suhbatni tozalash"
          className="ml-auto p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors flex-shrink-0"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => setShowSystemPrompt((v) => !v)}
          className="w-full px-4 py-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-ink transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform ${showSystemPrompt ? 'rotate-180' : ''}`} />
          Tizim prompti (ixtiyoriy)
        </button>
        {showSystemPrompt && (
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder={`Bo'sh qoldirilsa, standart sinov prompti ishlatiladi. Masalan real "${taskKey}" prompt matnini shu yerga joylashtirib, model qanday javob berishini sinab ko'rishingiz mumkin.`}
            rows={3}
            className="w-full px-4 pb-3 bg-transparent text-xs text-ink outline-none resize-none placeholder:text-muted/60"
          />
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted gap-2 py-10">
            <Bot size={28} className="text-accent/60" />
            <p className="text-sm">Xabar yozib, "{taskKey}" uchun tayinlangan modelni sinab ko'ring.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-on-accent" />
            </div>
            <div className="bg-bg border border-border rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" /> Javob yozmoqda...
            </div>
          </div>
        )}
      </div>

      {lastMeta && (
        <div className="px-4 py-1.5 border-t border-border text-[10px] text-muted flex items-center gap-3 font-mono">
          <span>{lastMeta.model}</span>
          <span>{lastMeta.tokensIn}→{lastMeta.tokensOut} token</span>
          <span>${lastMeta.costUsd?.toFixed(5)}</span>
        </div>
      )}

      <div className="p-3 border-t border-border flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
          rows={1}
          className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-ink outline-none focus:border-accent transition-colors resize-none max-h-32"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim() || !taskKey}
          className="p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-xl transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  if (message.role === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-7 h-7 rounded-xl bg-danger/15 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-danger" />
        </div>
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-2xl rounded-bl-none px-4 py-2.5">{message.content}</div>
      </div>
    );
  }
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-bg border border-border' : 'bg-accent'}`}>
        {isUser ? <User size={14} className="text-muted" /> : <Bot size={14} className="text-on-accent" />}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap rounded-2xl ${
          isUser ? 'bg-accent text-on-accent rounded-br-none' : 'bg-bg border border-border text-ink rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
