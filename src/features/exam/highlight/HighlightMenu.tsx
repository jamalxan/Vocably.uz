'use client';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

// TZ-vocably-v2.md §6.3 — "Kontekst menyusi: Belgilash / Belgini olib
// tashlash / Eslatma qo'shish." Exam-only "boring on purpose" palette
// (`--exam-*` CSS o'zgaruvchilari, §5.1/5.2) — ilovaning qolgan qismidagi
// Tailwind rang tokenlari (`bg-surface`, `text-ink`...) BU YERDA ATAYLAB
// ishlatilmaydi, chunki ular ilova mavzusiga (dark mode va h.k.) bog'liq,
// imtihon ekrani esa hech qachon dark mode'ga o'tmaydi (§5.2).
export interface HighlightMenuProps {
  x: number;
  y: number;
  mode: 'select' | 'mark';
  onHighlight?: () => void;
  onRemove?: () => void;
  onAddNote?: () => void;
  onClose: () => void;
  // Klaviatura (Enter belgi ustida) orqali ochilganda true. Sichqoncha bilan
  // ochilganda fokus ko'chirilmaydi — aks holda brauzer matn tanlovini o'chiradi.
  autoFocus?: boolean;
}

const EDGE = 8;

// Popover'ni ekran chegarasida ushlab turadi: o'ngdan chiqsa chapga suriladi,
// pastdan chiqsa kursor ustiga ko'tariladi.
export function clampToViewport(x: number, y: number, width: number, height: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.max(EDGE, Math.min(x, vw - width - EDGE));
  const top = y + height > vh - EDGE ? Math.max(EDGE, y - height) : y;
  return { left, top };
}

export default function HighlightMenu({ x, y, mode, onHighlight, onRemove, onAddNote, onClose, autoFocus = false }: HighlightMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<Element | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    setPos(clampToViewport(x, y, el.offsetWidth, el.offsetHeight));
  }, [x, y, mode]);

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || []);

  // Klaviatura bilan ochilsa fokus birinchi bandga o'tadi; Escape/tanlovda oldingi joyga qaytadi.
  useEffect(() => {
    // StrictMode'da effekt ikki marta ishlaydi — menyu ichidagi elementni "oldingi" deb olmaymiz.
    if (!menuRef.current?.contains(document.activeElement)) returnFocusRef.current = document.activeElement;
    if (autoFocus) menuItems()[0]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreFocus = () => {
    const prev = returnFocusRef.current;
    // Forma maydoniga qaytarilmaydi — mobil'da klaviatura kutilmaganda ochilmasin.
    if (prev instanceof HTMLElement && prev.isConnected && !prev.matches('input, textarea, select, [contenteditable="true"]')) {
      prev.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    // `click` emas `pointerdown`: menyuni ochgan mouseup/contextmenu'ning
    // davomi (click, document'gacha ko'tariladigan contextmenu) uni darhol yopmasin.
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        restoreFocus();
        onClose();
        return;
      }
      // Sichqoncha bilan ochilgan menyuga ham strelka bilan kirish mumkin.
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !menuRef.current?.contains(document.activeElement)) {
        const items = menuItems();
        if (items.length === 0) return;
        e.preventDefault();
        items[e.key === 'ArrowDown' ? 0 : items.length - 1].focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = menuItems();
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'ArrowDown' ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
    items[next].focus();
  };

  const choose = (action?: () => void) => {
    restoreFocus();
    action?.();
    onClose();
  };

  const itemStyle: React.CSSProperties = { color: 'var(--exam-text)' };
  const itemClass =
    'w-full text-left px-3 py-2 min-h-11 md:min-h-0 hover:bg-[var(--exam-chrome)] focus-visible:outline-none focus-visible:bg-[var(--exam-chrome)]';

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Matnni belgilash"
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 50,
        background: 'var(--exam-bg)',
        border: '1px solid var(--exam-chrome-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,.18)',
        borderRadius: 8,
        minWidth: 180,
        overflow: 'hidden',
      }}
      className="py-1 text-sm"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={handleMenuKeyDown}
    >
      {mode === 'select' && (
        <button type="button" role="menuitem" onClick={() => choose(onHighlight)} style={itemStyle} className={itemClass}>
          Belgilash
        </button>
      )}
      {mode === 'mark' && (
        <>
          <button type="button" role="menuitem" onClick={() => choose(onAddNote)} style={itemStyle} className={itemClass}>
            Eslatma qo&apos;shish
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onRemove)}
            style={{ color: 'var(--exam-danger)' }}
            className={itemClass}
          >
            Belgini olib tashlash
          </button>
        </>
      )}
    </div>
  );
}
