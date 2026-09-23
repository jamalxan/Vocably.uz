'use client';
import { useEffect, useId, useRef } from 'react';
import { Trophy, RotateCcw, X } from 'lucide-react';

// O'yin/mashq tugaganda natijani ko'rsatadigan umumiy modal — avval bu joyda alert() ishlatilardi,
// bu esa ilovaning boshqa qismidagi uslubdan (ConfirmModal, UndoToast) butunlay chetga chiqardi.
export default function SessionCompleteCard({ open, title = 'Yakunlandi!', score, total, onRestart, onClose, children }) {
  const dialogRef = useRef(null);
  const restartRef = useRef(null);
  const titleId = useId();

  // Ochilganda fokusni oldingi joyini eslab qolamiz, yopilganda (element hali sahifada bo'lsa) qaytaramiz.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    restartRef.current?.focus();
    return () => {
      if (prev instanceof HTMLElement && document.contains(prev)) prev.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      // Tab fokusni modal ichida aylantiradi.
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface rounded-2xl shadow-card border border-border p-6 w-full max-w-sm text-center max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
          <Trophy size={26} />
        </div>
        <h3 id={titleId} className="font-bold text-ink font-display text-lg mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted mb-5">
          Natija: <span className="font-bold text-accent">{score}</span>/{total}{' '}
          <span className="text-muted">({pct}%)</span>
        </p>
        {children}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-11 bg-bg hover:bg-primary-soft text-muted rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={15} /> Yopish
          </button>
          <button
            type="button"
            ref={restartRef}
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-11 bg-accent hover:bg-accent-hover text-on-accent rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <RotateCcw size={15} /> Qayta boshlash
          </button>
        </div>
      </div>
    </div>
  );
}
