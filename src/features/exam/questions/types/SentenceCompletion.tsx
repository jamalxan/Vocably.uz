'use client';
import { parseGapHtml } from '../parseGapHtml';
import type { QuestionTypeProps } from '../QuestionRenderer';

// TZ-vocably-v2.md §6.4 — "sentence_completion | Gap ichida inline input:
// 'In 1932, the factory produced ____.'" `question.promptHtml` o'z ichida bitta
// `{{qN}}` belgisini olib yuradi (TZ §3.5 `promptHtml` izohi bilan bir xil
// naqsh — `{{qN}}` `stemHtml`da GURUH darajasida, bu yerda esa SAVOL darajasida).
export default function SentenceCompletion({ group, question, value, onChange }: QuestionTypeProps) {
  const html = question.promptHtml || `{{q${question.number}}}`;
  const content = parseGapHtml(html, {
    answers: { [`q${question.number}`]: value },
    onChangeGap: (qNum, v) => {
      if (qNum === question.number) onChange(v);
    },
    defaultWordLimit: group.wordLimit,
  });

  return (
    <p className="leading-[1.75]" style={{ color: 'var(--exam-text)' }}>
      {content}
    </p>
  );
}
