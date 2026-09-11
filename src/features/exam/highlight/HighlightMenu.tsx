'use client';
import { useEffect } from 'react';

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
}

export default function HighlightMenu({ x, y, mode, onHighlight, onRemove, onAddNote, onClose }: HighlightMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    // Boshqa joyga bosilsa yoki boshqa joyda o'ng tugma bosilsa — menyu yopiladi.
    document.addEventListener('click', close);
    document.addEventListener('contextmenu', close);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('contextmenu', close);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const itemStyle: React.CSSProperties = { color: 'var(--exam-text)' };

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
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
    >
      {mode === 'select' && (
        <button
          onClick={() => {
            onHighlight?.();
            onClose();
          }}
          style={itemStyle}
          className="w-full text-left px-3 py-2 hover:bg-black/5"
        >
          Belgilash
        </button>
      )}
      {mode === 'mark' && (
        <>
          <button
            onClick={() => {
              onAddNote?.();
              onClose();
            }}
            style={itemStyle}
            className="w-full text-left px-3 py-2 hover:bg-black/5"
          >
            Eslatma qo&apos;shish
          </button>
          <button
            onClick={() => {
              onRemove?.();
              onClose();
            }}
            style={{ color: 'var(--exam-danger)' }}
            className="w-full text-left px-3 py-2 hover:bg-black/5"
          >
            Belgini olib tashlash
          </button>
        </>
      )}
    </div>
  );
}
