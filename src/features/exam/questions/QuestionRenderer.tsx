'use client';
import type { AnswerValue, SanitizedQuestion, SanitizedQuestionGroup } from '@/lib/exam/types';
import TrueFalseNotGiven from './types/TrueFalseNotGiven';
import MultipleChoice from './types/MultipleChoice';
import SentenceCompletion from './types/SentenceCompletion';
import ShortAnswer from './types/ShortAnswer';

// TZ-vocably-v2.md §2/§16 — "QuestionRenderer bitta. Reading va Listening bir
// xil komponentdan foydalanadi. Farq faqat allowedTypes ro'yxatida."
//
// FAQAT PER-SAVOL turlarni shu yerda xaritalaymiz: TrueFalseNotGiven,
// MultipleChoice (single), SentenceCompletion, ShortAnswer. Boshqa Faza 1
// turlari — matching_headings, summary/note/table_completion — GURUH
// darajasida render qilinadi (sarlavhalar ro'yxati yoki umumiy stemHtml bitta
// marta ko'rsatiladi, har savolda takrorlanmaydi) — shuning uchun
// `QuestionGroupBlock.tsx` ULARNI BU YERGA UMUMAN YUBORMAYDI, o'zi to'g'ridan-
// to'g'ri `MatchingHeadings`/`GroupGapFill`ni chaqiradi.
export interface QuestionTypeProps {
  group: SanitizedQuestionGroup;
  question: SanitizedQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

const PER_QUESTION_RENDERERS: Partial<Record<SanitizedQuestionGroup['type'], (props: QuestionTypeProps) => JSX.Element>> = {
  true_false_notgiven: TrueFalseNotGiven,
  multiple_choice_single: MultipleChoice,
  sentence_completion: SentenceCompletion,
  short_answer: ShortAnswer,
};

export default function QuestionRenderer(props: QuestionTypeProps) {
  const Renderer = PER_QUESTION_RENDERERS[props.group.type];
  if (!Renderer) {
    // Faza 2/3'da qo'shiladigan turlar (matching_features, diagram_label, map_label...)
    // uchun jimgina qulab tushish o'rniga ochiq xabar — TZ §19 fazalash ro'yxatiga q.
    return (
      <p className="text-sm italic" style={{ color: 'var(--exam-muted)' }}>
        Savol #{props.question.number}: &quot;{props.group.type}&quot; turi hali qo&apos;llab-quvvatlanmaydi.
      </p>
    );
  }
  return <Renderer {...props} />;
}
