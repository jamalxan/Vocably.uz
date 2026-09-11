'use client';
import type { AnswerValue, SanitizedQuestionGroup } from '@/lib/exam/types';
import InstructionBlock from './InstructionBlock';
import QuestionRenderer from './QuestionRenderer';
import GroupGapFill from './types/GroupGapFill';
import MatchingHeadings from './types/MatchingHeadings';
import MatchingBank from './types/MatchingBank';
import ImageHotspotLabel from './types/ImageHotspotLabel';

// TZ-vocably-v2.md §5.6 — har QuestionGroup: ko'rsatma bloki + savollar.
//
// To'rt xil render yo'li bor (savol turi tekshirilib tanlanadi):
//  1. GURUH darajasida, `stemHtml` bilan (summary/summary_bank/note/table/
//     flowchart/form completion) — GroupGapFill BITTA marta chaqiriladi.
//  2. GURUH darajasida, umumiy sarlavhalar ro'yxati bilan (matching_headings).
//  3. GURUH darajasida, sticky ro'yxatsiz bank-select (matching_information/
//     features/sentence_endings) — MatchingBank.
//  4. GURUH darajasida, rasm+hotspot (diagram/map/plan_label) — ImageHotspotLabel.
//  5. SAVOL darajasida (TFNG/YNG/MC single+multi/sentence_completion/
//     short_answer) — QuestionRenderer har `question` uchun alohida chaqiriladi.
const STEM_BASED_TYPES = new Set<SanitizedQuestionGroup['type']>([
  'summary_completion',
  'summary_completion_bank',
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'form_completion',
]);

const MATCHING_BANK_TYPES = new Set<SanitizedQuestionGroup['type']>([
  'matching_information',
  'matching_features',
  'matching_sentence_endings',
]);

const IMAGE_HOTSPOT_TYPES = new Set<SanitizedQuestionGroup['type']>(['diagram_label', 'map_label', 'plan_label']);

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
  const isMatchingBank = MATCHING_BANK_TYPES.has(group.type);
  const isImageHotspot = IMAGE_HOTSPOT_TYPES.has(group.type);

  let body: JSX.Element;
  if (isStemBased) {
    body = <GroupGapFill group={group} answers={answers} onAnswerChange={onAnswerChange} />;
  } else if (isMatchingHeadings) {
    body = <MatchingHeadings group={group} answers={answers} onAnswerChange={onAnswerChange} />;
  } else if (isMatchingBank) {
    body = <MatchingBank group={group} answers={answers} onAnswerChange={onAnswerChange} />;
  } else if (isImageHotspot) {
    body = <ImageHotspotLabel group={group} answers={answers} onAnswerChange={onAnswerChange} />;
  } else {
    body = (
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
    );
  }

  return (
    <div className="mb-8" data-question-group={group.id}>
      <InstructionBlock rangeLabel={rangeLabel} instructionHtml={group.instructionHtml} />
      {body}
    </div>
  );
}
