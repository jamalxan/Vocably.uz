'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, BellRing, MessageCircle, Megaphone, Loader2 } from 'lucide-react';
import { pushSupported, getPushPermissionState, isPushSubscribed, subscribeToPush } from '@/lib/pushClient';

const POLL_MS = 25_000;

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozir';
  if (mins < 60) return `${mins} daq`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat`;
  return `${Math.floor(hours / 24)} kun`;
}

// Sidebar'dan mustaqil, dashboard header'ida (barcha view'larda ko'rinadigan yagona
// joy) — yangi chat xabari va admin e'lonlari haqida qo'ng'iroq belgisi + ro'yxat.
// Real brauzer push (Web Push API) alohida, foydalanuvchi aniq yoqqandagina yoqiladi.
// AUTH_MIGRATION_MAP.md — `token` prop olib tashlandi, endi httpOnly cookie
// orqali autentifikatsiya qilinadi (bu komponent faqat AppShell ichida,
// autentifikatsiyadan o'tgan foydalanuvchi uchun render qilinadi).
export default function NotificationBell({ onOpenFriends }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [pushState, setPushState] = useState('unsupported');
  const [subscribing, setSubscribing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  // Ro'yxat ochiq paytda so'rov natijasi elementlarni almashtirmaydi — o'qilayotgan
  // e'lon ko'z oldida yo'qolib qolmasin (faqat hisoblagich yangilanadi).
  const openRef = useRef(false);
  openRef.current = open;

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=15');
      const data = await res.json();
      if (res.ok) {
        if (!openRef.current) setItems(data.notifications || []);
        if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
      }
    } catch {
      // jimgina — belgi eski holatda qoladi
    } finally {
      setLoaded(true);
    }
  }, []);

  // BUG-031 — sahifa ko'rinmasa (boshqa tab/oyna) so'rov yubormaymiz, qaytib
  // ko'ringanda darhol yangilaymiz (fon intervali kutilmaydi).
  useEffect(() => {
    load();
    let t = null;
    const startPolling = () => {
      if (t) return;
      t = setInterval(load, POLL_MS);
    };
    const stopPolling = () => {
      if (!t) return;
      clearInterval(t);
      t = null;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        load();
        startPolling();
      }
    };
    if (!document.hidden) startPolling();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  useEffect(() => {
    if (!pushSupported()) return;
    getPushPermissionState().then(async (state) => {
      if (state === 'granted' && !(await isPushSubscribed())) {
        setPushState('default'); // ruxsat bor lekin hali obuna bo'lmagan (masalan boshqa qurilma)
      } else {
        setPushState(state);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Yopilganda o'qilganlar ro'yxatdan olib tashlanadi (bazadan o'chirilgan) va
  // ochiq paytda o'tkazib yuborilgan yangilanish olinadi.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      setItems((prev) => prev.filter((n) => !n.read));
      setExpandedId(null);
      load();
    }
    wasOpenRef.current = open;
  }, [open, load]);

  // O'qilgan bildirishnoma bazadan o'chiriladi (route.js). Ro'yxatdan esa popover
  // yopilgandagina olib tashlanadi — uzun e'lonni oxirigacha o'qish mumkin bo'lsin.
  const markRead = async (id) => {
    const wasUnread = items.find((n) => n._id === id)?.read === false;
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    if (wasUnread) setUnreadCount((n) => Math.max(0, n - 1));
    fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {});
  };

  const markAllRead = async () => {
    setItems([]);
    setUnreadCount(0);
    fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
  };

  const handleClickItem = (n) => {
    if (!n.read) markRead(n._id);
    if (n.type === 'chat_message') {
      setOpen(false);
      onOpenFriends?.();
    } else {
      setExpandedId((cur) => (cur === n._id ? null : n._id));
    }
  };

  const enablePush = async () => {
    setSubscribing(true);
    try {
      const result = await subscribeToPush();
      setPushState(result?.success ? 'granted' : await getPushPermissionState());
    } catch {
      setPushState(await getPushPermissionState().catch(() => 'default'));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-11 h-11 md:w-10 md:h-10 inline-flex items-center justify-center text-muted hover:text-accent hover:bg-surface rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        title="Bildirishnomalar"
        aria-label={unreadCount > 0 ? `Bildirishnomalar (${unreadCount} ta yangi)` : 'Bildirishnomalar'}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {unreadCount > 0 ? <BellRing size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Bildirishnomalar"
          className="absolute right-0 top-full mt-2 z-40 w-80 max-w-[90vw] max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain bg-surface border border-border rounded-xl shadow-premium"
        >
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border">
            <p className="text-sm font-bold text-ink">Bildirishnomalar</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="px-2 py-2 -my-2 -mr-2 rounded-lg text-xs font-semibold text-accent hover:text-accent-hover hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Hammasini o'qilgan qilish
              </button>
            )}
          </div>

          {pushState !== 'unsupported' && pushState !== 'granted' && (
            <button
              onClick={enablePush}
              disabled={subscribing}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 border-b border-border text-xs text-accent hover:bg-accent-soft transition-colors disabled:opacity-50"
            >
              {subscribing ? <Loader2 size={13} className="animate-spin" /> : <BellRing size={13} />}
              {pushState === 'denied'
                ? "Brauzer bildirishnomalari bloklangan (brauzer sozlamalaridan yoqing)"
                : 'Brauzer bildirishnomalarini yoqish'}
            </button>
          )}

          <div className="max-h-80 overflow-y-auto">
            {!loaded && items.length === 0 && (
              <div className="flex justify-center py-8" role="status">
                <Loader2 size={18} className="animate-spin text-muted" aria-hidden="true" />
                <span className="sr-only">Yuklanmoqda…</span>
              </div>
            )}
            {loaded && items.length === 0 && <p className="text-center text-xs text-muted py-8">Hozircha bildirishnoma yo'q</p>}
            {items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleClickItem(n)}
                aria-expanded={n.type !== 'chat_message' && n.body ? expandedId === n._id : undefined}
                className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left border-b border-border last:border-b-0 transition-colors ${
                  n.read ? 'hover:bg-bg' : 'bg-accent-soft/50 hover:bg-accent-soft'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.type === 'chat_message' ? <MessageCircle size={13} /> : <Megaphone size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs break-words ${n.read ? 'text-ink/80' : 'text-ink font-semibold'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p
                      className={`text-[11px] text-muted mt-0.5 break-words whitespace-pre-line ${expandedId === n._id ? '' : 'line-clamp-3'}`}
                      title={n.body}
                    >
                      {n.body}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-ink-subtle flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
