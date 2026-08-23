'use client';
import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel = "O'chirish", onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  // Modal ochilganda asosiy tugmaga fokus beramiz — shunda Enter darrov ishlaydi.
  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  // Escape — yopish. Modal ochiq bo'lgan paytdagina tinglaymiz.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      {/* Enter -> asosiy amal (tasdiqlash tugmasi type="submit") */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm?.();
        }}
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <h3 className="font-bold text-primary font-display">{title}</h3>
        </div>
        <p className="text-sm text-muted mb-5">{message}</p>
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
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
