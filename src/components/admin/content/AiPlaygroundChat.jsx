'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, Check, ChevronDown, Loader2, RotateCcw, Send, Settings2, User } from 'lucide-react';
import { TASK_KEY_LABEL } from './AiSettingsPanel';

// TZ-vocably-v2.md §11.5 — "AI sozlamalari" ekranining chat ko'rinishidagi
// sinov qatlami. Ataylab ODDIY AI CHATGA O'XSHAYDI (foydalanuvchi talabi):
// suhbatni boshlashdan oldin admin HECH QANDAY TEXNIK KALITNI ko'rmaydi —
// AI-02 (audit) buni "book.segment taskKey'li sinov chat default ekran"
// deb tanqid qildi. Shuning uchun taskKey boshida TANLANMAGAN: default
// holat — "Qaysi vazifani sinab ko'rmoqchisiz?" so'rovi bilan
// TASK_KEY_LABEL'dan olingan inson o'qiy oladigan variantlar ro'yxati
// (AiSettingsPanel.jsx bilan bir xil map, bu yerda takrorlanmagan). Vazifa
// tanlangandan keyingina haqiqiy sinov chati ochiladi — o'sha chat/sinov
// funksionalligining o'zi o'zgarmagan, faqat boshlang'ich ekran o'zgardi.
// Chatning o'zidagi kichik "model" almashtirgich (taskKey'ni chat ichida
// almashtirish) ilgarigidek qoladi — bu ixtiyoriy, ilg'or foydalanish
// uchun, majburiy emas. `/api/admin/ai/playground` haqiqiy
// `aiRouter.callTask`ni chaqiradi, mock emas. Suhbat faqat shu komponent
// state'ida yashaydi (DB'ga saqlanmaydi) — bu ataylab shunday: bu sinov
// maydonchasi, kontent manbai emas.
export default function AiPlaygroundChat({ taskKeys }) {
  const [taskKey, setTaskKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]); // [{role:'user'|'assistant'|'error', content}]
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastMeta, setLastMeta] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!modelMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setModelMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modelMenuOpen]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setLastMeta(null);
  }, []);

  const autosizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !taskKey) return;
    const history = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    requestAnimationFrame(autosizeTextarea);
    setSending(true);
    try {
      const res = await fetch('/api/admin/ai/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskKey,
          systemPrompt: systemPrompt.trim() || undefined,
          // Xato pufakchalari modelga "user" xabari sifatida yuborilmasin.
          messages: history.filter((m) => m.role !== 'error').map((m) => ({ role: m.role, content: m.content })),
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

  // AI-02 — default ekran: texnik taskKey ro'yxati emas, oddiy savol +
  // inson o'qiy oladigan variantlar. Vazifa tanlanmaguncha chat ochilmaydi.
  if (!taskKey) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface shadow-card overflow-hidden px-4 py-8 text-center gap-4"
        style={{ height: 'calc(100dvh - 210px)', minHeight: 400, maxHeight: 760 }}
      >
        <div className="w-11 h-11 rounded-2xl bg-accent-soft flex items-center justify-center">
          <Bot size={22} className="text-accent" />
        </div>
        <div>
          <p className="text-base font-semibold text-ink">Qaysi vazifani sinab ko'rmoqchisiz?</p>
          <p className="text-sm text-muted mt-1">Vazifani tanlang, keyin u bilan chat sifatida suhbatlashib sinaysiz.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
          {taskKeys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTaskKey(k)}
              className="text-left px-3.5 py-2.5 rounded-xl border border-border hover:border-accent/50 hover:bg-accent-soft transition-colors"
            >
              <p className="text-sm font-semibold text-ink">{TASK_KEY_LABEL[k] || k}</p>
              <p className="text-[11px] text-muted font-mono mt-0.5 break-all">{k}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden relative"
      style={{ height: 'calc(100dvh - 210px)', minHeight: 400, maxHeight: 760 }}
    >
      {/* Ixcham tepalik — ChatGPT uslubidagi kichik model-switcher, majburiy forma emas. */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center gap-2 relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setModelMenuOpen((v) => !v)}
          aria-expanded={modelMenuOpen}
          title={taskKey}
          className="min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 min-h-11 md:min-h-0 rounded-lg text-xs font-semibold text-ink bg-bg hover:bg-accent-soft transition-colors"
        >
          <Bot size={13} className="text-accent flex-shrink-0" />
          <span className="truncate">{TASK_KEY_LABEL[taskKey] || taskKey}</span>
          <ChevronDown size={12} className={`text-muted transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setTaskKey('')}
          title="Vazifani almashtirish (boshlang'ich ekranga qaytish)"
          aria-label="Vazifani almashtirish (boshlang'ich ekranga qaytish)"
          className="ml-auto p-1.5 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          onClick={resetChat}
          title="Suhbatni tozalash"
          aria-label="Suhbatni tozalash"
          className="p-1.5 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors flex-shrink-0"
        >
          <RotateCcw size={14} />
        </button>

        {modelMenuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setModelMenuOpen(false)} />
            <div className="absolute left-3 sm:left-4 top-full mt-1 z-30 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-card py-1.5 max-h-80 overflow-y-auto">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Sinov uchun vazifa</p>
              {taskKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setTaskKey(k);
                    setModelMenuOpen(false);
                    resetChat();
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-ink hover:bg-accent-soft transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold truncate">{TASK_KEY_LABEL[k] || k}</span>
                    <span className="block text-[10px] font-mono text-muted truncate">{k}</span>
                  </span>
                  {k === taskKey && <Check size={13} className="text-accent flex-shrink-0" />}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-2 px-3">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted mb-1">
                  <Settings2 size={11} /> Tizim prompti (ixtiyoriy)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Bo'sh qoldirilsa, standart sinov prompti ishlatiladi."
                  rows={3}
                  aria-label="Tizim prompti (ixtiyoriy)"
                  className="w-full px-2 py-1.5 bg-bg border border-border rounded-lg text-base md:text-xs text-ink outline-none focus:border-accent resize-none placeholder:text-muted/60 mb-1.5"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted gap-2 py-10">
            <Bot size={28} className="text-accent/60" />
            <p className="text-sm">Xabar yozib boshlang — model avtomatik tanlangan.</p>
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
        <div className="px-3 sm:px-4 py-1.5 border-t border-border text-[11px] text-muted flex items-center gap-3 font-mono flex-shrink-0 overflow-x-auto">
          <span className="whitespace-nowrap">{lastMeta.model}</span>
          <span className="whitespace-nowrap">{lastMeta.tokensIn}→{lastMeta.tokensOut} token</span>
          <span className="whitespace-nowrap">${lastMeta.costUsd?.toFixed(5)}</span>
        </div>
      )}

      <div className="p-2.5 sm:p-3 border-t border-border flex items-end gap-2 flex-shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autosizeTextarea();
          }}
          onKeyDown={onKeyDown}
          placeholder="Xabar yozing..."
          aria-label="Xabar"
          rows={1}
          className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-[16px] sm:text-sm text-ink outline-none focus:border-accent transition-colors resize-none max-h-40"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim() || !taskKey}
          aria-label="Yuborish"
          className="min-w-11 min-h-11 flex items-center justify-center p-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-xl transition-colors flex-shrink-0"
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
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-2xl rounded-bl-none px-4 py-2.5 max-w-[85%] sm:max-w-[80%]">{message.content}</div>
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
        className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap break-words rounded-2xl ${
          isUser ? 'bg-accent text-on-accent rounded-br-none' : 'bg-bg border border-border text-ink rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
