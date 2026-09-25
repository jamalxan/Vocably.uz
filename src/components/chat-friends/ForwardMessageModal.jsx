'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Send, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import Avatar from '@/components/avatar/Avatar';

// C-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 C) — "Forward" uchun
// yengil "suhbat tanlash" oynasi: alohida so'rov/endpoint kerak emas —
// ChatContext'da ALLAQACHON yuklangan `conversations` ro'yxatidan foydalanadi
// (TZ ko'rsatmasiga muvofiq).
export default function ForwardMessageModal({ open, message, onClose }) {
  const { conversations, forwardMessage } = useChat();
  const [query, setQuery] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setSendingId(null);
    setDoneId(null);
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.otherUser?.nickname || c.otherUser?.username || '').toLowerCase().includes(q));
  }, [conversations, query]);

  if (!open) return null;

  const handlePick = async (conv) => {
    if (sendingId) return;
    setSendingId(conv.id);
    const res = await forwardMessage(message, conv.id);
    setSendingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      setDoneId(conv.id);
      setTimeout(() => onClose?.(), 500);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface rounded-2xl shadow-card border border-border w-full max-w-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 pb-3 flex-shrink-0">
          <h3 id={titleId} className="flex-1 font-bold text-ink font-display">
            Yuborish
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="inline-flex items-center justify-center w-11 h-11 -m-2.5 md:w-auto md:h-auto md:m-0 md:p-1 rounded-lg text-muted hover:text-ink transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-xl">
            <Search size={14} className="text-muted flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suhbat qidirish..."
              aria-label="Suhbat qidirish"
              className="flex-1 min-w-0 bg-transparent text-base md:text-sm text-ink placeholder:text-muted outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 && <p className="text-center text-xs text-muted px-4 py-6">Suhbat topilmadi</p>}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handlePick(c)}
              disabled={!!sendingId}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left hover:bg-bg transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Avatar
                userId={c.otherUser?.id}
                photoId={c.otherUser?.photoId}
                name={c.otherUser?.nickname || c.otherUser?.name}
                username={c.otherUser?.username}
                size={36}
              />
              <span className="flex-1 min-w-0 text-sm font-medium text-ink truncate">
                {c.otherUser?.nickname || `@${c.otherUser?.username || "noma'lum"}`}
              </span>
              {sendingId === c.id && <Loader2 size={14} className="animate-spin text-muted flex-shrink-0" />}
              {doneId === c.id && <span className="text-xs text-success flex-shrink-0">Yuborildi ✓</span>}
              {sendingId !== c.id && doneId !== c.id && <Send size={13} className="text-muted flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
