'use client';

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
  return (
    <div data-exam="" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
      <div
        role="alertdialog"
        aria-label="Yakunlashni tasdiqlash"
        className="w-full max-w-sm rounded-lg border shadow-lg p-5 space-y-4 text-center"
        style={{ background: 'var(--exam-bg)', borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
      >
        <p className="text-base font-bold">Yakunlashni xohlaysizmi?</p>
        {unansweredNumbers.length > 0 && (
          <p className="text-sm" style={{ color: 'var(--exam-danger)' }}>
            Javobsiz savollar: {unansweredNumbers.length} ta ({unansweredNumbers.join(', ')})
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid var(--exam-chrome-border)', color: 'var(--exam-text)' }}
          >
            Orqaga qaytish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--exam-accent)' }}
          >
            Ha, yakunlash
          </button>
        </div>
      </div>
    </div>
  );
}
