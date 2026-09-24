'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Download,
  FileText,
  Flag,
  Forward,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Play,
  Reply,
  Trash2,
  X,
} from 'lucide-react';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { useInViewport } from '@/lib/useInViewport';
import { findSticker } from '@/lib/stickers';
import { useChat } from '@/context/ChatContext';
import { isOnline } from '@/lib/presence';
import { REPLY_TYPE_LABEL } from '@/lib/chatConstants';
import { parseMessageFormatting } from '@/lib/chatFormatting';
import DeleteMessageModal from './DeleteMessageModal';
import ForwardMessageModal from './ForwardMessageModal';
import ReportReasonModal from './ReportReasonModal';

// Uzoq bosish (long-press) uchun chegara — ConversationList.jsx'dagi bilan bir xil
// naqsh/vaqt (C-10 — xabar pufakchasida ham o'sha uslub bilan kontekst menyu).
const LONG_PRESS_MS = 500;

function ReplyQuote({ replyTo, isMine, myId, otherUsername, onClick }) {
  const senderLabel = String(replyTo.senderId) === String(myId) ? 'Siz' : otherUsername ? `@${otherUsername}` : 'Foydalanuvchi';
  const preview = replyTo.type === 'text' ? replyTo.text : REPLY_TYPE_LABEL[replyTo.type] || '';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left mb-1.5 pl-2 border-l-2 rounded-sm ${
        isMine ? 'border-on-accent/50 hover:bg-on-accent/10' : 'border-accent hover:bg-primary-soft/40'
      } transition-colors`}
    >
      <p className={`text-xs font-semibold truncate ${isMine ? 'text-on-accent/90' : 'text-accent'}`}>{senderLabel}</p>
      <p className={`text-xs truncate ${isMine ? 'text-on-accent/70' : 'text-muted'}`}>{preview || '…'}</p>
    </button>
  );
}

// Presign so'rovi xato bo'lsa — cheksiz "pulsing" skelet o'rniga aniq xabar.
function MediaError() {
  return <p className="text-xs text-muted italic">Yuklab bo'lmadi</p>;
}

// Oyna ochilganda fokusni ichkariga oladi, Escape bilan yopiladi, yopilganda
// fokusni avvalgi tugmaga qaytaradi.
function useDialogFocus(initialRef, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const prevFocus = document.activeElement;
    initialRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [initialRef]);
}

// C-09 — UserProfileModal.jsx'dagi media galereyasi ham xuddi shu lightbox'ni
// ishlatadi (bosilganda rasm kattalashadi) — alohida oyna qurish o'rniga eksport
// qilinadi (TZ ko'rsatmasiga ko'ra "bo'lsa qayta ishlatilsin").
export function ImageLightbox({ url, onClose }) {
  const closeRef = useRef(null);
  useDialogFocus(closeRef, onClose);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rasm"
      onClick={onClose}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Yopish"
        className="absolute top-3 right-3 w-11 h-11 inline-flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Rasm" className="max-w-full max-h-full rounded-lg" />
    </div>
  );
}

// C-12 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 K) — rasm/video/fayl
// endi FAQAT pufakcha viewport'ga (yoki uning 200px atrofiga) kirganda so'raladi
// (useInViewport), suhbat ochilishi bilan HAMMASI emas — `inView` bo'lmaguncha
// useAuthedMediaUrl'ga `null` uzatiladi, u esa mediaKey bo'lmasa hech qanday
// so'rov yubormaydi (src/lib/useAuthedMedia.js).
function ImageBubble({ media }) {
  const [viewRef, inView] = useInViewport();
  const { url, error } = useAuthedMediaUrl(inView ? media.key : null);
  const [open, setOpen] = useState(false);
  if (error) return <MediaError />;
  if (!url) {
    return <div ref={viewRef} className="w-40 max-w-full h-32 bg-primary-soft rounded-lg animate-pulse" />;
  }
  return (
    <>
      <button
        ref={viewRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rasmni kattalashtirish"
        className="block max-w-full rounded-lg cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Rasm" className="block max-w-[min(240px,100%)] max-h-[280px] rounded-lg object-cover" />
      </button>
      {open && <ImageLightbox url={url} onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoBubble({ media }) {
  const [viewRef, inView] = useInViewport();
  const { url, error } = useAuthedMediaUrl(inView ? media.key : null);
  if (error) return <MediaError />;
  if (!url) return <div ref={viewRef} className="w-56 max-w-full h-40 bg-primary-soft rounded-lg animate-pulse" />;
  return (
    <video
      ref={viewRef}
      src={url}
      controls
      playsInline
      preload="metadata"
      className="block max-w-[min(260px,100%)] max-h-[300px] rounded-lg"
    />
  );
}

// C-12 — audit ATAYLAB voice xabarlar uchun boshqa qoida beradi: "play bosilganda"
// (viewport'ga kirganda EMAS — ovoz fayllari kichik bo'lsa ham, ko'rinib turgan
// har bir ovozli xabarni oldindan so'rash foydasiz). Shu sabab bosilmaguncha
// mediaKey useAuthedMediaUrl'ga umuman uzatilmaydi (hech qanday IntersectionObserver
// shart emas — bu yerda oddiy "hali bosilmadi" holati yetarli).
function VoiceBubble({ media }) {
  const [armed, setArmed] = useState(false);
  const { url, error } = useAuthedMediaUrl(armed ? media.key : null);
  if (error) return <MediaError />;
  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label="Ovozli xabarni ijro etish"
        className="flex items-center gap-2 w-48 max-w-full h-10 px-3 bg-primary-soft rounded-full text-sm text-accent hover:bg-primary-soft/80 transition-colors"
      >
        <Play size={16} className="flex-shrink-0" />
        Ovozli xabar
      </button>
    );
  }
  if (!url) return <div className="w-48 max-w-full h-10 bg-primary-soft rounded-full animate-pulse" />;
  return <audio src={url} controls autoPlay className="block w-56 max-w-full h-10" />;
}

function FileBubble({ media }) {
  const [viewRef, inView] = useInViewport();
  const { url, error } = useAuthedMediaUrl(inView ? media.key : null);
  const inner = (
    <>
      <FileText size={16} className="flex-shrink-0" />
      <span className="truncate max-w-[160px]">{error ? "Yuklab bo'lmadi" : 'Fayl'}</span>
      <Download size={14} className="ml-auto flex-shrink-0" />
    </>
  );
  // Havola tayyor bo'lguncha bosiladigan '#' emas — bo'sh tab ochilmasin.
  if (!url) {
    return (
      <span ref={viewRef} aria-disabled="true" className="flex items-center gap-2 px-3 py-2 bg-surface/70 rounded-lg text-sm text-muted">
        {inner}
      </span>
    );
  }
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-surface/70 rounded-lg text-sm text-ink hover:bg-surface"
    >
      {inner}
    </a>
  );
}

// C-10 — BIRDAN-BIR, unifitsirlangan xabar kontekst menyusi (barcha ekran
// o'lchamlarida): "..." tugmasi, o'ng-klik (onContextMenu) va uzoq-bosish
// (long-press, ConversationList.jsx'dagi bilan bir xil naqsh) — hammasi shu
// bitta pastdan chiquvchi menyuni ochadi. Ilgari desktop'da alohida hover
// ikonkalar qatori bo'lgan (Reply/Edit/Delete/Report) — endi bittalashtirilgan.
function MessageContextMenu({ actions, onClose }) {
  const firstRef = useRef(null);
  useDialogFocus(firstRef, onClose);
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Xabar amallari"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border-t border-border rounded-t-2xl shadow-card p-2"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {actions.map(({ key, label, Icon, onClick, danger }, i) => (
          <button
            key={key}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            onClick={() => {
              onClose();
              onClick();
            }}
            className={`w-full min-h-12 flex items-center gap-3 px-4 rounded-xl text-sm font-medium text-left transition-colors hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              danger ? 'text-danger' : 'text-ink'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
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

// D (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 D — composer) — oddiy Markdown-
// uslubidagi belgilash (**qalin**, _kursiv_) xabar RENDER qilinish tomonida
// hal qilinadi (composer'da to'liq WYSIWYG qurish o'rniga — TZ'ning ikkinchi,
// past xavfli variantiga muvofiq): parseMessageFormatting (src/lib/chatFormatting.js,
// pure, unit test qilingan) matnni bo'laklarga ajratadi, har bir bo'lak ichida esa
// havolalar (linkifyText) baribir aniqlanadi.
function renderFormattedText(text) {
  return parseMessageFormatting(text).map((tok, i) => {
    if (tok.type === 'bold') return <strong key={i}>{linkifyText(tok.value)}</strong>;
    if (tok.type === 'italic') return <em key={i}>{linkifyText(tok.value)}</em>;
    return <Fragment key={i}>{linkifyText(tok.value)}</Fragment>;
  });
}

// C-06 — xabar yuborilgan vaqt, har bir pufakcha tagida: ENDI har doim faqat
// soat:daqiqa (Telegram/WhatsApp uslubi) — qaysi kun ekanligi endi bubble ichida
// emas, ConversationView'dagi kun ajratgichida (day separator) ko'rsatiladi,
// shuning uchun bu yerda sana/"kecha" qo'shilmaydi (avval izchil emas edi: eski
// xabarlarda to'liq sana, yangilarida faqat soat — ikkalasi bir ekranda aralash ko'rinardi).
function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function MessageBubble({ message, isMine, myId, onJumpToReply }) {
  const {
    reportTarget,
    activeConversation,
    startEditMessage,
    startReply,
    deleteMessage,
    retryMessage,
    livePresence,
    pinMessage,
    unpinMessage,
  } = useChat();
  // C-16 — "yetkazildi" (✓✓, rangsiz) holati boshqa tomonning HOZIRGI onlayn
  // holatiga qarab taxmin qilinadi: ular socket orqali ulangan bo'lsa, xabar
  // ularning brauzeriga real-vaqtda allaqachon yetib borgan (haqiqiy per-xabar
  // "delivered" ACK'i yo'q — buning uchun alohida server infratuzilmasi kerak
  // bo'lardi, lekin bu yondashuv to'rtta holatni ham ma'noli tarzda ko'rsatadi).
  const otherOnline = isOnline(activeConversation?.otherUser?.lastActiveAt, livePresence[String(activeConversation?.otherUser?.id)]);
  const [reported, setReported] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  // C-10 — uzoq-bosish (long-press), ConversationList.jsx'dagi ConversationRow
  // bilan bir xil naqsh: faqat TEGIB (touch/pen) ishlaydigan qurilmalarda, sichqon
  // uchun o'ng-klik (onContextMenu, pastda) va "..." tugmasi allaqachon yetarli.
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  const sticker = message.type === 'sticker' ? findSticker(message.stickerId) : null;
  const deleted = !!message.deletedForEveryone;
  const emojiOnly = !deleted && message.type === 'text' && isEmojiOnly(message.text);

  // H-2 — ilgari window.prompt() bilan erkin matn so'raladigan edi; endi kategoriya
  // tanlash oynasi (ReportReasonModal.jsx) ochiladi.
  const handleReport = () => setReportOpen(true);

  const submitReport = async (category, note) => {
    setReportOpen(false);
    const ok = await reportTarget('message', message.id || message._id, category, note);
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
  // C-16 — hali serverga saqlanmagan ("yuborilmoqda"/"yuborilmadi") xabarlarda
  // haqiqiy server id yo'q, shuning uchun javob/tahrir/o'chirish/shikoyat amallari
  // hali ko'rsatilmaydi (haqiqiy id kelgunga qadar).
  const isPending = message._status === 'sending' || message._status === 'failed';
  const canEdit = isMine && message.type === 'text' && !deleted && !isPending;
  const canReport = !isMine && !reported && !isPending;
  const messageIdStr = String(message.id || message._id);
  const isPinned = !isPending && (activeConversation?.pinnedMessageIds || []).some((id) => String(id) === messageIdStr);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.text || '');
    } catch {
      // Clipboard ruxsati bo'lmasa — jimgina (ko'rsatiladigan boshqa xato yo'q).
    }
  };

  const handleTogglePin = async () => {
    const res = isPinned ? await unpinMessage(messageIdStr) : await pinMessage(messageIdStr);
    if (res?.error) alert(res.error);
  };

  // C-10 — §9.3 C to'liq ro'yxati: Javob, Nusxa olish, Forward (Yuborish), Pin,
  // (o'ziniki bo'lsa) Tahrirlash/O'chirish, (kelgan bo'lsa) Shikoyat. Reaksiyalar
  // (👍❤️😂...) ATAYLAB qo'shilmagan — TZ topshirig'ida bu alohida, ma'lumotlar
  // modeliga qo'shimcha talab qiladigan qadam sifatida ko'rsatilgan (bu bosqichdan
  // tashqarida).
  const actions = [
    { key: 'reply', label: 'Javob berish', aria: 'Xabarga javob berish', Icon: Reply, onClick: () => startReply(message) },
    ...(message.text
      ? [{ key: 'copy', label: 'Nusxa olish', aria: 'Xabar matnini nusxalash', Icon: Copy, onClick: handleCopyText }]
      : []),
    { key: 'forward', label: 'Yuborish', aria: 'Boshqa suhbatga yuborish', Icon: Forward, onClick: () => setForwardOpen(true) },
    {
      key: 'pin',
      label: isPinned ? 'Qadashni bekor qilish' : 'Qadash',
      aria: isPinned ? 'Xabarni qadashni bekor qilish' : 'Xabarni yuqoriga qadash',
      Icon: isPinned ? PinOff : Pin,
      onClick: handleTogglePin,
    },
    ...(canEdit
      ? [{ key: 'edit', label: 'Tahrirlash', aria: 'Xabarni tahrirlash', Icon: Pencil, onClick: () => startEditMessage(message) }]
      : []),
    { key: 'delete', label: "O'chirish", aria: "Xabarni o'chirish", Icon: Trash2, onClick: () => setDeleteOpen(true), danger: true },
    ...(canReport
      ? [{ key: 'report', label: 'Shikoyat qilish', aria: 'Xabar haqida shikoyat qilish', Icon: Flag, onClick: handleReport }]
      : []),
  ];

  // C-10 — o'ng-klik (sichqoncha) va uzoq-bosish (touch, ConversationList.jsx'dagi
  // bilan bir xil chegara/naqsh) ikkalasi ham xuddi shu kontekst menyusini ochadi.
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
  };
  const startLongPress = (e) => {
    if (e?.pointerType === 'mouse') return;
    longPressFired.current = false;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setMenuOpen(true);
    }, LONG_PRESS_MS);
  };
  const cancelLongPress = () => clearTimeout(pressTimer.current);
  // O'chirilgan/hali yuborilmagan xabarlarda amallar tugmasi ham ko'rsatilmaydi
  // (pastda), shuning uchun o'ng-klik/uzoq-bosish ham shu holatlarda o'chirilgan.
  const menuTriggerProps =
    !deleted && !isPending
      ? {
          onContextMenu: handleContextMenu,
          onPointerDown: startLongPress,
          onPointerUp: cancelLongPress,
          onPointerLeave: cancelLongPress,
          onPointerCancel: cancelLongPress,
        }
      : {};

  return (
    <div data-msg-id={String(message.id || message._id)} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex flex-col max-w-[85%] ${isMine ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
        {/* min-w-0 — media/uzun so'z pufakni max-w-[85%] dan tashqariga cho'zmasin.
            C-10 — o'ng-klik/uzoq-bosish shu pufakning o'zida (menuTriggerProps). */}
        <div
          className={
            isPlain
              ? 'min-w-0'
              : `min-w-0 rounded-2xl px-3.5 py-2.5 text-sm ${
                  deleted
                    ? 'bg-transparent border border-dashed border-border text-muted italic'
                    : isMine
                      ? 'bg-accent text-on-accent rounded-br-md'
                      // TZ-vocably-v2.md BUG-026 — avval bg-bg (sahifa foni bilan bir xil,
                      // dark rejimda pufak "yo'qolib" ko'rinardi) — endi bir daraja
                      // ko'tarilgan sirt (§E2).
                      : 'bg-surface-2 text-ink rounded-bl-md'
                }`
          }
          {...menuTriggerProps}
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
                <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] font-chat ${emojiOnly ? 'text-4xl leading-tight' : ''}`}>
                  {emojiOnly ? message.text : renderFormattedText(message.text)}
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
                <p className="whitespace-pre-wrap [overflow-wrap:anywhere] font-chat mt-1.5">{renderFormattedText(message.text)}</p>
              )}
              {message.edited && (
                <span className={`block text-[11px] mt-0.5 ${isMine ? 'text-on-accent/60' : 'text-muted'}`}>
                  tahrirlangan
                </span>
              )}
            </>
          )}
        </div>

        {!deleted && !isPending && (
          // C-10 — BITTA "..." tugmasi (barcha ekran o'lchamlarida) — o'ng-klik/
          // uzoq-bosish bilan bir qatorda, xuddi shu unifitsirlangan kontekst
          // menyusini ochadi (ilgari desktop'da alohida hover-ikonkalar qatori bor edi).
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Xabar amallari"
            aria-haspopup="dialog"
            className="flex-shrink-0 w-11 min-h-11 lg:w-8 lg:min-h-8 -mx-1.5 -my-2 lg:mx-0 lg:my-0 inline-flex items-center justify-center text-muted hover:text-accent transition-colors touch-manipulation rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>

      <span className="flex items-center gap-1 text-[11px] text-muted mt-0.5 px-1 select-none">
        {formatMessageTime(message.createdAt)}
        {/* C-16 — to'liq holat zanjiri: yuborilmoqda (soat) -> yuborildi (✓) ->
            yetkazildi (✓✓, rangsiz) -> o'qildi (✓✓, rangli); xato bo'lsa "Qayta
            yuborish" (tap orqali qayta urinish). */}
        {isMine && !deleted && (
          message._status === 'sending' ? (
            <span title="Yuborilmoqda" aria-label="Yuborilmoqda" role="img" className="inline-flex">
              <Clock size={12} />
            </span>
          ) : message._status === 'failed' ? (
            <button
              type="button"
              onClick={() => retryMessage(message)}
              title="Yuborilmadi — qayta yuborish uchun bosing"
              className="inline-flex items-center gap-0.5 text-danger hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger rounded"
            >
              <AlertCircle size={12} />
              Qayta yuborish
            </button>
          ) : message.readAt ? (
            <span title="O'qildi" aria-label="O'qildi" role="img" className="inline-flex">
              <CheckCheck size={13} className="text-accent" />
            </span>
          ) : otherOnline ? (
            <span title="Yetkazildi" aria-label="Yetkazildi" role="img" className="inline-flex">
              <CheckCheck size={13} />
            </span>
          ) : (
            <span title="Yuborildi" aria-label="Yuborildi" role="img" className="inline-flex">
              <Check size={13} />
            </span>
          )
        )}
      </span>
      </div>

      {menuOpen && <MessageContextMenu actions={actions} onClose={() => setMenuOpen(false)} />}

      <DeleteMessageModal
        open={deleteOpen}
        canDeleteForEveryone={isMine}
        otherUsername={activeConversation?.otherUser?.username}
        onConfirm={deleting ? undefined : handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ForwardMessageModal open={forwardOpen} message={message} onClose={() => setForwardOpen(false)} />

      <ReportReasonModal open={reportOpen} onSubmit={submitReport} onCancel={() => setReportOpen(false)} />
    </div>
  );
}
