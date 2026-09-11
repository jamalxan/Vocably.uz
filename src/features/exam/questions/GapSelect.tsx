'use client';
import type { BankItem } from '@/lib/exam/types';

// TZ-vocably-v2.md §6.4 — `summary_completion_bank` ("bo'sh joy, variantlar
// bankidan") va §7.6 map/diagram hotspot'lari (bank mavjud bo'lganda) uchun —
// GapInput'ning select-variant "birodari". `<select>` tanlandi (`drag-drop`
// emas): TZ o'zi "Tavsiya: <select> + drag-drop ikkalasi ham. Mobil'da
// drag-drop ishlamaydi" deydi — <select> yagona universal, ikkalasi ham
// ishlaydigan variant, drag-drop esa ixtiyoriy sayqal (Faza 4/qo'shimcha).
export interface GapSelectProps {
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  bank: BankItem[];
  className?: string;
}

export default function GapSelect({ questionNumber, value, onChange, bank, className = '' }: GapSelectProps) {
  return (
    <span data-question-number={questionNumber} className={`inline-flex items-baseline gap-1 mx-0.5 ${className}`}>
      <sup className="text-[10px]" style={{ color: 'var(--exam-muted)' }}>
        {questionNumber}
      </sup>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Savol ${questionNumber} javobi`}
        data-answered={value ? 'true' : 'false'}
        className="inline-block outline-none bg-transparent text-sm"
        style={{ border: 'none', borderBottom: `1.5px solid var(--exam-input-border)`, font: 'inherit', padding: '2px 4px', color: 'var(--exam-text)' }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottomColor = 'var(--exam-accent)';
          e.currentTarget.style.boxShadow = '0 2px 0 0 var(--exam-accent)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottomColor = value ? 'var(--exam-accent)' : 'var(--exam-input-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <option value="">—</option>
        {bank.map((b) => (
          <option key={b.key} value={b.key}>
            {b.key} — {b.text}
          </option>
        ))}
      </select>
    </span>
  );
}
