'use client';
import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useDialogFocus } from '@/features/exam/state/useDialogFocus';

export default function ConfirmModal({ open, title, message, confirmLabel = "O'chirish", onConfirm, onCancel }) {
  const confirmRef = useRef(null);
  const titleId = useId();
  const msgId = useId();

  // Modal ochilganda asosiy tugmaga fokus beramiz — shunda Enter darrov ishlaydi.
  // Tab modal ichida qoladi, yopilganda fokus ochgan tugmaga qaytadi.
  const dialogRef = useDialogFocus(open, confirmRef);

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

  // Ochiq paytda orqadagi sahifa scroll bo'lmasin.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      {/* Enter -> asosiy amal (tasdiqlash tugmasi type="submit") */}
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? msgId : undefined}
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm?.();
        }}
        className="bg-surface rounded-2xl shadow-card border border-border p-5 sm:p-6 w-full max-w-sm min-w-0 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <h3 id={titleId} className="font-bold text-ink font-display min-w-0 break-words">
            {title}
          </h3>
        </div>
        <p id={msgId} className="text-sm text-muted mb-5 break-words [overflow-wrap:anywhere]">
          {message}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Bekor qilish
          </Button>
          <Button ref={confirmRef} type="submit" className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
