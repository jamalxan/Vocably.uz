'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';

// Umumiy amallar menyusi (ConversationList'dagi ChatMenu'dan umumlashtirilgan, PARITY_PLAN WP4):
// `lg`dan kichikda — pastdan chiquvchi varaq (bottom sheet), `lg` va undan kattada — `anchorRef`
// tugmasiga bog'langan popover. Escape va tashqariga bosish yopadi, yopilganda fokus qaytadi.
// `children` — ixtiyoriy maxsus tarkib (CallErrorSheet kabi), `items` o'rniga yoki qo'shimcha.

export function useIsLg() {
  return useMediaQuery('(min-width: 1024px)');
}

export default function ActionSheet({ open, title, items = [], onClose, anchorRef, testid, children, role: roleProp, layerClass = 'z-50' }) {
  const isLg = useIsLg();
  const popover = isLg && !!anchorRef;
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

  // Popover joylashuvi — tugma ostida, o'ng chetga tekislangan (sarlavhadagi ⋮).
  useLayoutEffect(() => {
    if (!open || !popover) return undefined;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      setPos({ top: Math.round(r.bottom + 6), right: Math.max(8, Math.round(window.innerWidth - r.right)) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, popover, anchorRef]);

  if (!open) return null;

  const menuRole = roleProp || (items.length && !children ? 'menu' : 'dialog');
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
      className={`w-full min-h-12 lg:min-h-10 flex items-center gap-3 px-4 rounded-xl text-sm font-medium text-left transition-colors hover:bg-bg-sunken disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${danger ? 'text-danger' : 'text-ink'}`}
    >
      {Icon && <Icon size={18} className={`flex-shrink-0 ${pressed ? 'text-accent' : ''}`} aria-hidden="true" />}
      <span className="flex-1 min-w-0 truncate">{label}</span>
    </button>
  ));

  if (popover) {
    return (
      <div className={`fixed inset-0 ${layerClass}`} onClick={onClose}>
        <div
          ref={panelRef}
          role={menuRole}
          aria-label={title}
          data-testid={testid}
          onClick={(e) => e.stopPropagation()}
          className="fixed w-72 max-w-[calc(100vw-1rem)] bg-surface border border-border rounded-2xl shadow-card p-1.5 motion-safe:transition-opacity"
          style={pos ? { top: pos.top, right: pos.right } : { visibility: 'hidden' }}
        >
          {title && <p className="px-4 py-1.5 text-xs font-semibold text-muted truncate">{title}</p>}
          {children}
          {list}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} className={`fixed inset-0 ${layerClass} flex items-end justify-center bg-primary/40 backdrop-blur-sm`}>
      <div
        ref={panelRef}
        role={menuRole === 'menu' ? 'menu' : 'dialog'}
        aria-modal={menuRole === 'menu' ? undefined : 'true'}
        aria-label={title}
        data-testid={testid}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border-t border-border rounded-t-2xl shadow-card p-2"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {title && <p className="px-4 py-2 text-xs font-semibold text-muted truncate">{title}</p>}
        {children}
        {list}
      </div>
    </div>
  );
}
