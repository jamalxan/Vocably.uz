'use client';
import { useState } from 'react';
import { Check, CheckCheck, Download, FileText, Flag, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { findSticker } from '@/lib/stickers';
import { useChat } from '@/context/ChatContext';
import DeleteMessageModal from './DeleteMessageModal';

function ImageBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  const [open, setOpen] = useState(false);
  if (!url) return <div className="w-40 h-32 bg-primary-soft rounded-lg animate-pulse" />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Rasm"
        onClick={() => setOpen(true)}
        className="max-w-[240px] max-h-[280px] rounded-lg cursor-zoom-in object-cover"
      />
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Rasm" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  );
}

function VideoBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-56 h-40 bg-primary-soft rounded-lg animate-pulse" />;
  return <video src={url} controls className="max-w-[260px] max-h-[300px] rounded-lg" />;
}

function VoiceBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  if (!url) return <div className="w-48 h-10 bg-primary-soft rounded-full animate-pulse" />;
  return <audio src={url} controls className="w-56 h-10" />;
}

function FileBubble({ media }) {
  const { token } = useApp();
  const { url } = useAuthedMediaUrl(media.key, token);
  return (
    <a
      href={url || '#'}
      download
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-surface/70 rounded-lg text-sm text-primary hover:bg-surface"
    >
      <FileText size={16} />
      <span className="truncate max-w-[160px]">Fayl</span>
      <Download size={14} className="ml-auto flex-shrink-0" />
    </a>
  );
}

// Faqat emoji(lar)dan iborat qisqa xabar — Telegram/WhatsApp'dagidek pufaksiz,
// kattalashtirib ko'rsatiladi. \p{Emoji_Component} ataylab ishlatilmadi (raqamlar,
// #, * ham shu toifaga kiradi — faqat sonlardan iborat xabar noto'g'ri "emoji" deb topilib qolardi).
const ZWJ = '‍';
const VARIATION_SELECTOR = '️';
const EMOJI_ONLY_RE = new RegExp(
  `^[\\p{Extended_Pictographic}${ZWJ}${VARIATION_SELECTOR}\\u{1F3FB}-\\u{1F3FF}\\s]+$`,
  'u'
);
function isEmojiOnly(text) {
  if (!text || text.length > 30) return false;
  return EMOJI_ONLY_RE.test(text);
}

// Xabar yuborilgan vaqt — har bir pufakcha tagida (Telegram/WhatsApp uslubi).
// Bugungi kun uchun faqat soat:daqiqa, kechagi uchun "kecha", undan eski bo'lsa sana.
function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `kecha ${hh}:${mm}`;
  return `${d.toLocaleDateString('uz-UZ')} ${hh}:${mm}`;
}

export default function MessageBubble({ message, isMine }) {
  const { reportTarget, activeConversation, startEditMessage, deleteMessage } = useChat();
  const [reported, setReported] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sticker = message.type === 'sticker' ? findSticker(message.stickerId) : null;
  const deleted = !!message.deletedForEveryone;
  const emojiOnly = !deleted && message.type === 'text' && isEmojiOnly(message.text);

  const handleReport = async () => {
    const reason = window.prompt("Shikoyat sababi:");
    if (!reason?.trim()) return;
    const ok = await reportTarget('message', message.id || message._id, reason.trim());
    if (ok) setReported(true);
  };

  const handleDelete = async (forEveryone) => {
    setDeleting(true);
    const res = await deleteMessage(message.id || message._id, forEveryone);
    setDeleting(false);
    if (res.error) alert(res.error);
    else setDeleteOpen(false);
  };

  const isPlain = !deleted && (message.type === 'sticker' || emojiOnly);
  const canEdit = isMine && message.type === 'text' && !deleted;

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex flex-col max-w-[85%] ${isMine ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
        <div
          className={
            isPlain
              ? ''
              : `rounded-2xl px-3.5 py-2.5 text-sm ${
                  deleted
                    ? 'bg-transparent border border-dashed border-border text-muted italic'
                    : isMine
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-bg text-primary rounded-bl-md'
                }`
          }
        >
          {deleted ? (
            <p className="flex items-center gap-1.5">
              <Trash2 size={13} /> Xabar o'chirildi
            </p>
          ) : (
            <>
              {message.type === 'text' && (
                <p className={`whitespace-pre-wrap break-words font-chat ${emojiOnly ? 'text-4xl leading-tight' : ''}`}>
                  {message.text}
                </p>
              )}
              {message.type === 'sticker' && sticker && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={sticker.file} alt={sticker.label} className="w-24 h-24" />
              )}
              {message.type === 'image' && <ImageBubble media={message.media} />}
              {message.type === 'video' && <VideoBubble media={message.media} />}
              {message.type === 'voice' && <VoiceBubble media={message.media} />}
              {message.type === 'file' && <FileBubble media={message.media} />}
              {message.edited && (
                <span className={`block text-[10px] mt-0.5 ${isMine ? 'text-white/60' : 'text-muted'}`}>
                  tahrirlangan
                </span>
              )}
            </>
          )}
        </div>

        {!deleted && (
          // Sichqoncha bo'lgan qurilmalarda (lg+) faqat hover'da ko'rinadi (Telegram Web
          // uslubi) — lekin touch qurilmalarda :hover umuman ishlamaydi, shuning uchun
          // aks holda tahrirlash/o'chirish tugmalari mobil'da butunlay yashiringan bo'lardi.
          <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
            {canEdit && (
              <button
                onClick={() => startEditMessage(message)}
                title="Tahrirlash"
                className="p-1 text-muted hover:text-accent transition-colors"
              >
                <Pencil size={12} />
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              title="O'chirish"
              className="p-1 text-muted hover:text-accent transition-colors"
            >
              <Trash2 size={12} />
            </button>
            {!isMine && !reported && (
              <button onClick={handleReport} title="Shikoyat qilish" className="p-1 text-muted hover:text-accent transition-colors">
                <Flag size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      <span className="flex items-center gap-0.5 text-[10px] text-muted mt-0.5 px-1 select-none">
        {formatMessageTime(message.createdAt)}
        {isMine && !deleted && (
          message.readAt ? (
            <CheckCheck size={13} className="text-accent" />
          ) : (
            <Check size={13} />
          )
        )}
      </span>
      </div>

      <DeleteMessageModal
        open={deleteOpen}
        canDeleteForEveryone={isMine}
        otherUsername={activeConversation?.otherUser?.username}
        onConfirm={deleting ? undefined : handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
