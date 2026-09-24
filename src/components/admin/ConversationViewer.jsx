'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Link2, Check, Lock, Users, UserRound, MessageSquareText, Image as ImageIcon, Video, Mic, Paperclip, Flag, Pencil, Trash2, Download, UserX, Tag } from 'lucide-react';
import { useAuthedAdminMediaUrl } from '@/lib/useAuthedMedia';
import { useAllChatsUnlocked } from '@/lib/adminHiddenChats';

const TYPE_ICON = { image: ImageIcon, video: Video, voice: Mic, file: Paperclip, text: MessageSquareText };

// Quyidagi 4 ta komponent — oddiy foydalanuvchi tomonidagi MessageBubble.jsx'dagi
// Image/Video/Voice/FileBubble bilan bir xil naqsh, lekin admin endpointi orqali
// (/api/admin/chat/media) — ishtirokchi bo'lmasa ham, hatto xabar/suhbat "o'chirilgan"
// bo'lsa ham fayl ko'rinadi (haqiqiy S3 obyekt hech qachon o'chirilmaydi).
function AdminImageBubble({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  if (!url) return <div className="w-40 max-w-full h-32 bg-primary-soft/40 rounded-lg animate-pulse" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Rasm" className="max-w-[min(220px,100%)] max-h-[240px] rounded-lg object-cover" />;
}

function AdminVideoBubble({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  if (!url) return <div className="w-56 max-w-full h-40 bg-primary-soft/40 rounded-lg animate-pulse" />;
  return <video src={url} controls className="max-w-[min(240px,100%)] max-h-[260px] rounded-lg" />;
}

function AdminVoiceBubble({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  if (!url) return <div className="w-48 max-w-full h-10 bg-primary-soft/40 rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-56 max-w-full h-10" />;
}

function AdminFileBubble({ media }) {
  const { url } = useAuthedAdminMediaUrl(media.key);
  // URL tayyor bo'lguncha havola faol emas ('#' yangi bo'sh tab ochmasin).
  if (!url) {
    return (
      <span aria-disabled="true" className="flex items-center gap-2 px-3 py-2 bg-bg/70 rounded-lg text-xs opacity-60 pointer-events-none">
        <Paperclip size={13} />
        <span>Fayl yuklanmoqda…</span>
        <Loader2 size={12} className="ml-auto flex-shrink-0 animate-spin" />
      </span>
    );
  }
  return (
    <a
      href={url}
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

function AdminMediaContent({ message }) {
  if (!message.media) return null;
  if (message.type === 'image') return <AdminImageBubble media={message.media} />;
  if (message.type === 'video') return <AdminVideoBubble media={message.media} />;
  if (message.type === 'voice') return <AdminVoiceBubble media={message.media} />;
  if (message.type === 'file') return <AdminFileBubble media={message.media} />;
  return null;
}

const EMPTY_LIST = { items: [], cursor: null, loaded: false };

// Admin ishtirok etgan suhbatda — suhbatdosh (admin emas) tomon; aks holda null.
function otherParticipant(c, adminId) {
  if (!adminId || !c.participants.some((p) => String(p._id) === adminId)) return null;
  return c.participants.find((p) => String(p._id) !== adminId) || null;
}

const handle = (p) => `@${p?.username || p?.name || '?'}`;

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 min-h-11 md:min-h-0 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
        active ? 'bg-accent text-on-accent' : 'bg-surface border border-border text-muted hover:text-ink'
      }`}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

// `conversationId` berilsa — bitta suhbat (/admin/c/<id>), aks holda ro'yxat
// (/admin/conversations). Ro'yxat ikki bo'limga ajratilgan: "Mening suhbatlarim"
// (admin o'zi yozishgan) va yashirin "Umumiy suhbatlar" — ikkinchisi faqat
// "Suhbatlar" menyusi 5 marta tez bosilganda ko'rinadi (src/lib/adminHiddenChats.js).
export default function ConversationViewer({ conversationId = null }) {
  const router = useRouter();
  const unlocked = useAllChatsUnlocked();
  const [tab, setTab] = useState('mine'); // mine | others
  const [lists, setLists] = useState({ mine: EMPTY_LIST, others: EMPTY_LIST });
  const [adminId, setAdminId] = useState(null);
  const [loadingMoreConvos, setLoadingMoreConvos] = useState(false);
  const [active, setActive] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // Yashirin bo'lim qayta yopilsa — "Umumiy" tabida qolib ketmaslik.
  const currentTab = unlocked ? tab : 'mine';
  const list = lists[currentTab];

  const fetchPage = async (scope, cursor) => {
    const qs = new URLSearchParams({ scope });
    if (cursor) qs.set('before', cursor);
    const res = await fetch(`/api/admin/chat/conversations?${qs}`);
    const data = await res.json();
    if (data.adminId) setAdminId(data.adminId);
    setLists((prev) => ({
      ...prev,
      [scope]: {
        items: cursor ? [...prev[scope].items, ...(data.conversations || [])] : data.conversations || [],
        cursor: data.nextCursor || null,
        loaded: true,
      },
    }));
  };

  // Har bir bo'lim birinchi marta ko'rsatilganda yuklanadi — "Umumiy" ro'yxat
  // yashirin turganda umuman so'ralmaydi.
  useEffect(() => {
    if (conversationId || lists[currentTab].loaded) return;
    fetchPage(currentTab).catch(() =>
      setLists((prev) => ({ ...prev, [currentTab]: { ...EMPTY_LIST, loaded: true } }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentTab]);

  const loadMoreConversations = async () => {
    if (!list.cursor || loadingMoreConvos) return;
    setLoadingMoreConvos(true);
    try {
      await fetchPage(currentTab, list.cursor);
    } finally {
      setLoadingMoreConvos(false);
    }
  };

  // /admin/c/<id> — suhbat `id` filtri bilan to'g'ridan-to'g'ri olinadi
  // (ro'yxatning qaysi sahifasida turganidan qat'i nazar).
  useEffect(() => {
    if (!conversationId) return;
    setActive(null);
    setNotFound(false);
    setMessages(null);
    setMsgCursor(null);
    setViewMode('chat');
    setGalleryData({});
    fetch(`/api/admin/chat/conversations?id=${encodeURIComponent(conversationId)}`)
      .then((r) => r.json())
      .then(async (d) => {
        const conv = d.conversations?.[0];
        if (d.adminId) setAdminId(d.adminId);
        if (!conv) {
          setNotFound(true);
          return;
        }
        setActive(conv);
        const res = await fetch(`/api/admin/chat/conversations/${conv.id}/messages`);
        const data = await res.json();
        setMessages(data.messages || []);
        setMsgCursor(data.nextCursor || null);
      })
      .catch(() => setNotFound(true));
  }, [conversationId]);

  // Eski havolalar (`/admin/conversations?open=<id>`) yangi manzilga yo'naltiriladi.
  const openParam = useSearchParams().get('open');
  useEffect(() => {
    if (openParam && !conversationId) router.replace(`/admin/c/${encodeURIComponent(openParam)}`);
  }, [openParam, conversationId, router]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard ruxsati yo'q — havola baribir manzil satrida.
    }
  };

  // Har bir galereya (Rasmlar/Videolar/Ovozli xabarlar) birinchi marta ochilganda
  // yuklanadi (keyin qayta bosilsa qayta so'ralmaydi — allaqachon yuklangan bo'lsa
  // shu holat saqlanadi). Natija eng yangisi tepada (order=desc).
  const openGalleryTab = async (type) => {
    setViewMode(type);
    if (galleryData[type] || !active) return;
    const res = await fetch(`/api/admin/chat/conversations/${active.id}/messages?type=${type}&order=desc`);
    const data = await res.json();
    setGalleryData((prev) => ({ ...prev, [type]: { messages: data.messages || [], cursor: data.nextCursor || null } }));
  };

  const loadMoreGallery = async () => {
    const current = galleryData[viewMode];
    if (!current?.cursor || loadingMoreGallery || !active) return;
    setLoadingMoreGallery(true);
    try {
      const res = await fetch(
        `/api/admin/chat/conversations/${active.id}/messages?type=${viewMode}&order=desc&before=${encodeURIComponent(current.cursor)}`
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
        `/api/admin/chat/conversations/${active.id}/messages?before=${encodeURIComponent(msgCursor)}`
      );
      const data = await res.json();
      setMessages((prev) => [...(data.messages || []), ...(prev || [])]);
      setMsgCursor(data.nextCursor || null);
    } finally {
      setLoadingMoreMsgs(false);
    }
  };

  const backLink = (
    <Link
      href="/admin/conversations"
      className="inline-flex items-center gap-1.5 min-h-11 md:min-h-0 text-sm text-muted hover:text-ink mb-4 transition-colors"
    >
      <ArrowLeft size={15} /> Suhbatlar ro&apos;yxati
    </Link>
  );

  if (conversationId && notFound) {
    return (
      <div>
        {backLink}
        <p className="text-center text-sm text-muted py-16">Suhbat topilmadi</p>
      </div>
    );
  }

  if (conversationId && !active) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (active) {
    const other = otherParticipant(active, adminId);
    // Admin ishtirok etgan suhbatda chap tomonda suhbatdosh, o'ngda admin o'zi
    // (oddiy messenjerdagidek); boshqa suhbatlarda — birinchi ishtirokchi chapda.
    const p1 = other || active.participants[0];
    return (
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {backLink}
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 min-h-11 md:min-h-0 mb-4 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors"
          >
            {copied ? <Check size={13} className="text-accent" /> : <Link2 size={13} />}
            {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
          </button>
        </div>
        <p className="font-luxury text-lg text-ink mb-1.5 break-words">
          {other ? (
            <>
              <span className="text-muted">Siz</span>
              <span className="text-muted mx-2">↔</span>
              {handle(other)}
            </>
          ) : (
            <>
              {handle(active.participants[0])}
              <span className="text-muted mx-2">↔</span>
              {handle(active.participants[1])}
            </>
          )}
        </p>
        {(active.participants[0]?.savedAsByOther || active.participants[1]?.savedAsByOther) && (
          <div className="flex flex-col gap-0.5 text-xs text-muted mb-2">
            {active.participants[1]?.savedAsByOther && (
              <p className="flex items-center gap-1.5">
                <Tag size={12} />
                @{active.participants[0]?.username} → @{active.participants[1]?.username}ni{' '}
                <span className="text-ink font-medium">"{active.participants[1].savedAsByOther}"</span> deb saqlagan
              </p>
            )}
            {active.participants[0]?.savedAsByOther && (
              <p className="flex items-center gap-1.5">
                <Tag size={12} />
                @{active.participants[1]?.username} → @{active.participants[0]?.username}ni{' '}
                <span className="text-ink font-medium">"{active.participants[0].savedAsByOther}"</span> deb saqlagan
              </p>
            )}
          </div>
        )}
        <p className="flex items-center gap-1.5 text-xs text-warning mb-4 min-h-[1em] break-words">
          {active.hiddenFor?.length > 0 && (
            <>
              <UserX size={12} />
              Ro&apos;yxatdan o&apos;chirgan: {active.hiddenFor.map((u) => `@${u}`).join(', ')}
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <TabButton active={viewMode === 'chat'} onClick={() => setViewMode('chat')} icon={MessageSquareText}>
            Suhbat
          </TabButton>
          <TabButton active={viewMode === 'image'} onClick={() => openGalleryTab('image')} icon={ImageIcon}>
            Rasmlar
          </TabButton>
          <TabButton active={viewMode === 'video'} onClick={() => openGalleryTab('video')} icon={Video}>
            Videolar
          </TabButton>
          <TabButton active={viewMode === 'voice'} onClick={() => openGalleryTab('voice')} icon={Mic}>
            Ovozli xabarlar
          </TabButton>
        </div>

        {['image', 'video', 'voice'].includes(viewMode) ? (
          !galleryData[viewMode] ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={22} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-bg/60 shadow-card p-3 sm:p-5 max-h-[65dvh] overflow-y-auto">
              <div className="flex flex-wrap gap-3">
                {galleryData[viewMode].messages.map((m) => {
                  const sender = active.participants.find((p) => String(p._id) === String(m.senderId));
                  const Icon = TYPE_ICON[m.type] || MessageSquareText;
                  return (
                    <div key={m._id} className="w-fit max-w-full rounded-xl border border-border bg-surface p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted flex-wrap">
                        <Icon size={11} />
                        @{sender?.username || sender?.name || '?'}
                        {m.deletedForEveryone && (
                          <span className="flex items-center gap-0.5 normal-case text-danger">
                            <Trash2 size={10} /> o'chirilgan
                          </span>
                        )}
                      </div>
                      <AdminMediaContent message={m} />
                      <p className="text-[11px] text-muted">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
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
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {loadingMoreGallery && <Loader2 size={12} className="animate-spin" />} Eskisini yuklash
                  </button>
                </div>
              )}
            </div>
          )
        ) : messages === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent" size={22} />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-bg/60 shadow-card p-3 sm:p-5 max-h-[65dvh] overflow-y-auto space-y-3">
            {msgCursor && (
              <div className="flex justify-center pb-1">
                <button
                  onClick={loadOlderMessages}
                  disabled={loadingMoreMsgs}
                  className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[11px] font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
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
                    className={`min-w-0 max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm relative ${
                      mine
                        ? 'bg-surface border border-border text-ink rounded-bl-md'
                        : 'bg-accent text-on-accent rounded-br-md'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide flex-wrap">
                      <span className="flex items-center gap-1.5 opacity-70">
                        <Icon size={11} />
                        {m.type}
                        {m.flagged && <Flag size={11} className="ml-1" />}
                      </span>
                      {/* Soft badge — accent pufakcha ichida ham, sirtda ham o'qiladi. */}
                      {m.edited && (
                        <span className="flex items-center gap-0.5 normal-case px-1.5 rounded bg-warning-soft text-warning">
                          <Pencil size={10} /> tahrirlangan
                        </span>
                      )}
                      {m.deletedForEveryone && (
                        <span className="flex items-center gap-0.5 normal-case px-1.5 rounded bg-danger-soft text-danger">
                          <Trash2 size={10} /> hammadan o'chirilgan
                        </span>
                      )}
                      {!m.deletedForEveryone && m.deletedFor?.length > 0 && (
                        <span className="normal-case opacity-70">
                          ({m.deletedFor.length} tarafdan o'chirilgan)
                        </span>
                      )}
                    </div>
                    {m.edited && m.originalText && (
                      <p className="text-[11px] opacity-60 line-through whitespace-pre-wrap break-words mb-1">
                        {m.originalText}
                      </p>
                    )}
                    {m.type === 'text' && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    {m.type === 'sticker' && <p className="opacity-80">stiker: {m.stickerId}</p>}
                    <AdminMediaContent message={m} />
                    <p className="text-[11px] opacity-70 mt-1.5">{new Date(m.createdAt).toLocaleString('uz-UZ')}</p>
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
      {unlocked && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <TabButton active={currentTab === 'mine'} onClick={() => setTab('mine')} icon={UserRound}>
            Mening suhbatlarim
          </TabButton>
          <TabButton active={currentTab === 'others'} onClick={() => setTab('others')} icon={Users}>
            Umumiy suhbatlar
          </TabButton>
          <span className="flex items-center gap-1 text-[11px] text-muted ml-1">
            <Lock size={11} /> yashirish uchun &quot;Suhbatlar&quot;ni 5 marta bosing
          </span>
        </div>
      )}
      {!list.loaded ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
          {list.items.map((c) => {
            const other = otherParticipant(c, adminId);
            return (
              <Link
                key={c.id}
                href={`/admin/c/${c.id}`}
                className="w-full text-left px-4 sm:px-5 py-4 hover:bg-bg/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 transition-colors"
              >
                <span className="min-w-0 text-sm font-medium text-ink flex items-center gap-2 flex-wrap [overflow-wrap:anywhere]">
                  {other ? (
                    <>
                      {handle(other)}
                      {other.name && other.username && <span className="text-xs font-normal text-muted">{other.name}</span>}
                    </>
                  ) : (
                    <>
                      {handle(c.participants[0])}
                      <span className="text-muted mx-0.5">↔</span>
                      {handle(c.participants[1])}
                    </>
                  )}
                  {c.hiddenFor?.length > 0 && (
                    <span title={`Ro'yxatdan o'chirgan: ${c.hiddenFor.map((u) => `@${u}`).join(', ')}`}>
                      <UserX size={13} className="text-warning" />
                    </span>
                  )}
                  {(c.participants[0]?.savedAsByOther || c.participants[1]?.savedAsByOther) && (
                    <span title="Taxallus qo'yilgan">
                      <Tag size={13} className="text-accent" />
                    </span>
                  )}
                </span>
                <span title={c.lastMessagePreview} className="text-xs text-muted truncate max-w-full sm:max-w-[220px]">{c.lastMessagePreview}</span>
              </Link>
            );
          })}
          {list.items.length === 0 && (
            <p className="text-center text-sm text-muted py-10">
              {currentTab === 'mine' ? 'Siz hali hech kim bilan yozishmagansiz' : "Suhbat yo'q"}
            </p>
          )}
        </div>
      )}
      {list.cursor && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMoreConversations}
            disabled={loadingMoreConvos}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMoreConvos && <Loader2 size={13} className="animate-spin" />} Yana yuklash
          </button>
        </div>
      )}
    </div>
  );
}
