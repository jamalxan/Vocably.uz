'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

// Telegram uslubidagi ikki bosqichli o'chirish: sukut bo'yicha "faqat men uchun",
// lekin xabar egasi bo'lsa "@user uchun ham o'chirilsinmi?" katakchasi belgilanishi
// mumkin — belgilansa ikkala tomondan ham (deletedForEveryone) o'chadi.
export default function DeleteMessageModal({ open, canDeleteForEveryone, otherUsername, onConfirm, onCancel }) {
  const [forEveryone, setForEveryone] = useState(false);
  const confirmRef = useRef(null);
  const titleId = useId();

  // Ochilganda fokus tasdiqlash tugmasiga, yopilganda avvalgi elementga qaytadi.
  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    setForEveryone(false);
    confirmRef.current?.focus();
    return () => {
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm?.(forEveryone);
        }}
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} />
          </div>
          <h3 id={titleId} className="font-bold text-ink font-display">Xabarni o'chirish</h3>
        </div>

        {canDeleteForEveryone && (
          <label className="flex items-center gap-2.5 mb-5 px-3 py-2.5 bg-bg rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forEveryone}
              onChange={(e) => setForEveryone(e.target.checked)}
              className="w-4 h-4 accent-accent flex-shrink-0"
            />
            <span className="text-sm text-ink">
              @{otherUsername || 'foydalanuvchi'} uchun ham o'chirilsinmi?
            </span>
          </label>
        )}
        {!canDeleteForEveryone && (
          <p className="text-sm text-muted mb-5">Xabar faqat sizning tarafingizdan o'chiriladi.</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-bg hover:bg-primary-soft text-muted rounded-xl text-sm font-semibold transition-colors"
          >
            Bekor qilish
          </button>
          <button
            ref={confirmRef}
            type="submit"
            className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-on-accent rounded-xl text-sm font-semibold transition-colors"
          >
            O'chirish
          </button>
        </div>
      </form>
    </div>
  );
}
