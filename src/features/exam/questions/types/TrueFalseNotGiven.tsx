'use client';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "true_false_notgiven: Radio guruh, gorizontal:
// TRUE / FALSE / NOT GIVEN" va "yes_no_notgiven: xuddi shunday: YES / NO /
// NOT GIVEN". Ikkalasi bir xil UI, faqat variant matni farq qiladi (fakt
// haqidagi TFNG va muallif fikri haqidagi YNG) — shuning uchun bitta ichki
// komponent, ikkita nom bilan eksport qilinadi.
function ThreeWayChoice({ question, value, onChange, options }: QuestionTypeProps & { options: readonly string[] }) {
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
        {options.map((opt) => (
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

export default function TrueFalseNotGiven(props: QuestionTypeProps) {
  return <ThreeWayChoice {...props} options={['TRUE', 'FALSE', 'NOT GIVEN']} />;
}

export function YesNoNotGiven(props: QuestionTypeProps) {
  return <ThreeWayChoice {...props} options={['YES', 'NO', 'NOT GIVEN']} />;
}
