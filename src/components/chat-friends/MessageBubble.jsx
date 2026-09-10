'use client';
import { useState } from 'react';
import { Check, CheckCheck, Download, FileText, Flag, Pencil, Reply, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { findSticker } from '@/lib/stickers';
import { useChat } from '@/context/ChatContext';
import { REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import DeleteMessageModal from './DeleteMessageModal';

function ReplyQuote({ replyTo, isMine, myId, otherUsername, onClick }) {
  const senderLabel = String(replyTo.senderId) === String(myId) ? 'Siz' : otherUsername ? `@${otherUsername}` : 'Foydalanuvchi';
  const preview = replyTo.type === 'text' ? replyTo.text : REPLY_TYPE_LABEL[replyTo.type] || '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left mb-1.5 pl-2 border-l-2 rounded-sm ${
        isMine ? 'border-white/50 hover:bg-white/10' : 'border-accent hover:bg-primary-soft/40'
      } transition-colors`}
    >
      <p className={`text-xs font-semibold truncate ${isMine ? 'text-white/90' : 'text-accent'}`}>{senderLabel}</p>
      <p className={`text-xs truncate ${isMine ? 'text-white/70' : 'text-muted'}`}>{preview || '…'}</p>
    </button>
  );
}

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
      className="flex items-center gap-2 px-3 py-2 bg-surface/70 rounded-lg text-sm text-ink hover:bg-surface"
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

// Xabar matnidagi havolalarni (http(s):// yoki www.) bosiladigan <a>'ga aylantiradi —
// dangerouslySetInnerHTML ISHLATILMAYDI (XSS xavfi), buning o'rniga regex bo'yicha
// bo'lib, oddiy matnni React string sifatida qoldiramiz, faqat havola qismini
// alohida elementga o'raymiz. Oxiridagi tinish belgilari (masalan gap oxiridagi
// nuqta) havolaga kirib ketmasligi uchun alohida ajratiladi.
const URL_RE = /((?:https?:\/\/|www\.)\S+)/gi;
const TRAILING_PUNCT_RE = /[.,:;!?'")\]]+$/;

function linkifyText(text) {
  const segments = text.split(URL_RE);
  const nodes = [];
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (/^(https?:\/\/|www\.)/i.test(seg)) {
      const trailing = seg.match(TRAILING_PUNCT_RE)?.[0] || '';
      const urlPart = trailing ? seg.slice(0, -trailing.length) : seg;
      const href = urlPart.startsWith('www.') ? `https://${urlPart}` : urlPart;
      nodes.push(
        <a key={`${i}-url`} href={href} target="_blank" rel="noreferrer" className="underline break-all">
          {urlPart}
        </a>
      );
      if (trailing) nodes.push(trailing);
    } else {
      nodes.push(seg);
    }
  });
  return nodes;
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

export default function MessageBubble({ message, isMine, myId, onJumpToReply }) {
  const { reportTarget, activeConversation, startEditMessage, startReply, deleteMessage } = useChat();
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
    <div data-msg-id={String(message.id || message._id)} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
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
                      : 'bg-bg text-ink rounded-bl-md'
                }`
          }
        >
          {deleted ? (
            <p className="flex items-center gap-1.5">
              <Trash2 size={13} /> Xabar o'chirildi
            </p>
          ) : (
            <>
              {message.replyTo && (
                <ReplyQuote
                  replyTo={message.replyTo}
                  isMine={isMine}
                  myId={myId}
                  otherUsername={activeConversation?.otherUser?.username}
                  onClick={() => onJumpToReply?.(String(message.replyTo.messageId))}
                />
              )}
              {message.type === 'text' && (
                <p className={`whitespace-pre-wrap break-words font-chat ${emojiOnly ? 'text-4xl leading-tight' : ''}`}>
                  {emojiOnly ? message.text : linkifyText(message.text)}
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
              {message.text && ['image', 'video', 'file'].includes(message.type) && (
                <p className="whitespace-pre-wrap break-words font-chat mt-1.5">{linkifyText(message.text)}</p>
              )}
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
          <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => startReply(message)}
              title="Javob berish"
              aria-label="Xabarga javob berish"
              className="p-2 -m-1 text-muted hover:text-accent transition-colors touch-manipulation"
            >
              <Reply size={13} />
            </button>
            {canEdit && (
              <button
                onClick={() => startEditMessage(message)}
                title="Tahrirlash"
                aria-label="Xabarni tahrirlash"
                className="p-2 -m-1 text-muted hover:text-accent transition-colors touch-manipulation"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              title="O'chirish"
              aria-label="Xabarni o'chirish"
              className="p-2 -m-1 text-muted hover:text-accent transition-colors touch-manipulation"
            >
              <Trash2 size={13} />
            </button>
            {!isMine && !reported && (
              <button
                onClick={handleReport}
                title="Shikoyat qilish"
                aria-label="Xabar haqida shikoyat qilish"
                className="p-2 -m-1 text-muted hover:text-accent transition-colors touch-manipulation"
              >
                <Flag size={13} />
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
