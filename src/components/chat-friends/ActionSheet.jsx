'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useIsPointer } from '@/lib/hooks/useIsPointer';

// Umumiy amallar menyusi (ConversationList'dagi ChatMenu'dan umumlashtirilgan, PARITY_PLAN WP4):
// sensorli qurilmada — pastdan chiquvchi varaq (bottom sheet), sichqonchali qurilmada (WP8.9,
// `useIsPointer`) — `anchorRef` tugmasiga yoki `anchorPoint` (o'ng tugma bosilgan nuqta) ga
// bog'langan popover. Escape va tashqariga bosish yopadi, yopilganda fokus qaytadi.
// `children` — ixtiyoriy maxsus tarkib (CallErrorSheet, ReactionBar kabi), `items` dan oldin.
// Rol: standart — `dialog` (elementlar oddiy tugma, almashtirgichlarda `aria-pressed`; E2E
// `getByRole('button')` ga tayanadi); `role="menu"` berilsa — menuitem/menuitemcheckbox.
// Animatsiyalar (chat-sheet-in / chat-pop-in) globals.css'da, reduced-motion'da o'chadi.

/** Eski nom (WP4) — kenglik bo'yicha; yangi kod `useIsPointer` ishlatadi. */
export function useIsLg() {
  return useMediaQuery('(min-width: 1024px)');
}

const GAP = 6;
const EDGE = 8;

// `showTitle={false}` — sarlavha faqat aria-label sifatida (xabar menyusi); `widthClass` — popover kengligi.
export default function ActionSheet({ open, title, items = [], onClose, anchorRef, anchorPoint = null, testid, children, role: roleProp, layerClass = 'z-50', showTitle = true, widthClass = 'w-72' }) {
  const isPointer = useIsPointer();
  const popover = isPointer && (!!anchorRef || !!anchorPoint);
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const first = panelRef.current?.querySelector('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
    first?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (prev instanceof HTMLElement && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [open]);

  // Popover joylashuvi: tugma (yoki bosilgan nuqta) ostida; pastda joy yetmasa — ustida. Gorizontal:
  // tugmaning o'ng chetiga tekislanadi (nuqtada — nuqtadan o'ngga), ekrandan chiqsa siljitiladi.
  const pointX = anchorPoint?.x;
  const pointY = anchorPoint?.y;
  useLayoutEffect(() => {
    if (!open || !popover) return undefined;
    const place = () => {
      const panel = panelRef.current;
      const r = typeof pointX === 'number' ? { left: pointX, right: pointX, top: pointY, bottom: pointY } : anchorRef?.current?.getBoundingClientRect();
      if (!r || !panel) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = typeof pointX === 'number' ? r.left : r.right - w;
      left = Math.min(Math.max(EDGE, left), vw - w - EDGE);
      let top = r.bottom + GAP;
      if (top + h > vh - EDGE && r.top - GAP - h >= EDGE) top = r.top - GAP - h;
      top = Math.max(EDGE, Math.min(top, vh - h - EDGE));
      setPos({ top: Math.round(top), left: Math.round(left) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, popover, anchorRef, pointX, pointY]);

  if (!open) return null;

  const menuRole = roleProp === 'menu' ? 'menu' : 'dialog';
  const list = items.map(({ key, label, icon: Icon, onSelect, pressed, danger, testid: itemTestid, disabled }) => (
    <button
      key={key}
      type="button"
      role={menuRole === 'menu' ? (typeof pressed === 'boolean' ? 'menuitemcheckbox' : 'menuitem') : undefined}
      aria-checked={menuRole === 'menu' && typeof pressed === 'boolean' ? pressed : undefined}
      aria-pressed={menuRole !== 'menu' && typeof pressed === 'boolean' ? pressed : undefined}
      disabled={disabled}
      data-testid={itemTestid}
      onClick={() => {
        onClose?.();
        onSelect?.();
      }}
      className={`w-full ${popover ? 'min-h-10' : 'min-h-12'} flex items-center gap-3 px-4 rounded-xl text-sm font-medium text-left transition-colors hover:bg-bg-sunken disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${danger ? 'text-danger' : 'text-ink'}`}
    >
      {Icon && <Icon size={18} className={`flex-shrink-0 ${pressed ? 'text-accent' : ''}`} aria-hidden="true" />}
      <span className="flex-1 min-w-0 truncate">{label}</span>
    </button>
  ));

  if (popover) {
    return (
      <div
        className={`fixed inset-0 ${layerClass}`}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose?.();
        }}
      >
        <div
          ref={panelRef}
          role={menuRole}
          aria-label={title}
          data-testid={testid}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
          className={`fixed ${widthClass} max-w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] overflow-auto bg-surface border border-border rounded-2xl shadow-card p-1.5 chat-pop-in`}
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: 'hidden' }}
        >
          {title && showTitle && <p className="px-4 py-1.5 text-xs font-semibold text-muted truncate">{title}</p>}
          {children}
          {list}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} className={`fixed inset-0 ${layerClass} flex items-end justify-center bg-primary/40 backdrop-blur-sm chat-fade-in`}>
      <div
        ref={panelRef}
        role={menuRole}
        aria-modal={menuRole === 'menu' ? undefined : 'true'}
        aria-label={title}
        data-testid={testid}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85dvh] overflow-auto bg-surface border-t border-border rounded-t-2xl shadow-card p-2 chat-sheet-in"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {title && showTitle && <p className="px-4 py-2 text-xs font-semibold text-muted truncate">{title}</p>}
        {children}
        {list}
      </div>
    </div>
  );
}
