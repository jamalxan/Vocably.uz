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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      {/* Enter -> asosiy amal (tasdiqlash tugmasi type="submit") */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm?.();
        }}
        className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5 sm:p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <h3 className="font-bold text-slate-800 font-display">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
          >
            Bekor qilish
          </button>
          <button
            ref={confirmRef}
            type="submit"
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
