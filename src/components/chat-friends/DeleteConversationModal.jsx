'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

// DeleteMessageModal bilan bir xil uslub, lekin butun suhbat uchun: xabar
// o'chirishdan farqli, bu yerda "ikkala tomon uchun" har doim tanlash mumkin —
// ikkala qatnashchi ham suhbatning teng egasi (faqat "o'z xabari" cheklovi yo'q).
export default function DeleteConversationModal({ open, otherUsername, onConfirm, onCancel }) {
  const [forEveryone, setForEveryone] = useState(false);
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();

  // C-01 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2) — fokus ATAYLAB "Bekor
  // qilish"ga qo'yiladi, "O'chirish"ga EMAS: bu modal ConversationList'dagi
  // uzoq-bosish/kontekst-menyu orqali tasodifan ochilishi mumkin (masalan
  // oddiy sichqon bosishi 500ms'dan sal uzoqroq cho'zilsa) — agar fokus
  // destruktiv tugmada tursa, keyingi tasodifiy Enter/Space suhbatni jimgina
  // o'chirib yuboradi. Xavfsiz standart — har doim "yo'q" tomonga fokus.
  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    setForEveryone(false);
    cancelRef.current?.focus();
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
          <h3 id={titleId} className="font-bold text-ink font-display">Suhbatni tozalash</h3>
        </div>

        <p className="text-sm text-muted mb-3">
          @{otherUsername || 'foydalanuvchi'} bilan bo'lgan suhbat ro'yxatdan o'chiriladi. Keyinroq qidiruvdan topib
          qayta yozishingiz mumkin.
        </p>

        <label className="flex items-center gap-2.5 mb-5 px-3 py-2.5 bg-bg rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={forEveryone}
            onChange={(e) => setForEveryone(e.target.checked)}
            className="w-4 h-4 accent-accent flex-shrink-0"
          />
          <span className="text-sm text-ink">
            @{otherUsername || 'foydalanuvchi'} uchun ham o'chirilsinmi? (ikkala tomondan)
          </span>
        </label>

        <div className="flex gap-3">
          <button
            ref={cancelRef}
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
