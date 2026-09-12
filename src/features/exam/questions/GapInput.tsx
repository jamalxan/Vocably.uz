'use client';
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

  return (
    <span data-question-number={questionNumber} className={`inline-flex flex-col align-middle mx-0.5 ${className}`}>
      <span className="inline-flex items-baseline gap-1">
        <sup className="text-[10px]" style={{ color: 'var(--exam-muted)' }}>
          {questionNumber}
        </sup>
        <FlagToggle questionNumber={questionNumber} />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Savol ${questionNumber} javobi`}
          data-answered={value ? 'true' : 'false'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="inline-block outline-none bg-transparent text-center"
          style={{
            minWidth: 130,
            border: 'none',
            borderBottom: `1.5px solid ${overLimit ? 'var(--exam-danger)' : 'var(--exam-input-border)'}`,
            font: 'inherit',
            padding: '2px 4px',
            color: 'var(--exam-text)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderBottomColor = 'var(--exam-accent)';
            e.currentTarget.style.boxShadow = '0 2px 0 0 var(--exam-accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderBottomColor = overLimit ? 'var(--exam-danger)' : value ? 'var(--exam-accent)' : 'var(--exam-input-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </span>
      {overLimit && (
        <span className="text-[10px] leading-tight" style={{ color: 'var(--exam-danger)' }}>
          Ko&apos;pi bilan {wordLimit!.maxWords} ta so&apos;z
        </span>
      )}
    </span>
  );
}
