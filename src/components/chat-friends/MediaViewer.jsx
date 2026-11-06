'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn } from 'lucide-react';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';
import { useBackClose } from '@/lib/useBackClose';
import { useT } from '@/context/LocaleContext';

// Full-screen media viewer (Telegram parity): all photos/videos of the open chat in one strip —
// arrows, keyboard, swipe, double-tap zoom, caption, who/when, download. `items`:
// [{ id, type: 'image'|'video', key, localUrl?, caption, senderLabel, createdAt }], `index` = start.
const SWIPE_PX = 60;

function Slide({ item, active, zoomed, onToggleZoom }) {
  const { url: signed, error } = useAuthedMediaUrl(item.localUrl ? null : item.key);
  const url = item.localUrl || signed;
  const { t } = useT();
  if (error) return <p className="text-sm text-white/70">{t('mb.loadFail')}</p>;
  if (!url) return <div className="w-10 h-10 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-label={t('cv.loading')} />;
  if (item.type === 'video') {
    return <video src={url} controls playsInline autoPlay={active} className="max-w-full max-h-full rounded-lg" data-chat-media="" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={item.caption || t('ch.photoAlt')}
      onDoubleClick={onToggleZoom}
      draggable={false}
      className={`max-w-full max-h-full rounded-lg select-none transition-transform duration-200 ${zoomed ? 'scale-[2.2] cursor-zoom-out' : 'cursor-zoom-in'}`}
    />
  );
}

export default function MediaViewer({ items, index, onClose, onIndexChange, formatDate }) {
  const { t } = useT();
  const [i, setI] = useState(index);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef(null);
  const touchStart = useRef(null);
  const item = items[i];
  const go = useCallback(
    (d) => {
      setZoomed(false);
      setI((cur) => {
        const next = Math.max(0, Math.min(items.length - 1, cur + d));
        onIndexChange?.(next);
        return next;
      });
    },
    [items.length, onIndexChange]
  );

  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [go, onClose]);
  useBackClose(true, onClose);

  if (!item) return null;
  const download = async () => {
    try {
      const r = await fetch(`/api/chat/media/${item.key}`);
      const { url } = await r.json();
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.click();
    } catch {
      // nothing to do — the viewer stays
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ch.photoAlt')}
      className="fixed inset-0 z-[60] bg-black/95 text-white flex flex-col"
      data-testid="media-viewer"
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current == null || zoomed) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{item.senderLabel}</p>
          <p className="text-[11px] text-white/60 tabular-nums">{formatDate ? formatDate(item.createdAt) : new Date(item.createdAt).toLocaleString()}</p>
        </div>
        <span className="text-xs text-white/70 tabular-nums mr-1">{t('ch.viewerOf', { i: i + 1, n: items.length })}</span>
        {item.type === 'image' && (
          <button type="button" onClick={() => setZoomed((z) => !z)} aria-label={t('ch.zoom')} className="w-11 h-11 rounded-full hover:bg-white/10 grid place-items-center">
            <ZoomIn size={18} />
          </button>
        )}
        <button type="button" onClick={download} aria-label={t('ch.download')} title={t('ch.download')} className="w-11 h-11 rounded-full hover:bg-white/10 grid place-items-center">
          <Download size={18} />
        </button>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t('ch.close')} className="w-11 h-11 rounded-full hover:bg-white/10 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 overflow-hidden" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Slide key={item.id} item={item} active zoomed={zoomed} onToggleZoom={() => setZoomed((z) => !z)} />
        {i > 0 && (
          <button type="button" onClick={() => go(-1)} aria-label={t('ch.prevMedia')} title={t('ch.prevMedia')} className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 grid place-items-center">
            <ChevronLeft size={22} />
          </button>
        )}
        {i < items.length - 1 && (
          <button type="button" onClick={() => go(1)} aria-label={t('ch.nextMedia')} title={t('ch.nextMedia')} className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 grid place-items-center">
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {item.caption && (
        <p className="px-4 py-3 text-sm text-white/90 whitespace-pre-wrap [overflow-wrap:anywhere] max-h-28 overflow-y-auto" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          {item.caption}
        </p>
      )}
    </div>
  );
}
