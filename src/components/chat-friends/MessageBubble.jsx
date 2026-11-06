'use client';
import { useT } from '@/context/LocaleContext';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCheck,
  CheckSquare,
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
  Pause,
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
import { PAUSE_MEDIA_EVENT, pauseOtherMedia } from '@/lib/chat/mediaControl';
import { parseMessageFormatting } from '@/lib/chatFormatting';
import { albumRows } from '@/lib/chat/albums';
import { formatBytes, fileExtension } from '@/lib/chat/mediaMeta';
import DeleteMessageModal from './DeleteMessageModal';
import ForwardMessageModal from './ForwardMessageModal';
import ReportReasonModal from './ReportReasonModal';
import CallBubble from './CallBubble';

// Message bubbles (Telegram parity): albums, local previews with upload progress, file cards with
// name/size, voice with waveform + speed, forwarded label, reply quote with thumbnail, swipe-to-reply,
// multi-select. Context menu: "..." / right-click / long-press.
const LONG_PRESS_MS = 500;
const SWIPE_REPLY_PX = 56;
const SPEEDS = [1, 1.5, 2];

const idOf = (m) => String(m.id || m._id);

function MediaError() {
  const { t } = useT();
  return <p className="text-xs text-muted italic">{t('mb.loadFail')}</p>;
}

function useDialogFocus(initialRef, onClose) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });
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

/** Legacy single-image lightbox — the profile gallery still uses it. */
export function ImageLightbox({ url, onClose }) {
  const { t } = useT();
  const closeRef = useRef(null);
  useDialogFocus(closeRef, onClose);
  return (
    <div role="dialog" aria-modal="true" aria-label={t('ch.photoAlt')} onClick={onClose} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out">
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t('ch.close')}
        className="absolute top-3 right-3 w-11 h-11 inline-flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={t('ch.photoAlt')} className="max-w-full max-h-full rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------- upload overlay (progress ring + cancel)
function UploadOverlay({ message }) {
  const { t } = useT();
  const { cancelUpload, retryMessage } = useChat();
  const status = message._status;
  if (status !== 'uploading' && status !== 'failed') return null;
  const pct = Math.round((message._upload?.progress || 0) * 100);
  const C = 2 * Math.PI * 20;
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/35 rounded-lg" data-testid="upload-overlay">
      {status === 'uploading' ? (
        <button
          type="button"
          onClick={() => cancelUpload(message.clientMessageId)}
          aria-label={t('ch.cancelUpload')}
          title={t('ch.cancelUpload')}
          className="relative w-12 h-12 rounded-full bg-black/55 text-white grid place-items-center"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} className="transition-[stroke-dashoffset] duration-200" />
          </svg>
          <X size={16} />
          <span className="sr-only">{pct}%</span>
        </button>
      ) : (
        <button type="button" onClick={() => retryMessage(message)} className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-xs font-semibold px-3 py-1.5">
          <AlertCircle size={14} /> {t('mb.retry')}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- image / video / album tiles
function useMediaUrl(message, media) {
  const [viewRef, inView] = useInViewport();
  const { url: signed, error } = useAuthedMediaUrl(!message._localUrl && inView && media?.key ? media.key : null);
  return { viewRef, url: message._localUrl || signed, error };
}

/** Keeps the bubble the final picture's shape before it loads (no layout jump). */
function aspectStyle(media, maxW, maxH) {
  const w = media?.width;
  const h = media?.height;
  if (!w || !h) return { width: maxW * 0.8, height: maxH * 0.6 };
  const scale = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.max(96, Math.round(w * scale)), height: Math.max(72, Math.round(h * scale)) };
}

function ImageBubble({ message, onOpen }) {
  const { t } = useT();
  const { viewRef, url, error } = useMediaUrl(message, message.media);
  const box = aspectStyle(message.media, 280, 320);
  if (error) return <MediaError />;
  return (
    <div className="relative" style={{ maxWidth: '100%' }}>
      <button
        ref={viewRef}
        type="button"
        onClick={() => url && onOpen?.()}
        aria-label={t('ch.zoom')}
        className="block max-w-full rounded-lg overflow-hidden bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={box}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={message.text || t('ch.photoAlt')} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <span className="block w-full h-full animate-pulse" />
        )}
      </button>
      <UploadOverlay message={message} />
    </div>
  );
}

function VideoBubble({ message, onOpen }) {
  const { viewRef, url, error } = useMediaUrl(message, message.media);
  if (error) return <MediaError />;
  if (message.media?.round) return <RoundVideo url={url} viewRef={viewRef} />;
  const box = aspectStyle(message.media, 300, 320);
  return (
    <div className="relative" style={{ maxWidth: '100%' }}>
      <div ref={viewRef} className="rounded-lg overflow-hidden bg-black" style={box}>
        {url ? (
          <video src={url} controls playsInline preload="metadata" data-chat-media="" className="w-full h-full object-contain" onDoubleClick={onOpen} />
        ) : (
          <span className="block w-full h-full bg-primary-soft animate-pulse" />
        )}
      </div>
      <UploadOverlay message={message} />
    </div>
  );
}

function AlbumTile({ message, onOpen }) {
  const { t } = useT();
  const { viewRef, url, error } = useMediaUrl(message, message.media);
  const isVideo = message.type === 'video';
  return (
    <div className="relative w-full h-full">
      <button ref={viewRef} type="button" onClick={() => url && onOpen?.()} aria-label={isVideo ? t('ch.attVideo') : t('ch.zoom')} className="block w-full h-full bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {error ? (
          <span className="grid place-items-center w-full h-full text-[10px] text-muted">{t('mb.loadFail')}</span>
        ) : url ? (
          isVideo ? (
            <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
          )
        ) : (
          <span className="block w-full h-full animate-pulse" />
        )}
        {isVideo && url && (
          <span className="absolute inset-0 grid place-items-center pointer-events-none">
            <span className="w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center"><Play size={16} className="ml-0.5" /></span>
          </span>
        )}
      </button>
      <UploadOverlay message={message} />
    </div>
  );
}

/** Telegram-style mosaic for 2–10 photos/videos sent together. */
export function AlbumGrid({ messages, onOpen }) {
  const rows = albumRows(messages.length);
  const slices = [];
  for (let start = 0, r = 0; r < rows.length; r++) {
    slices.push(messages.slice(start, start + rows[r]));
    start += rows[r];
  }
  return (
    <div className="flex flex-col gap-0.5 w-[300px] max-w-full" data-testid="album">
      {slices.map((slice, r) => {
        const count = slice.length;
        return (
          <div key={r} className="flex gap-0.5" style={{ height: count === 1 ? 200 : 128 }}>
            {slice.map((m) => (
              <div key={m.clientMessageId || idOf(m)} className="flex-1 min-w-0 rounded-md overflow-hidden">
                <AlbumTile message={m} onOpen={() => onOpen?.(m)} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function RoundVideo({ url, viewRef }) {
  const { t } = useT();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const size = 'w-52 h-52 sm:w-60 sm:h-60';
  if (!url) return <div ref={viewRef} className={`${size} rounded-full bg-primary-soft animate-pulse`} />;
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      pauseOtherMedia(v);
      v.muted = false;
      v.play().catch(() => {});
    } else v.pause();
  };
  const C = 2 * Math.PI * 49;
  return (
    <button ref={viewRef} type="button" onClick={toggle} aria-label={playing ? t('mb.pauseVideo') : t('mb.playVideo')} className={`relative block ${size} rounded-full overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
      <video
        ref={videoRef}
        src={url}
        playsInline
        preload="metadata"
        data-chat-media=""
        className="w-full h-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={(e) => {
          setPlaying(false);
          setProgress(0);
          e.currentTarget.currentTime = 0;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" aria-hidden="true">
        <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" />
      </svg>
      {!playing && (
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-black/45 text-white grid place-items-center"><Play size={20} className="ml-0.5" /></span>
        </span>
      )}
    </button>
  );
}

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- voice (waveform + speed)
function VoiceBubble({ message, isMine }) {
  const { t } = useT();
  const media = message.media || {};
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(media.durationSec || 0);
  const [speed, setSpeed] = useState(1);
  const { url: signed, error } = useAuthedMediaUrl(armed && !message._localUrl ? media.key : null);
  const url = armed ? message._localUrl || signed : null;
  const bars = media.waveform?.length ? media.waveform : Array.from({ length: 40 }, (_, i) => 8 + ((i * 7) % 11));

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const onPlayRequest = () => {
      if (audioRef.current) {
        pauseOtherMedia(audioRef.current);
        audioRef.current.play().catch(() => {});
      } else setArmed(true);
    };
    el.addEventListener('voice-play', onPlayRequest);
    return () => el.removeEventListener('voice-play', onPlayRequest);
  }, []);
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, url]);

  const playNext = () => {
    const all = Array.from(document.querySelectorAll('[data-voice-bubble]'));
    const next = all[all.indexOf(rootRef.current) + 1];
    next?.dispatchEvent(new Event('voice-play'));
  };
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return setArmed(true);
    if (a.paused) {
      pauseOtherMedia(a);
      a.play().catch(() => {});
    } else a.pause();
  };
  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * a.duration;
  };

  if (error) return <MediaError />;
  const loading = (armed && !url) || message._status === 'uploading';
  const pct = dur ? Math.min(100, (pos / dur) * 100) : 0;
  const tone = isMine ? 'bg-on-accent text-accent' : 'bg-accent text-on-accent';
  const played = isMine ? 'bg-on-accent' : 'bg-accent';
  const rest = isMine ? 'bg-on-accent/35' : 'bg-accent/30';

  return (
    <div ref={rootRef} data-voice-bubble="" className="flex items-center gap-2.5 w-60 max-w-full py-0.5" data-testid="voice-bubble">
      <button type="button" onClick={toggle} aria-label={playing ? t('mb.pauseVoice') : t('mb.playVoice')} className={`w-10 h-10 rounded-full grid place-items-center flex-shrink-0 ${tone} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
        {loading ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div role="presentation" onClick={seek} className="relative h-7 flex items-center gap-[2px] cursor-pointer" aria-hidden="true">
          {bars.map((b, i) => {
            const on = (i / bars.length) * 100 < pct;
            return <span key={i} className={`flex-1 rounded-full ${on ? played : rest}`} style={{ height: `${Math.max(12, (b / 31) * 100)}%` }} />;
          })}
        </div>
        <div className={`mt-0.5 flex items-center gap-2 text-[11px] tabular-nums ${isMine ? 'text-on-accent/75' : 'text-muted'}`}>
          <span>{playing || pos > 0 ? `${fmtTime(pos)} / ${fmtTime(dur)}` : dur ? fmtTime(dur) : t('ch.voiceMsg')}</span>
          {(playing || pos > 0) && (
            <button type="button" onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} aria-label={t('ch.speed')} className={`ml-auto rounded px-1.5 font-semibold ${isMine ? 'bg-on-accent/20' : 'bg-accent/15 text-accent'}`}>
              {speed}×
            </button>
          )}
        </div>
      </div>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          autoPlay
          preload="auto"
          data-chat-media=""
          className="hidden"
          onPlay={(e) => {
            pauseOtherMedia(e.currentTarget);
            e.currentTarget.playbackRate = speed;
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
          onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            setPos(0);
            playNext();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- file card
function FileBubble({ message, isMine }) {
  const { t } = useT();
  const media = message.media || {};
  const [viewRef, inView] = useInViewport();
  const { url, error } = useAuthedMediaUrl(inView && media.key ? media.key : null);
  const ext = fileExtension(media.name, media.mimeType);
  const name = media.name || t('mb.file');
  const uploading = message._status === 'uploading';
  const pct = Math.round((message._upload?.progress || 0) * 100);
  const inner = (
    <>
      <span className={`relative w-10 h-10 rounded-lg grid place-items-center flex-shrink-0 ${isMine ? 'bg-on-accent/20' : 'bg-accent-soft text-accent'}`}>
        <FileText size={18} />
        {ext && <span className="absolute -bottom-1 inset-x-0 text-center text-[8px] font-bold uppercase tracking-wide">{ext.slice(0, 4)}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold truncate max-w-[200px]">{name}</span>
        <span className={`block text-[11px] tabular-nums ${isMine ? 'text-on-accent/75' : 'text-muted'}`}>
          {uploading ? `${t('ch.uploading')} ${pct}%` : error ? t('mb.loadFail') : formatBytes(media.size)}
        </span>
      </span>
      {url && !uploading && <Download size={16} className="flex-shrink-0 opacity-80" aria-hidden="true" />}
    </>
  );
  const cls = `flex items-center gap-3 pr-1 py-0.5 w-64 max-w-full rounded-lg ${isMine ? 'text-on-accent' : 'text-ink'}`;
  if (!url || uploading) {
    return (
      <div className="relative">
        <span ref={viewRef} className={cls} aria-disabled="true" data-testid="file-bubble">{inner}</span>
        {uploading && (
          <div className="mt-1 h-1 rounded-full bg-black/15 overflow-hidden"><div className={`h-full ${isMine ? 'bg-on-accent' : 'bg-accent'}`} style={{ width: `${pct}%` }} /></div>
        )}
        {message._status === 'failed' && <UploadOverlay message={message} />}
      </div>
    );
  }
  return (
    <a href={url} download={media.name || true} target="_blank" rel="noreferrer" className={`${cls} hover:opacity-90`} data-testid="file-bubble" title={t('ch.download')}>
      {inner}
    </a>
  );
}

// ---------------------------------------------------------------- reply quote (with thumbnail)
function ReplyThumb({ mediaKey }) {
  const { url } = useAuthedMediaUrl(mediaKey);
  if (!url) return <span className="w-8 h-8 rounded bg-black/10 flex-shrink-0" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />;
}

function ReplyQuote({ replyTo, isMine, myId, otherUsername, onClick }) {
  const { t, ts } = useT();
  const senderLabel = String(replyTo.senderId) === String(myId) ? t('ch.youRaw') : otherUsername ? `@${otherUsername}` : t('ch.user');
  const preview = replyTo.deleted ? t('mb.deleted') : replyTo.type === 'text' ? replyTo.text : ts(REPLY_TYPE_LABEL[replyTo.type] || '');
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full text-left mb-1.5 pl-2 pr-1 py-0.5 border-l-2 rounded-sm ${isMine ? 'border-on-accent/50 hover:bg-on-accent/10' : 'border-accent hover:bg-primary-soft/40'} transition-colors`}
    >
      {replyTo.mediaKey && !replyTo.deleted && <ReplyThumb mediaKey={replyTo.mediaKey} />}
      <span className="min-w-0">
        <span className={`block text-xs font-semibold truncate ${isMine ? 'text-on-accent/90' : 'text-accent'}`}>{senderLabel}</span>
        <span className={`block text-xs truncate ${isMine ? 'text-on-accent/70' : 'text-muted'}`}>{preview || '…'}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------- context menu
function MessageContextMenu({ actions, onClose }) {
  const { t } = useT();
  const firstRef = useRef(null);
  useDialogFocus(firstRef, onClose);
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label={t('mb.actions')} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-surface border-t border-border rounded-t-2xl shadow-card p-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        {actions.map(({ key, label, Icon, onClick, danger }, i) => (
          <button
            key={key}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            onClick={() => {
              onClose();
              onClick();
            }}
            className={`w-full min-h-12 flex items-center gap-3 px-4 rounded-xl text-sm font-medium text-left transition-colors hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${danger ? 'text-danger' : 'text-ink'}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- text helpers
const ZWJ = '‍';
const VARIATION_SELECTOR = '️';
const EMOJI_ONLY_RE = new RegExp(`^[\\p{Extended_Pictographic}${ZWJ}${VARIATION_SELECTOR}\\u{1F3FB}-\\u{1F3FF}\\s]+$`, 'u');
function isEmojiOnly(text) {
  if (!text || text.length > 30) return false;
  return EMOJI_ONLY_RE.test(text);
}
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
    } else nodes.push(seg);
  });
  return nodes;
}
function renderFormattedText(text) {
  return parseMessageFormatting(text).map((tok, i) => {
    if (tok.type === 'bold') return <strong key={i}>{linkifyText(tok.value)}</strong>;
    if (tok.type === 'italic') return <em key={i}>{linkifyText(tok.value)}</em>;
    return <Fragment key={i}>{linkifyText(tok.value)}</Fragment>;
  });
}
// Qo'ng'iroq boshlanganda (CallProvider PAUSE_MEDIA_EVENT yuboradi) barcha chat mediasi to'xtaydi.
// Bitta global tinglovchi — har bir pufakcha uchun alohida emas.
let pauseListenerInstalled = false;
function installPauseListener() {
  if (pauseListenerInstalled || typeof window === 'undefined') return;
  pauseListenerInstalled = true;
  window.addEventListener(PAUSE_MEDIA_EVENT, () => pauseOtherMedia(null));
}

function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Status ticks (own messages): clock → ✓ → ✓✓ → ✓✓ coloured; failed → retry. */
function Ticks({ message, otherOnline, t, retryMessage }) {
  if (message._status === 'uploading') return <span title={t('ch.uploading')} role="img" aria-label={t('ch.uploading')} className="inline-flex"><Clock size={12} /></span>;
  if (message._status === 'sending') return <span title={t('mb.sending')} role="img" aria-label={t('mb.sending')} className="inline-flex"><Clock size={12} /></span>;
  if (message._status === 'failed') {
    return (
      <button type="button" onClick={() => retryMessage(message)} title={t('mb.failed')} className="inline-flex items-center gap-0.5 text-danger hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger rounded">
        <AlertCircle size={12} /> {t('mb.retry')}
      </button>
    );
  }
  if (message.readAt) return <span title={t('mb.read')} role="img" aria-label={t('mb.read')} className="inline-flex"><CheckCheck size={13} className="text-accent" /></span>;
  if (otherOnline) return <span title={t('mb.delivered')} role="img" aria-label={t('mb.delivered')} className="inline-flex"><CheckCheck size={13} /></span>;
  return <span title={t('mb.sentOk')} role="img" aria-label={t('mb.sentOk')} className="inline-flex"><Check size={13} /></span>;
}

/**
 * One message, or an album (`album` = its messages; `message` is then the first one).
 * Selection mode: a tap toggles the checkbox instead of opening anything.
 */
export default function MessageBubble({ message, album = null, isMine, myId, onJumpToReply, onOpenMedia, selectionMode = false, selected = false, onToggleSelect, onEnterSelection }) {
  const { t, ts } = useT();
  const { reportTarget, activeConversation, startEditMessage, startReply, deleteMessage, retryMessage, livePresence, pinMessage, unpinMessage, stickerById } = useChat();
  const otherOnline = isOnline(activeConversation?.otherUser?.lastActiveAt, livePresence[String(activeConversation?.otherUser?.id)]);
  const [reported, setReported] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [swipe, setSwipe] = useState(0);
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);
  const swipeStart = useRef(null);
  useEffect(() => {
    installPauseListener();
  }, []);

  const sticker = message.type === 'sticker' ? stickerById?.get(String(message.stickerId)) || findSticker(message.stickerId) : null;
  const deleted = !!message.deletedForEveryone;
  const emojiOnly = !deleted && message.type === 'text' && isEmojiOnly(message.text);
  const messages = album || [message];
  const messageIdStr = idOf(message);
  const isPending = messages.some((m) => m._status === 'sending' || m._status === 'failed' || m._status === 'uploading');
  const isPlain = !deleted && (message.type === 'sticker' || emojiOnly || (message.type === 'video' && message.media?.round && !message.text));
  const canEdit = isMine && message.type === 'text' && !deleted && !isPending;
  const canReport = !isMine && !reported && !isPending;
  const isPinned = !isPending && (activeConversation?.pinnedMessageIds || []).some((id) => String(id) === messageIdStr);
  const caption = album ? messages.find((m) => m.text)?.text || '' : message.text;
  // Qo'ng'iroq yozuvi (CALLS_SPEC §10.8): javob/nusxa/uzatish/qadash/tahrir/shikoyat yo'q, swipe va ticks yo'q.
  const isCall = message.type === 'call' && !deleted;

  const submitReport = async (category, note) => {
    setReportOpen(false);
    const ok = await reportTarget('message', messageIdStr, category, note);
    if (ok) setReported(true);
  };
  const handleDelete = async (forEveryone) => {
    setDeleting(true);
    let res = null;
    for (const m of messages) {
      res = await deleteMessage(idOf(m), forEveryone);
      if (res.error) break;
    }
    setDeleting(false);
    if (res?.error) alert(ts(res.error));
    else setDeleteOpen(false);
  };
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(caption || '');
    } catch {
      // clipboard blocked — nothing to show
    }
  };
  const handleTogglePin = async () => {
    const res = isPinned ? await unpinMessage(messageIdStr) : await pinMessage(messageIdStr);
    if (res?.error) alert(ts(res.error));
  };
  const replyTarget = () => startReply({ ...message, mediaKey: ['image', 'video'].includes(message.type) && !message.media?.round ? message.media?.key : null });

  const actions = isCall
    ? [
        { key: 'select', label: t('ch.select'), Icon: CheckSquare, onClick: () => onEnterSelection?.(messages) },
        { key: 'delete', label: t('ch.delete'), Icon: Trash2, onClick: () => setDeleteOpen(true), danger: true },
      ]
    : [
    { key: 'reply', label: t('mb.reply'), Icon: Reply, onClick: replyTarget },
    ...(caption ? [{ key: 'copy', label: t('mb.copy'), Icon: Copy, onClick: handleCopyText }] : []),
    { key: 'forward', label: t('mb.forward'), Icon: Forward, onClick: () => setForwardOpen(true) },
    { key: 'select', label: t('ch.select'), Icon: CheckSquare, onClick: () => onEnterSelection?.(messages) },
    { key: 'pin', label: isPinned ? t('cv.unpin') : t('mb.pin'), Icon: isPinned ? PinOff : Pin, onClick: handleTogglePin },
    ...(canEdit ? [{ key: 'edit', label: t('mb.edit'), Icon: Pencil, onClick: () => startEditMessage(message) }] : []),
    { key: 'delete', label: t('ch.delete'), Icon: Trash2, onClick: () => setDeleteOpen(true), danger: true },
    ...(canReport ? [{ key: 'report', label: t('mb.report'), Icon: Flag, onClick: () => setReportOpen(true) }] : []),
      ];

  // Right-click / long-press → menu; horizontal swipe on touch → reply (Telegram gesture, with the
  // visible "..." button as the always-available alternative).
  const interactive = !deleted && !isPending && !selectionMode;
  const onPointerDown = (e) => {
    if (!interactive) return;
    if (e.pointerType !== 'mouse') {
      swipeStart.current = { x: e.clientX, y: e.clientY };
      longPressFired.current = false;
      clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => {
        longPressFired.current = true;
        setMenuOpen(true);
      }, LONG_PRESS_MS);
    }
  };
  const onPointerMove = (e) => {
    if (!swipeStart.current || e.pointerType === 'mouse') return;
    if (isCall) {
      // swipe-to-reply yo'q; faqat siljish uzoq bosishni bekor qiladi
      if (Math.hypot(e.clientX - swipeStart.current.x, e.clientY - swipeStart.current.y) > 8) clearTimeout(pressTimer.current);
      return;
    }
    const dx = e.clientX - swipeStart.current.x;
    const dy = Math.abs(e.clientY - swipeStart.current.y);
    if (dy > 24) {
      swipeStart.current = null;
      setSwipe(0);
      clearTimeout(pressTimer.current);
      return;
    }
    const dir = isMine ? -1 : 1; // own messages swipe left, others right
    const d = Math.max(0, dx * dir);
    if (d > 8) clearTimeout(pressTimer.current);
    setSwipe(Math.min(SWIPE_REPLY_PX + 16, d));
  };
  const endSwipe = () => {
    clearTimeout(pressTimer.current);
    if (swipe >= SWIPE_REPLY_PX) replyTarget();
    setSwipe(0);
    swipeStart.current = null;
  };
  const triggerProps = interactive
    ? { onContextMenu: (e) => { e.preventDefault(); setMenuOpen(true); }, onPointerDown, onPointerMove, onPointerUp: endSwipe, onPointerLeave: endSwipe, onPointerCancel: endSwipe }
    : {};

  const openMedia = (m) => onOpenMedia?.(idOf(m || message));
  const body = deleted ? (
    <p className="flex items-center gap-1.5"><Trash2 size={13} /> {t('mb.deleted')}</p>
  ) : (
    <>
      {message.forwardedFrom && (
        <p className={`text-xs font-semibold mb-1 flex items-center gap-1 ${isMine ? 'text-on-accent/85' : 'text-accent'}`} data-testid="forwarded-label">
          <Forward size={12} /> {t('ch.forwardedFrom', { name: message.forwardedFrom.name || t('ch.user') })}
        </p>
      )}
      {message.replyTo && (
        <ReplyQuote replyTo={message.replyTo} isMine={isMine} myId={myId} otherUsername={activeConversation?.otherUser?.username} onClick={() => onJumpToReply?.(String(message.replyTo.messageId))} />
      )}
      {album ? (
        <AlbumGrid messages={messages} onOpen={openMedia} />
      ) : (
        <>
          {message.type === 'text' && (
            <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] font-chat ${emojiOnly ? 'text-4xl leading-tight' : ''}`}>{emojiOnly ? message.text : renderFormattedText(message.text)}</p>
          )}
          {message.type === 'sticker' &&
            (sticker ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={sticker.file} alt={sticker.label} draggable={false} className="w-32 h-32 md:w-36 md:h-36" />
            ) : (
              <p className="text-sm text-muted">{t('mb.sticker')}</p>
            ))}
          {message.type === 'image' && <ImageBubble message={message} onOpen={() => openMedia(message)} />}
          {message.type === 'video' && <VideoBubble message={message} onOpen={() => openMedia(message)} />}
          {message.type === 'voice' && <VoiceBubble message={message} isMine={isMine} />}
          {message.type === 'file' && <FileBubble message={message} isMine={isMine} />}
          {message.type === 'call' && (
            <CallBubble message={message} isMine={isMine} peer={activeConversation?.otherUser || null} timeLabel={formatMessageTime(message.createdAt)} selectionMode={selectionMode} />
          )}
        </>
      )}
      {caption && message.type !== 'text' && <p className="whitespace-pre-wrap [overflow-wrap:anywhere] font-chat mt-1.5">{renderFormattedText(caption)}</p>}
      {message.edited && <span className={`block text-[11px] mt-0.5 ${isMine ? 'text-on-accent/60' : 'text-muted'}`}>{t('mb.edited')}</span>}
    </>
  );

  return (
    <div
      data-msg-id={messageIdStr}
      className={`flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'} group ${selectionMode ? 'cursor-pointer' : ''} ${selected ? 'bg-accent-soft/60 -mx-4 px-4 rounded-lg' : ''}`}
      onClick={selectionMode ? () => onToggleSelect?.(messages) : undefined}
    >
      {selectionMode && !isMine && (
        <span className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-shrink-0 ${selected ? 'bg-accent border-accent text-on-accent' : 'border-border'}`} aria-hidden="true">
          {selected && <Check size={12} />}
        </span>
      )}
      <div className={`flex flex-col max-w-[85%] ${isMine ? 'items-end' : 'items-start'}`} style={swipe ? { transform: `translateX(${isMine ? -swipe : swipe}px)`, transition: 'none' } : undefined}>
        <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
          <div
            className={
              isPlain
                ? 'min-w-0 relative'
                : `min-w-0 relative rounded-2xl px-3.5 py-2.5 text-sm ${deleted ? 'bg-transparent border border-dashed border-border text-muted italic' : isMine ? 'bg-accent text-on-accent rounded-br-md' : 'bg-surface-2 text-ink rounded-bl-md'}`
            }
            {...triggerProps}
          >
            {swipe > 0 && (
              <span className={`absolute top-1/2 -translate-y-1/2 ${isMine ? '-right-10' : '-left-10'} w-8 h-8 rounded-full bg-surface-2 text-accent grid place-items-center shadow-card transition-opacity ${swipe >= SWIPE_REPLY_PX ? 'opacity-100' : 'opacity-50'}`} aria-hidden="true">
                <Reply size={14} />
              </span>
            )}
            {body}
          </div>
          {!deleted && !isPending && !selectionMode && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('mb.actions')}
              aria-haspopup="dialog"
              className="flex-shrink-0 w-11 min-h-11 lg:w-8 lg:min-h-8 -mx-1.5 -my-2 lg:mx-0 lg:my-0 inline-flex items-center justify-center text-muted hover:text-accent transition-colors touch-manipulation rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>
        <span className="flex items-center gap-1 text-[11px] text-muted mt-0.5 px-1 select-none">
          {formatMessageTime(message.createdAt)}
          {isMine && !deleted && !isCall && <Ticks message={messages.find((m) => m._status) || message} otherOnline={otherOnline} t={t} retryMessage={retryMessage} />}
        </span>
      </div>
      {selectionMode && isMine && (
        <span className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-shrink-0 ${selected ? 'bg-accent border-accent text-on-accent' : 'border-border'}`} aria-hidden="true">
          {selected && <Check size={12} />}
        </span>
      )}

      {menuOpen && <MessageContextMenu actions={actions} onClose={() => setMenuOpen(false)} />}
      <DeleteMessageModal open={deleteOpen} canDeleteForEveryone={isMine} otherUsername={activeConversation?.otherUser?.username} onConfirm={deleting ? undefined : handleDelete} onCancel={() => setDeleteOpen(false)} />
      <ForwardMessageModal open={forwardOpen} messages={messages} onClose={() => setForwardOpen(false)} />
      <ReportReasonModal open={reportOpen} onSubmit={submitReport} onCancel={() => setReportOpen(false)} />
    </div>
  );
}
