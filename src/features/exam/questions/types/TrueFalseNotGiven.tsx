'use client';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "Radio guruh, gorizontal: TRUE / FALSE / NOT GIVEN.
// Matn CAPS." (yes_no_notgiven — YES/NO/NOT GIVEN — Faza 2 ishi, TZ §19 item 11;
// bu komponent shu chegarani hurmat qilib faqat TFNG uchun ishlatiladi.)
const OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'];

export default function TrueFalseNotGiven({ question, value, onChange }: QuestionTypeProps) {
  return (
    <fieldset data-question-number={question.number} className="text-sm" style={{ color: 'var(--exam-text)' }}>
      <legend className="mb-2 text-left">
        <sup className="text-[11px] font-bold mr-1.5" style={{ color: 'var(--exam-muted)' }}>
          {question.number}
        </sup>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: question.promptHtml || '' }} />
      </legend>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 pl-4">
        {OPTIONS.map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name={`q${question.number}`}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-[var(--exam-accent)]"
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
