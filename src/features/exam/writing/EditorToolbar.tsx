'use client';
import { Scissors, Copy, Clipboard } from 'lucide-react';

// TZ-vocably-v2.md §8.2 — "Kesish/Nusxa/Qo'yish tugmalari — real IELTS'da bor."
// Haqiqiy amal EssayEditor.tsx'da (textarea DOM'iga to'g'ridan-to'g'ri kirish
// kerak) — bu komponent faqat tugmalar, `Clipboard API` ruxsat bermasa ham
// (masalan Firefox'da `readText` block bo'lishi mumkin) foydalanuvchi baribir
// Ctrl+C/V/X bilan davom eta oladi, bu tugmalar shunchaki qulaylik.
export interface EditorToolbarProps {
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export default function EditorToolbar({ onCut, onCopy, onPaste }: EditorToolbarProps) {
  // hover rangi --exam-chrome orqali — yuqori kontrast rejimida ham ko'rinadi.
  const btnClass =
    'flex items-center gap-1 min-h-11 md:min-h-7 px-3 md:px-2 py-1 rounded text-xs font-medium hover:bg-[var(--exam-chrome)] focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]';
  const style = { color: 'var(--exam-muted)', border: '1px solid var(--exam-chrome-border)' };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ borderColor: 'var(--exam-chrome-border)' }}>
      <button type="button" onClick={onCut} className={btnClass} style={style}>
        <Scissors size={13} /> Cut
      </button>
      <button type="button" onClick={onCopy} className={btnClass} style={style}>
        <Copy size={13} /> Copy
      </button>
      <button type="button" onClick={onPaste} className={btnClass} style={style}>
        <Clipboard size={13} /> Paste
      </button>
    </div>
  );
}
