'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { X, Image as ImageIcon, Video, Mic, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { ImageLightbox } from './MessageBubble';

// C-09 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 E) — 80x80 grid
// thumbnail, useAuthedMediaUrl orqali (MessageBubble.jsx'dagi ImageBubble bilan
// AYNAN bir xil signed-URL naqshi — src/lib/useAuthedMedia.js). Bosilganda
// MessageBubble'dagi lightbox (import qilib qayta ishlatiladi — alohida oyna
// qurish shart emas).
function GalleryImageThumb({ media }) {
  const { url, error } = useAuthedMediaUrl(media.key);
  const [open, setOpen] = useState(false);
  if (error) return <div className="w-20 h-20 rounded-lg bg-bg flex items-center justify-center text-[10px] text-muted">Xato</div>;
  if (!url) return <div className="w-20 h-20 bg-bg rounded-lg animate-pulse" />;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rasmni kattalashtirish"
        className="block w-20 h-20 rounded-lg overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Rasm" className="w-full h-full object-cover" />
      </button>
      {open && <ImageLightbox url={url} onClose={() => setOpen(false)} />}
    </>
  );
}

function GalleryVideoBubble({ media }) {
  const { url } = useAuthedMediaUrl(media.key);
  if (!url) return <div className="w-48 h-32 bg-bg rounded-lg animate-pulse" />;
  return <video src={url} controls playsInline preload="metadata" className="max-w-[min(200px,100%)] max-h-[220px] rounded-lg" />;
}

function GalleryVoiceBubble({ media }) {
  const { url } = useAuthedMediaUrl(media.key);
  if (!url) return <div className="w-44 h-9 bg-bg rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-52 max-w-full h-9" />;
}

const GALLERY_BUBBLE = { image: GalleryImageThumb, video: GalleryVideoBubble, voice: GalleryVoiceBubble };

// Suhbat ichidagi bitta media turini (rasm/video/ovozli) alohida, eng yangisi
// tepada ko'rsatadi — admin panelning ConversationViewer.jsx'dagi galereyasi bilan
// bir xil naqsh, lekin oddiy foydalanuvchi endpointidan (/api/chat/conversations/[id]/
// messages?type=...&order=desc) — faqat ikkala ishtirokchi ham ko'rgan (o'chirilmagan) xabarlar.
function MediaGallery({ conversationId, type }) {
  const [data, setData] = useState(null); // { messages, cursor }
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const Bubble = GALLERY_BUBBLE[type];

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    fetch(`/api/chat/conversations/${conversationId}/messages?type=${type}&order=desc`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => !cancelled && setData({ messages: d.messages || [], cursor: d.nextCursor || null }))
      // Tarmoq/server xatosi — cheksiz spinner yoki "bo'sh" emas, xato + qayta urinish.
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [conversationId, type, reloadKey]);

  const loadMore = async () => {
    if (!data?.cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?type=${type}&order=desc&before=${encodeURIComponent(data.cursor)}`
      );
      if (!res.ok) return;
      const d = await res.json();
      setData((prev) => ({ messages: [...(prev?.messages || []), ...(d.messages || [])], cursor: d.nextCursor || null }));
    } catch {
      // jimgina — tugma qoladi, qayta bosish mumkin
    } finally {
      setLoadingMore(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-danger font-medium mb-2">Yuklab bo'lmadi.</p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="min-h-11 px-3 text-xs font-semibold text-accent hover:underline"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-muted" size={20} />
      </div>
    );
  }

  // `media` yo'q xabar (masalan hammadan o'chirilgan) server tarafda allaqachon
  // chiqarib tashlanadi (order=desc so'rovida), lekin kesh/eski javoblarga qarshi
  // himoya sifatida bu yerda ham qoldiriladi — aks holda Bubble komponenti
  // `media.key`ni null'dan o'qishga urinib butun sahifani qulatadi.
  const visibleMessages = data.messages.filter((m) => m.media);
  // C-09 — rasmlar uchun zich thumbnail GRID (sana matni o'rniga haqiqiy
  // preview, TZ ko'rsatmasidagi 80x80/object-cover), video/ovozli xabarlar
  // ilgarigidek — ular allaqachon o'zining nazorat elementiga (play/seek) ega,
  // kichraytirilgan grid'ga tiqishtirish shart emas.
  if (type === 'image') {
    return (
      <div>
        <div className="grid grid-cols-3 gap-1.5">
          {visibleMessages.map((m) => (
            <GalleryImageThumb key={m.id || m._id} media={m.media} />
          ))}
        </div>
        {visibleMessages.length === 0 && <p className="text-center text-xs text-muted py-8">Bu yerda hali hech narsa yo'q</p>}
        {data.cursor && (
          <div className="flex justify-center pt-3">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="min-h-11 md:min-h-0 px-3 py-1.5 bg-bg border border-border rounded-lg text-[11px] font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {loadingMore && <Loader2 size={12} className="animate-spin" />} Eskisini yuklash
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {visibleMessages.map((m) => (
          <div key={m.id || m._id} className="w-fit max-w-full rounded-xl border border-border bg-bg p-2 flex flex-col gap-1">
            <Bubble media={m.media} />
            <p className="text-[11px] text-muted">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
          </div>
        ))}
      </div>
      {visibleMessages.length === 0 && <p className="text-center text-xs text-muted py-8">Bu yerda hali hech narsa yo'q</p>}
      {data.cursor && (
        <div className="flex justify-center pt-3">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="min-h-11 md:min-h-0 px-3 py-1.5 bg-bg border border-border rounded-lg text-[11px] font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {loadingMore && <Loader2 size={12} className="animate-spin" />} Eskisini yuklash
          </button>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'image', label: 'Rasmlar', Icon: ImageIcon },
  { key: 'video', label: 'Videolar', Icon: Video },
  { key: 'voice', label: 'Ovozli xabarlar', Icon: Mic },
];

// Suhbat sarlavhasidagi username'ga bosilganda ochiladigan oyna (ConversationView.jsx) —
// (1) shu foydalanuvchiga faqat o'zimga ko'rinadigan taxallus qo'yish, (2) suhbatdagi
// rasm/video/ovozli xabarlarni har birini alohida ko'rish.
export default function UserProfileModal({ open, onClose }) {
  const { activeConversation, setNickname } = useChat();
  const [tab, setTab] = useState('image');
  const [nicknameInput, setNicknameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const titleId = useId();
  const closeRef = useRef(null);

  // Ochilganda fokus oyna ichiga o'tadi, yopilganda avvalgi elementga qaytadi.
  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTab('image');
    setNicknameInput(activeConversation?.otherUser?.nickname || '');
  }, [open, activeConversation?.id, activeConversation?.otherUser?.nickname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !activeConversation) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await setNickname(activeConversation.id, nicknameInput.trim());
    setSaving(false);
    if (res.error) alert(res.error);
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
        className="bg-surface rounded-2xl shadow-card border border-border w-full max-w-sm max-h-[calc(100dvh-2rem)] sm:max-h-[85dvh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 pb-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(activeConversation.otherUser?.username || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p id={titleId} className="text-sm font-bold text-ink truncate">@{activeConversation.otherUser?.username}</p>
          </div>
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

        <form onSubmit={handleSave} className="flex items-center gap-2 px-5 pb-3.5 flex-shrink-0">
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Taxallus qo'ying (faqat sizga ko'rinadi)..."
            maxLength={60}
            aria-label="Taxallus"
            className="flex-1 min-w-0 px-3 py-2.5 md:py-2 bg-bg rounded-xl text-base md:text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 md:min-h-0 px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Saqlash'}
          </button>
        </form>

        {/* flex-wrap — tor (<=360px) ekranda uchinchi tab karta chetidan chiqib ketmasin. */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3 flex-shrink-0">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`min-h-11 md:min-h-0 px-2.5 py-1.5 rounded-lg text-xs md:text-[11px] font-medium transition-colors flex items-center gap-1 ${
                tab === key ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-ink'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <MediaGallery conversationId={activeConversation.id} type={tab} />
        </div>
      </div>
    </div>
  );
}
