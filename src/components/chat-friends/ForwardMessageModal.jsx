'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBackClose } from '@/lib/useBackClose';
import { Check, Loader2, Search, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import Avatar from '@/components/avatar/Avatar';
import Switch from '@/components/ui/Switch';
import { useT } from '@/context/LocaleContext';
import { FORWARD_MAX_TARGETS } from '@/lib/chat/forward';

const chatLabel = (c, t) => c?.otherUser?.nickname || `@${c?.otherUser?.username || t('ch.unknown')}`;

// "Forward" (Telegram parity, PARITY_PLAN WP5): bir yoki bir nechta xabarni 10 tagacha chatga.
// Qatorlar — belgilash katakchalari (tanlanganlar yuqorida "chip" bo'lib turadi), ixtiyoriy izoh va
// "yuboruvchi nomini yashirish". Bitta chat tanlansa — yuborilgach o'sha chatga o'tiladi (Telegram);
// bir nechta bo'lsa joriy chatda qolinadi. Qisman xato bo'lsa oyna ochiq qoladi, xato qatorlar belgilanadi.
export default function ForwardMessageModal({ open, message, messages, onClose, onSent }) {
  const { conversations, forwardMessages, activeConversation, showChatNotice } = useChat();
  const { chatUserId: myId } = useApp();
  const { t, ts } = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]); // conversation id'lari, tanlash tartibida
  const [hideAuthor, setHideAuthor] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [failures, setFailures] = useState({}); // { [conversationId]: error }
  const [notice, setNotice] = useState('');
  const titleId = useId();
  const closeRef = useRef(null);
  const list = useMemo(() => (messages || (message ? [message] : [])).filter((m) => m && m.type !== 'call'), [messages, message]);

  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setQuery('');
      setSelected([]);
      setHideAuthor(false);
      setComment('');
      setSending(false);
      setFailures({});
      setNotice('');
    }
  }

  useEffect(() => {
    if (!open) return undefined;
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

  const byId = useMemo(() => new Map(conversations.map((c) => [String(c.id), c])), [conversations]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations.filter((c) => !c.archived);
    return conversations.filter((c) => `${c.otherUser?.nickname || ''} ${c.otherUser?.username || ''} ${c.otherUser?.name || ''}`.toLowerCase().includes(q));
  }, [conversations, query]);
  // "Nomini yashirish" faqat boshqa muallif bo'lsa ma'noli (o'z xabarimda forward'siz yorliq baribir yo'q).
  const canHideAuthor = list.some((m) => m.forwardedFrom || String(m.senderId) !== String(myId));

  useBackClose(open, onClose);
  if (!open) return null;

  const toggle = (id) => {
    if (sending) return;
    setFailures((f) => {
      if (!f[id]) return f;
      const next = { ...f };
      delete next[id];
      return next;
    });
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= FORWARD_MAX_TARGETS ? prev : [...prev, id]));
  };

  const handleSend = async () => {
    if (sending || !selected.length || !list.length) return;
    setSending(true);
    setNotice('');
    const res = await forwardMessages(list, selected, { hideAuthor: canHideAuthor && hideAuthor, comment });
    setSending(false);
    if (res.error) {
      setNotice(ts(res.error));
      return;
    }
    const skippedCalls = (res.skipped || []).some((s) => s.reason === 'call');
    if (res.failed.length) {
      // Qisman: yuborilganlar tanlovdan chiqadi, xato qatorlar qoladi (qayta urinish mumkin).
      setFailures(Object.fromEntries(res.failed.map((f) => [String(f.conversationId), ts(f.error || 'Yuborilmadi')])));
      setSelected(res.failed.map((f) => String(f.conversationId)));
      const names = res.failed.map((f) => chatLabel(byId.get(String(f.conversationId)), t)).join(', ');
      setNotice(res.okCount ? `${t('ch.forwardPartial', { ok: res.okCount, total: res.total })}. ${names}` : `${ts(res.failed[0].error || 'Yuborilmadi')}: ${names}`);
      return;
    }
    const done = t('ch.forwardDone', { n: res.okCount });
    showChatNotice?.(skippedCalls ? `${done}. ${t('ch.forwardSkippedCalls')}` : done);
    onSent?.(res);
    onClose?.();
    if (selected.length === 1 && String(selected[0]) !== String(activeConversation?.id)) {
      const username = byId.get(String(selected[0]))?.otherUser?.username;
      if (username) router.push(`/app/friends/${username}`);
    }
  };

  const atLimit = selected.length >= FORWARD_MAX_TARGETS;

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose?.()} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="bg-surface rounded-2xl shadow-card border border-border w-full max-w-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden" data-testid="forward-modal">
        <div className="flex items-center gap-3 p-5 pb-3 flex-shrink-0">
          <h3 id={titleId} className="flex-1 font-bold text-ink font-display">
            {list.length > 1 ? t('ch.forwardN', { n: list.length }) : t('ch.forward')}
          </h3>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t('ch.close')} className="inline-flex items-center justify-center w-11 h-11 -m-2.5 md:w-auto md:h-auto md:m-0 md:p-1 rounded-lg text-muted hover:text-ink transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-3 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-xl">
            <Search size={14} className="text-muted flex-shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('ch.findChat')} aria-label={t('ch.findChatAria')} data-testid="forward-search" className="flex-1 min-w-0 bg-transparent text-base md:text-sm text-ink placeholder:text-muted outline-none" />
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5" data-testid="forward-chips">
              {selected.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`${t('ch.tray.remove')}: ${chatLabel(byId.get(id), t)}`}
                  data-testid="forward-chip"
                  className={`inline-flex items-center gap-1 max-w-[10rem] min-h-8 pl-2.5 pr-1.5 rounded-full text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${failures[id] ? 'bg-danger/10 text-danger' : 'bg-accent-soft text-ink'}`}
                >
                  <span className="truncate">{chatLabel(byId.get(id), t)}</span>
                  <X size={12} className="flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {atLimit && (
            <p className="text-xs text-muted" data-testid="forward-limit">
              {t('ch.forwardLimit')}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2" role="group" aria-label={t('ch.forward')}>
          {filtered.length === 0 && <p className="text-center text-xs text-muted px-4 py-6">{t('ch.chatNotFound')}</p>}
          {filtered.map((c) => {
            const id = String(c.id);
            const checked = selected.includes(id);
            const disabled = sending || (!checked && atLimit);
            return (
              <button
                key={id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-disabled={disabled || undefined}
                onClick={() => !disabled && toggle(id)}
                title={!checked && atLimit ? t('ch.forwardLimit') : undefined}
                data-testid="forward-target"
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 min-h-11 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${checked ? 'bg-accent-soft/60' : 'hover:bg-bg'} ${disabled && !checked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Avatar userId={c.otherUser?.id} photoId={c.otherUser?.photoId} name={c.otherUser?.nickname || c.otherUser?.name} username={c.otherUser?.username} size={36} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-ink truncate">{chatLabel(c, t)}</span>
                  {failures[id] && <span className="block text-xs text-danger truncate">{failures[id]}</span>}
                </span>
                <span className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-shrink-0 ${checked ? 'bg-accent border-accent text-on-accent' : 'border-border'}`} aria-hidden="true">
                  {checked && <Check size={12} />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border px-5 pt-3 pb-4 flex-shrink-0 space-y-2.5">
          {selected.length > 0 && (
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 4000))}
              placeholder={t('ch.forwardComment')}
              aria-label={t('ch.forwardComment')}
              data-testid="forward-comment"
              className="w-full px-3 py-2 bg-bg rounded-xl text-base md:text-sm text-ink placeholder:text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          )}
          {canHideAuthor && <Switch checked={hideAuthor} onChange={setHideAuthor} label={t('ch.forwardHideAuthor')} data-testid="forward-hide-author" disabled={sending} />}
          {notice && (
            <p className="text-xs text-danger" role="alert" data-testid="forward-error">
              {notice}
            </p>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={!selected.length || sending || !list.length}
            data-testid="forward-send"
            className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-accent text-on-accent text-sm font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {sending && <Loader2 size={15} className="motion-safe:animate-spin" />}
            {t('ch.forwardSend', { n: selected.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
