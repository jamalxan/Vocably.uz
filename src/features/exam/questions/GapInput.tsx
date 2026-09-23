'use client';
import { useState } from 'react';
import type { WordLimit } from '@/lib/exam/types';
import FlagToggle from './FlagToggle';

// TZ-vocably-v2.md §6.5 — inline gap-fill input. Ko'p so'z limiti (`wordLimit`)
// ko'rsatilgan bo'lsa haqiqiy vaqtda "Ko'pi bilan N ta so'z" ogohlantiradi —
// YOZISHNI TO'XTATMAYDI (haqiqiy imtihonda ham to'xtatmaydi), faqat baholashda
// hisobga olinadi (scoring.ts#isCorrect).
export interface GapInputProps {
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  wordLimit?: WordLimit;
  className?: string;
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export default function GapInput({ questionNumber, value, onChange, wordLimit, className = '' }: GapInputProps) {
  const wordCount = wordLimit ? countWords(value) : 0;
  const overLimit = !!wordLimit && wordCount > wordLimit.maxWords;
  const [focused, setFocused] = useState(false);
  // Chegara rangi render'da hisoblanadi — resume/qayta render'da ham to'g'ri.
  const borderColor = overLimit
    ? 'var(--exam-danger)'
    : focused || value
      ? 'var(--exam-accent)'
      : 'var(--exam-input-border)';

  return (
    <span data-question-number={questionNumber} className={`inline-flex flex-col align-middle mx-0.5 ${className}`}>
      <span className="inline-flex items-baseline gap-1">
        <sup style={{ color: 'var(--exam-muted)', fontSize: 'max(0.7em, 11px)' }}>
          {questionNumber}
        </sup>
        <FlagToggle questionNumber={questionNumber} />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Question ${questionNumber} answer`}
          data-answered={value ? 'true' : 'false'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          // <768px: kamida 16px (iOS focus-zoom bo'lmasin), aks holda atrofdagi matn o'lchami.
          className="inline-block outline-none bg-transparent text-center text-[length:max(16px,1em)] md:text-[length:1em]"
          style={{
            minWidth: 'min(130px, 38vw)',
            border: 'none',
            borderBottom: `1.5px solid ${borderColor}`,
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'inherit',
            padding: '2px 4px',
            color: 'var(--exam-text)',
            boxShadow: focused ? `0 2px 0 0 ${overLimit ? 'var(--exam-danger)' : 'var(--exam-accent)'}` : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </span>
      {overLimit && (
        <span className="leading-tight" style={{ color: 'var(--exam-danger)', fontSize: 'max(0.7em, 11px)' }}>
          Ko&apos;pi bilan {wordLimit!.maxWords} ta so&apos;z
        </span>
      )}
    </span>
  );
}
