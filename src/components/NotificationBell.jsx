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
export default function NotificationBell({ token, onOpenFriends }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [pushState, setPushState] = useState('unsupported');
  const [subscribing, setSubscribing] = useState(false);
  const rootRef = useRef(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications?limit=15', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setItems(data.notifications || []);
        if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
      }
    } catch {
      // jimgina — belgi eski holatda qoladi
    }
  }, [token]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
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
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // O'qilgan bildirishnoma bazadan o'chiriladi (route.js), shuning uchun ro'yxatdan
  // ham darhol olib tashlanadi — eski o'qilganlar osilib qolmasin, faqat yangilari qolsin.
  const markRead = async (id) => {
    const wasUnread = items.find((n) => n._id === id)?.read === false;
    setItems((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnreadCount((n) => Math.max(0, n - 1));
    fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  };

  const markAllRead = async () => {
    setItems([]);
    setUnreadCount(0);
    fetch('/api/notifications/read-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(
      () => {}
    );
  };

  const handleClickItem = (n) => {
    if (!n.read) markRead(n._id);
    if (n.type === 'chat_message') {
      setOpen(false);
      onOpenFriends?.();
    }
  };

  const enablePush = async () => {
    setSubscribing(true);
    const result = await subscribeToPush(token);
    setSubscribing(false);
    setPushState(result.success ? 'granted' : (await getPushPermissionState()));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-muted hover:text-accent hover:bg-surface rounded-lg transition-colors"
        title="Bildirishnomalar"
        aria-label="Bildirishnomalar"
      >
        {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-80 max-w-[90vw] bg-surface border border-border rounded-xl shadow-premium overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
            <p className="text-sm font-bold text-ink">Bildirishnomalar</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-semibold text-accent hover:text-accent-hover">
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
            {items.length === 0 && <p className="text-center text-xs text-muted py-8">Hozircha bildirishnoma yo'q</p>}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClickItem(n)}
                className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left border-b border-border last:border-b-0 transition-colors ${
                  n.read ? 'hover:bg-bg' : 'bg-accent-soft/50 hover:bg-accent-soft'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.type === 'chat_message' ? <MessageCircle size={13} /> : <Megaphone size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs truncate ${n.read ? 'text-ink/80' : 'text-ink font-semibold'}`}>
                    {n.title}
                  </p>
                  {n.body && <p className="text-[11px] text-muted truncate mt-0.5">{n.body}</p>}
                </div>
                <span className="text-[10px] text-muted/70 flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
