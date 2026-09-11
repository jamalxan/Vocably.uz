'use client';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "Radio, vertikal, A–D harflari bilan". Faqat SINGLE
// (bitta to'g'ri javob) — `multiple_choice_multi` (checkbox + selectCount)
// Faza 1 QuestionRenderer ro'yxatida yo'q (TZ §19), Faza 2 ishi.
export default function MultipleChoice({ question, value, onChange }: QuestionTypeProps) {
  return (
    <fieldset data-question-number={question.number} className="text-sm" style={{ color: 'var(--exam-text)' }}>
      <legend className="mb-2 text-left">
        <sup className="text-[11px] font-bold mr-1.5" style={{ color: 'var(--exam-muted)' }}>
          {question.number}
        </sup>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: question.promptHtml || '' }} />
      </legend>
      <div className="flex flex-col gap-2 pl-4">
        {(question.options || []).map((opt) => (
          <label key={opt.key} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name={`q${question.number}`}
              checked={value === opt.key}
              onChange={() => onChange(opt.key)}
              className="mt-0.5 accent-[var(--exam-accent)]"
            />
            <span>
              <strong className="mr-1.5">{opt.key}</strong>
              {opt.text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
