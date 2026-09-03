'use client';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, MessageSquareText, Image as ImageIcon, Video, Mic, Paperclip, Flag, Pencil, Trash2, Download, UserX, Tag } from 'lucide-react';
import { useAuthedAdminMediaUrl } from '@/lib/useAuthedMedia';

const TYPE_ICON = { image: ImageIcon, video: Video, voice: Mic, file: Paperclip, text: MessageSquareText };

// Quyidagi 4 ta komponent — oddiy foydalanuvchi tomonidagi MessageBubble.jsx'dagi
// Image/Video/Voice/FileBubble bilan bir xil naqsh, lekin admin endpointi orqali
// (/api/admin/chat/media) — ishtirokchi bo'lmasa ham, hatto xabar/suhbat "o'chirilgan"
// bo'lsa ham fayl ko'rinadi (haqiqiy S3 obyekt hech qachon o'chirilmaydi).
function AdminImageBubble({ media, token }) {
  const { url } = useAuthedAdminMediaUrl(media.key, token);
  if (!url) return <div className="w-40 h-32 bg-primary-soft/40 rounded-lg animate-pulse" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Rasm" className="max-w-[220px] max-h-[240px] rounded-lg object-cover" />;
}

function AdminVideoBubble({ media, token }) {
  const { url } = useAuthedAdminMediaUrl(media.key, token);
  if (!url) return <div className="w-56 h-40 bg-primary-soft/40 rounded-lg animate-pulse" />;
  return <video src={url} controls className="max-w-[240px] max-h-[260px] rounded-lg" />;
}

function AdminVoiceBubble({ media, token }) {
  const { url } = useAuthedAdminMediaUrl(media.key, token);
  if (!url) return <div className="w-48 h-10 bg-primary-soft/40 rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-56 h-10" />;
}

function AdminFileBubble({ media, token }) {
  const { url } = useAuthedAdminMediaUrl(media.key, token);
  return (
    <a
      href={url || '#'}
      download
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-bg/70 rounded-lg text-xs hover:bg-bg transition-colors"
    >
      <Paperclip size={13} />
      <span>Faylni ko&apos;rish</span>
      {media?.size ? <span className="opacity-60">({Math.round(media.size / 1024)}KB)</span> : null}
      <Download size={12} className="ml-auto flex-shrink-0" />
    </a>
  );
}

function AdminMediaContent({ message, token }) {
  if (!message.media) return null;
  if (message.type === 'image') return <AdminImageBubble media={message.media} token={token} />;
  if (message.type === 'video') return <AdminVideoBubble media={message.media} token={token} />;
  if (message.type === 'voice') return <AdminVoiceBubble media={message.media} token={token} />;
  if (message.type === 'file') return <AdminFileBubble media={message.media} token={token} />;
  return null;
}

export default function ConversationViewer({ token }) {
  const [conversations, setConversations] = useState([]);
  const [convCursor, setConvCursor] = useState(null);
  const [loadingMoreConvos, setLoadingMoreConvos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState(null);
  const [msgCursor, setMsgCursor] = useState(null);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
  // Suhbat ichida "Suhbat" (matn + media aralash, eskidan-yangiga) va uchta alohida
  // galereya — Rasmlar/Videolar/Ovozli xabarlar (har biri o'zining {messages, cursor}
  // holatiga ega, faqat birinchi marta ochilganda yuklanadi) o'rtasida almashtiradi —
  // o'chirilgan xabarlarning fayli ham shu yerda ko'rinadi (S3 obyekt o'chmaydi,
  // admin endpointi hech narsani sanitizatsiya qilmaydi).
  const [viewMode, setViewMode] = useState('chat');
  const [galleryData, setGalleryData] = useState({}); // { image: {messages, cursor}, video: {...}, voice: {...} }
  const [loadingMoreGallery, setLoadingMoreGallery] = useState(false);

  useEffect(() => {
    fetch('/api/admin/chat/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations || []);
        setConvCursor(d.nextCursor || null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const loadMoreConversations = async () => {
    if (!convCursor || loadingMoreConvos) return;
    setLoadingMoreConvos(true);
    try {
      const res = await fetch(`/api/admin/chat/conversations?before=${encodeURIComponent(convCursor)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations((prev) => [...prev, ...(data.conversations || [])]);
      setConvCursor(data.nextCursor || null);
    } finally {
      setLoadingMoreConvos(false);
    }
  };

  const openConversation = async (c) => {
    setActive(c);
    setMessages(null);
    setMsgCursor(null);
    setViewMode('chat');
    setGalleryData({});
    const res = await fetch(`/api/admin/chat/conversations/${c.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data.messages || []);
    setMsgCursor(data.nextCursor || null);
  };

  // Har bir galereya (Rasmlar/Videolar/Ovozli xabarlar) birinchi marta ochilganda
  // yuklanadi (keyin qayta bosilsa qayta so'ralmaydi — allaqachon yuklangan bo'lsa
  // shu holat saqlanadi). Natija eng yangisi tepada (order=desc).
  const openGalleryTab = async (type) => {
    setViewMode(type);
    if (galleryData[type] || !active) return;
    const res = await fetch(`/api/admin/chat/conversations/${active.id}/messages?type=${type}&order=desc`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setGalleryData((prev) => ({ ...prev, [type]: { messages: data.messages || [], cursor: data.nextCursor || null } }));
  };

  const loadMoreGallery = async () => {
    const current = galleryData[viewMode];
    if (!current?.cursor || loadingMoreGallery || !active) return;
    setLoadingMoreGallery(true);
    try {
      const res = await fetch(
        `/api/admin/chat/conversations/${active.id}/messages?type=${viewMode}&order=desc&before=${encodeURIComponent(current.cursor)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setGalleryData((prev) => ({
        ...prev,
        [viewMode]: {
          messages: [...(prev[viewMode]?.messages || []), ...(data.messages || [])],
          cursor: data.nextCursor || null,
        },
      }));
    } finally {
      setLoadingMoreGallery(false);
    }
  };

  // Eski xabarlarni ro'yxat boshiga (yuqoriga) qo'shadi — xabarlar eskidan yangiga
  // tartiblangan, shuning uchun "eskisini yuklash" tepada bo'lishi kerak.
  const loadOlderMessages = async () => {
    if (!msgCursor || loadingMoreMsgs || !active) return;
    setLoadingMoreMsgs(true);
    try {
      const res = await fetch(
        `/api/admin/chat/conversations/${active.id}/messages?before=${encodeURIComponent(msgCursor)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMessages((prev) => [...(data.messages || []), ...(prev || [])]);
      setMsgCursor(data.nextCursor || null);
    } finally {
      setLoadingMoreMsgs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (active) {
    const p1 = active.participants[0];
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Suhbatlar ro'yxati
        </button>
        <p className="font-luxury text-lg text-primary mb-1.5">
          @{active.participants[0]?.username || active.participants[0]?.name || '?'}
          <span className="text-muted mx-2">↔</span>
          @{active.participants[1]?.username || active.participants[1]?.name || '?'}
        </p>
        {(active.participants[0]?.savedAsByOther || active.participants[1]?.savedAsByOther) && (
          <div className="flex flex-col gap-0.5 text-xs text-muted mb-2">
            {active.participants[1]?.savedAsByOther && (
              <p className="flex items-center gap-1.5">
                <Tag size={12} />
                @{active.participants[0]?.username} → @{active.participants[1]?.username}ni{' '}
                <span className="text-primary font-medium">"{active.participants[1].savedAsByOther}"</span> deb saqlagan
              </p>
            )}
            {active.participants[0]?.savedAsByOther && (
              <p className="flex items-center gap-1.5">
                <Tag size={12} />
                @{active.participants[1]?.username} → @{active.participants[0]?.username}ni{' '}
                <span className="text-primary font-medium">"{active.participants[0].savedAsByOther}"</span> deb saqlagan
              </p>
            )}
          </div>
        )}
        <p className="flex items-center gap-1.5 text-xs text-amber-600 mb-4 min-h-[1em]">
          {active.hiddenFor?.length > 0 && (
            <>
              <UserX size={12} />
              Ro&apos;yxatdan o&apos;chirgan: {active.hiddenFor.map((u) => `@${u}`).join(', ')}
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5 mb-4">
          <button
            onClick={() => setViewMode('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'chat' ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            <MessageSquareText size={13} /> Suhbat
          </button>
          <button
            onClick={() => openGalleryTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'image' ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            <ImageIcon size={13} /> Rasmlar
          </button>
          <button
            onClick={() => openGalleryTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'video' ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            <Video size={13} /> Videolar
          </button>
          <button
            onClick={() => openGalleryTab('voice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'voice' ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:text-primary'
            }`}
          >
            <Mic size={13} /> Ovozli xabarlar
          </button>
        </div>

        {['image', 'video', 'voice'].includes(viewMode) ? (
          !galleryData[viewMode] ? (
            <Loader2 className="animate-spin text-accent" size={22} />
          ) : (
            <div className="rounded-2xl border border-border bg-bg/60 shadow-card p-5 max-h-[65vh] overflow-y-auto">
              <div className="flex flex-wrap gap-3">
                {galleryData[viewMode].messages.map((m) => {
                  const sender = active.participants.find((p) => String(p._id) === String(m.senderId));
                  const Icon = TYPE_ICON[m.type] || MessageSquareText;
                  return (
                    <div key={m._id} className="w-fit rounded-xl border border-border bg-surface p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted flex-wrap">
                        <Icon size={11} />
                        @{sender?.username || sender?.name || '?'}
                        {m.deletedForEveryone && (
                          <span className="flex items-center gap-0.5 normal-case text-red-600">
                            <Trash2 size={10} /> o'chirilgan
                          </span>
                        )}
                      </div>
                      <AdminMediaContent message={m} token={token} />
                      <p className="text-[10px] text-muted">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
                    </div>
                  );
                })}
              </div>
              {galleryData[viewMode].messages.length === 0 && (
                <p className="text-center text-sm text-muted py-8">Media xabar yo'q</p>
              )}
              {galleryData[viewMode].cursor && (
                <div className="flex justify-center pt-3">
                  <button
                    onClick={loadMoreGallery}
                    disabled={loadingMoreGallery}
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {loadingMoreGallery && <Loader2 size={12} className="animate-spin" />} Eskisini yuklash
                  </button>
                </div>
              )}
            </div>
          )
        ) : messages === null ? (
          <Loader2 className="animate-spin text-accent" size={22} />
        ) : (
          <div className="rounded-2xl border border-border bg-bg/60 shadow-card p-5 max-h-[65vh] overflow-y-auto space-y-3">
            {msgCursor && (
              <div className="flex justify-center pb-1">
                <button
                  onClick={loadOlderMessages}
                  disabled={loadingMoreMsgs}
                  className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loadingMoreMsgs && <Loader2 size={12} className="animate-spin" />} Eski xabarlarni yuklash
                </button>
              </div>
            )}
            {messages.map((m) => {
              const mine = String(m.senderId) === String(p1?._id);
              const Icon = TYPE_ICON[m.type] || MessageSquareText;
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm relative ${
                      mine
                        ? 'bg-surface border border-border text-primary rounded-bl-md'
                        : 'bg-accent text-on-accent rounded-br-md'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wide opacity-70 flex-wrap">
                      <Icon size={11} />
                      {m.type}
                      {m.flagged && <Flag size={11} className="ml-1" />}
                      {m.edited && (
                        <span className="flex items-center gap-0.5 normal-case text-amber-600">
                          <Pencil size={10} /> tahrirlangan
                        </span>
                      )}
                      {m.deletedForEveryone && (
                        <span className="flex items-center gap-0.5 normal-case text-red-600">
                          <Trash2 size={10} /> hammadan o'chirilgan
                        </span>
                      )}
                      {!m.deletedForEveryone && m.deletedFor?.length > 0 && (
                        <span className="normal-case text-muted">
                          ({m.deletedFor.length} tarafdan o'chirilgan)
                        </span>
                      )}
                    </div>
                    {m.edited && m.originalText && (
                      <p className="text-[11px] text-muted/70 line-through whitespace-pre-wrap break-words mb-1">
                        {m.originalText}
                      </p>
                    )}
                    {m.type === 'text' && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    {m.type === 'sticker' && <p className="opacity-80">stiker: {m.stickerId}</p>}
                    <AdminMediaContent message={m} token={token} />
                    <p className="text-[10px] opacity-60 mt-1.5">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <p className="text-center text-sm text-muted py-8">Xabar yo'q</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => openConversation(c)}
            className="w-full text-left px-5 py-4 hover:bg-bg/60 flex items-center justify-between gap-3 transition-colors"
          >
            <span className="text-sm font-medium text-primary flex items-center gap-2 flex-wrap">
              @{c.participants[0]?.username || c.participants[0]?.name || '?'}
              <span className="text-muted mx-0.5">↔</span>
              @{c.participants[1]?.username || c.participants[1]?.name || '?'}
              {c.hiddenFor?.length > 0 && (
                <span title={`Ro'yxatdan o'chirgan: ${c.hiddenFor.map((u) => `@${u}`).join(', ')}`}>
                  <UserX size={13} className="text-amber-600" />
                </span>
              )}
              {(c.participants[0]?.savedAsByOther || c.participants[1]?.savedAsByOther) && (
                <span title="Taxallus qo'yilgan">
                  <Tag size={13} className="text-accent" />
                </span>
              )}
            </span>
            <span className="text-xs text-muted truncate max-w-[220px]">{c.lastMessagePreview}</span>
          </button>
        ))}
        {conversations.length === 0 && <p className="text-center text-sm text-muted py-10">Suhbat yo'q</p>}
      </div>
      {convCursor && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMoreConversations}
            disabled={loadingMoreConvos}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMoreConvos && <Loader2 size={13} className="animate-spin" />} Yana yuklash
          </button>
        </div>
      )}
    </div>
  );
}
