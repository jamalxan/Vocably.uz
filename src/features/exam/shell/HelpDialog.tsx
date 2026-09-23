'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useDialogFocus } from '../state/useDialogFocus';
import { EXAM_ICON_BTN } from './ExamHeader';

// TZ-vocably-v2.md §5.4 — "? Yordam: savol turlari bo'yicha qisqa qo'llanma
// (modal, taymer to'xtamaydi)". Kontent generic — har savol turi uchun maxsus
// qo'llanma matni keyinroq (QuestionRenderer 6 turi qo'shilganda) kengaytiriladi.
export interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const TIPS = [
  { title: 'Savol paneli', body: "Pastdagi raqamlar bosilsa shu savolga o'tasiz. Tagiga chizilgan raqam — javob berilgan." },
  { title: 'Belgilash (flag)', body: "Ikkilanayotgan savolni keyinroq qaytish uchun belgilab qo'yishingiz mumkin." },
  { title: 'Vaqt', body: "Yuqoridagi taymer qolgan vaqtni ko'rsatadi. 10, 5 va 1 daqiqa qolganda ogohlantirish chiqadi." },
  { title: "Ko'rsatmalar", body: "Har savol guruhi tepasida ko'rsatma bor — qancha so'z yozish mumkinligiga (masalan \"NO MORE THAN TWO WORDS\") alohida e'tibor bering." },
];

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
  // §13 — QuestionSheet'dagi Escape-yopish naqshi bilan izchillashtirildi
  // (q. SettingsPanel.tsx'dagi bir xil izoh).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);
  const dialogRef = useDialogFocus<HTMLDivElement>(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-help-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border shadow-lg p-5 space-y-4"
        style={{ background: 'var(--exam-bg)', borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
      >
        <div className="flex items-center justify-between">
          <h2 id="exam-help-title" className="text-base font-semibold">Yordam</h2>
          <button type="button" onClick={onClose} aria-label="Yopish" className={`${EXAM_ICON_BTN} w-11 h-11 -m-2.5`}>
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.title}>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--exam-muted)' }}>
                {tip.body}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--exam-muted)' }}>
          Taymer bu oyna ochiq turganda ham davom etadi.
        </p>
      </div>
    </div>
  );
}
