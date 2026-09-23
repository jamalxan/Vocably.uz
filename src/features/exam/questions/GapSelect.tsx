'use client';
import { useState } from 'react';
import type { BankItem } from '@/lib/exam/types';
import FlagToggle from './FlagToggle';

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
  const [focused, setFocused] = useState(false);
  const borderColor = focused || value ? 'var(--exam-accent)' : 'var(--exam-input-border)';
  return (
    <span data-question-number={questionNumber} className={`inline-flex items-baseline gap-1 mx-0.5 ${className}`}>
      <sup style={{ color: 'var(--exam-muted)', fontSize: 'max(0.7em, 11px)' }}>
        {questionNumber}
      </sup>
      <FlagToggle questionNumber={questionNumber} />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Question ${questionNumber} answer`}
        data-answered={value ? 'true' : 'false'}
        // Native select eng uzun variant kengligini oladi — panel'dan chiqib ketmasin.
        className="inline-block min-w-0 max-w-full sm:max-w-[16rem] outline-none bg-transparent text-[length:max(16px,1em)] md:text-[length:1em]"
        style={{
          border: 'none',
          borderBottom: `1.5px solid ${borderColor}`,
          fontFamily: 'inherit',
          lineHeight: 'inherit',
          padding: '2px 4px',
          color: 'var(--exam-text)',
          boxShadow: focused ? '0 2px 0 0 var(--exam-accent)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
