'use client';
import { useEffect, useRef } from 'react';
import { useExamStore } from '../state/examStore';
import { useDialogFocus } from '../state/useDialogFocus';

// TZ-vocably-v2.md §9.3 — Yakunlash tasdiqlash:
//   Yakunlashni xohlaysizmi?
//   Javobsiz savollar: 4 ta  (12, 19, 27, 38)
//   [Orqaga qaytish]  [Ha, yakunlash]
// Imtihon HALI davom etayotgan paytda ko'rsatiladi (Writing'ning oxirgi
// "Yakunlash" bosilganda) — shuning uchun `[data-exam]` uslubida.
export interface ConfirmFinishModalProps {
  unansweredNumbers: number[];
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmFinishModal({ unansweredNumbers, onCancel, onConfirm }: ConfirmFinishModalProps) {
  // §13 — Escape = bekor qilish (xavfsiz tomon: imtihonni tasodifan
  // yakunlab qo'ymaslik uchun Enter emas, Escape faqat "Orqaga qaytish"ga teng).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const highContrast = useExamStore((s) => s.highContrast);
  // Xavfsiz standart: fokus "Go back" tugmasida.
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(true, cancelRef);

  // `[data-exam]` o'z fonini beradi — shuning uchun u overlay'da emas, dialog qutisida.
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,.4)' }}>
      <div
        ref={dialogRef}
        data-exam=""
        data-exam-contrast={highContrast ? 'high' : undefined}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-finish-title"
        aria-describedby={unansweredNumbers.length > 0 ? 'confirm-finish-desc' : undefined}
        className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border shadow-lg p-5 space-y-4 text-center"
        style={{ background: 'var(--exam-bg)', borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
      >
        <p id="confirm-finish-title" className="text-base font-bold">Finish the exam?</p>
        {unansweredNumbers.length > 0 && (
          <p id="confirm-finish-desc" className="text-sm break-words" style={{ color: 'var(--exam-danger)' }}>
            Unanswered questions: {unansweredNumbers.length} ({unansweredNumbers.join(', ')})
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-11 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--exam-chrome-border)', color: 'var(--exam-text)' }}
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-11 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--exam-accent)' }}
          >
            Yes, finish
          </button>
        </div>
      </div>
    </div>
  );
}
