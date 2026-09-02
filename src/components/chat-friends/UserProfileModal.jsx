'use client';
import { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Video, Mic, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useApp } from '@/context/AppContext';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';

function GalleryImageBubble({ media, token }) {
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-36 h-28 bg-bg rounded-lg animate-pulse" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Rasm" className="max-w-[180px] max-h-[200px] rounded-lg object-cover" />;
}

function GalleryVideoBubble({ media, token }) {
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-48 h-32 bg-bg rounded-lg animate-pulse" />;
  return <video src={url} controls className="max-w-[200px] max-h-[220px] rounded-lg" />;
}

function GalleryVoiceBubble({ media, token }) {
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-44 h-9 bg-bg rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-52 h-9" />;
}

const GALLERY_BUBBLE = { image: GalleryImageBubble, video: GalleryVideoBubble, voice: GalleryVoiceBubble };

// Suhbat ichidagi bitta media turini (rasm/video/ovozli) alohida, eng yangisi
// tepada ko'rsatadi — admin panelning ConversationViewer.jsx'dagi galereyasi bilan
// bir xil naqsh, lekin oddiy foydalanuvchi endpointidan (/api/chat/conversations/[id]/
// messages?type=...&order=desc) — faqat ikkala ishtirokchi ham ko'rgan (o'chirilmagan) xabarlar.
function MediaGallery({ conversationId, type, token }) {
  const [data, setData] = useState(null); // { messages, cursor }
  const [loadingMore, setLoadingMore] = useState(false);
  const Bubble = GALLERY_BUBBLE[type];

  useEffect(() => {
    let cancelled = false;
    setData(null);
    fetch(`/api/chat/conversations/${conversationId}/messages?type=${type}&order=desc`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => !cancelled && setData({ messages: d.messages || [], cursor: d.nextCursor || null }));
    return () => {
      cancelled = true;
    };
  }, [conversationId, type, token]);

  const loadMore = async () => {
    if (!data?.cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?type=${type}&order=desc&before=${encodeURIComponent(data.cursor)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await res.json();
      setData((prev) => ({ messages: [...(prev?.messages || []), ...(d.messages || [])], cursor: d.nextCursor || null }));
    } finally {
      setLoadingMore(false);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-muted" size={20} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {data.messages.map((m) => (
          <div key={m.id || m._id} className="w-fit rounded-xl border border-border bg-bg p-2 flex flex-col gap-1">
            <Bubble media={m.media} token={token} />
            <p className="text-[10px] text-muted">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
          </div>
        ))}
      </div>
      {data.messages.length === 0 && <p className="text-center text-xs text-muted py-8">Bu yerda hali hech narsa yo'q</p>}
      {data.cursor && (
        <div className="flex justify-center pt-3">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-3 py-1.5 bg-bg border border-border rounded-lg text-[11px] font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
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
  const { token } = useApp();
  const [tab, setTab] = useState('image');
  const [nicknameInput, setNicknameInput] = useState('');
  const [saving, setSaving] = useState(false);

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
      <div className="bg-surface rounded-2xl shadow-card border border-border w-full max-w-sm max-h-[85vh] flex flex-col">
        <div className="flex items-center gap-3 p-5 pb-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(activeConversation.otherUser?.username || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-primary truncate">@{activeConversation.otherUser?.username}</p>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-primary transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex items-center gap-2 px-5 pb-3.5 flex-shrink-0">
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Taxallus qo'ying (faqat sizga ko'rinadi)..."
            maxLength={60}
            className="flex-1 min-w-0 px-3 py-2 bg-bg rounded-xl text-sm outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Saqlash'}
          </button>
        </form>

        <div className="flex items-center gap-1.5 px-5 pb-3 flex-shrink-0">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                tab === key ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-primary'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <MediaGallery conversationId={activeConversation.id} type={tab} token={token} />
        </div>
      </div>
    </div>
  );
}
