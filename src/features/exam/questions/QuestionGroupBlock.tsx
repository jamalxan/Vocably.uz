'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';
import InstructionBlock from './InstructionBlock';
import QuestionRenderer from './QuestionRenderer';
import GroupGapFill from './types/GroupGapFill';
import MatchingHeadings from './types/MatchingHeadings';

// TZ-vocably-v2.md §5.6 — har QuestionGroup: ko'rsatma bloki + savollar.
//
// Uch xil render yo'li bor (savol turi tekshirilib tanlanadi):
//  1. GURUH darajasida, `stemHtml` bilan (summary/note/table/flowchart
//     completion) — GroupGapFill BITTA marta chaqiriladi.
//  2. GURUH darajasida, umumiy bank bilan (matching_headings) — sarlavhalar
//     ro'yxati bitta marta, keyin har savol uchun select.
//  3. SAVOL darajasida (TFNG/MC/sentence_completion/short_answer) —
//     QuestionRenderer har `question` uchun alohida chaqiriladi.
const STEM_BASED_TYPES = new Set<SanitizedQuestionGroup['type']>([
  'summary_completion',
  'note_completion',
  'table_completion',
  'flowchart_completion',
]);

export interface QuestionGroupBlockProps {
  group: SanitizedQuestionGroup;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionNumber: number, value: AnswerValue) => void;
}

export default function QuestionGroupBlock({ group, answers, onAnswerChange }: QuestionGroupBlockProps) {
  const numbers = group.questions.map((q) => q.number);
  const rangeLabel =
    numbers.length <= 1 ? `Question ${numbers[0]}` : `Questions ${Math.min(...numbers)}–${Math.max(...numbers)}`;

  const isStemBased = !!group.stemHtml && STEM_BASED_TYPES.has(group.type);
  const isMatchingHeadings = group.type === 'matching_headings';

  return (
    <div className="mb-8" data-question-group={group.id}>
      <InstructionBlock rangeLabel={rangeLabel} instructionHtml={group.instructionHtml} />

      {isStemBased ? (
        <GroupGapFill group={group} answers={answers} onAnswerChange={onAnswerChange} />
      ) : isMatchingHeadings ? (
        <MatchingHeadings group={group} answers={answers} onAnswerChange={onAnswerChange} />
      ) : (
        <div className="space-y-5">
          {group.questions.map((q) => (
            <QuestionRenderer
              key={q.number}
              group={group}
              question={q}
              value={answers[`q${q.number}`] ?? null}
              onChange={(v) => onAnswerChange(q.number, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
