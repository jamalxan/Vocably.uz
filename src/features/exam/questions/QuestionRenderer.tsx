'use client';
import type { AnswerValue, SanitizedQuestion, SanitizedQuestionGroup } from '@/lib/exam/types';
import TrueFalseNotGiven, { YesNoNotGiven } from './types/TrueFalseNotGiven';
import MultipleChoice from './types/MultipleChoice';
import SentenceCompletion from './types/SentenceCompletion';
import ShortAnswer from './types/ShortAnswer';

// TZ-vocably-v2.md §2/§16 — "QuestionRenderer bitta. Reading va Listening bir
// xil komponentdan foydalanadi. Farq faqat allowedTypes ro'yxatida."
//
// FAQAT PER-SAVOL turlarni shu yerda xaritalaymiz: TrueFalseNotGiven/
// YesNoNotGiven, MultipleChoice (single+multi), SentenceCompletion,
// ShortAnswer. Qolgan barcha turlar (matching_headings/information/features/
// sentence_endings, summary/note/table/flowchart/form completion,
// diagram/map/plan_label) GURUH darajasida render qilinadi (sarlavhalar
// ro'yxati, umumiy stemHtml yoki rasm bitta marta ko'rsatiladi, har savolda
// takrorlanmaydi) — shuning uchun `QuestionGroupBlock.tsx` ULARNI BU YERGA
// UMUMAN YUBORMAYDI, o'zi to'g'ridan-to'g'ri tegishli komponentni chaqiradi.
export interface QuestionTypeProps {
  group: SanitizedQuestionGroup;
  question: SanitizedQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

const PER_QUESTION_RENDERERS: Partial<Record<SanitizedQuestionGroup['type'], (props: QuestionTypeProps) => JSX.Element>> = {
  true_false_notgiven: TrueFalseNotGiven,
  yes_no_notgiven: YesNoNotGiven,
  multiple_choice_single: MultipleChoice,
  multiple_choice_multi: MultipleChoice,
  sentence_completion: SentenceCompletion,
  short_answer: ShortAnswer,
};

export default function QuestionRenderer(props: QuestionTypeProps) {
  const Renderer = PER_QUESTION_RENDERERS[props.group.type];
  if (!Renderer) {
    // Bu holat endi amalda YUZ BERMASLIGI kerak — barcha 19 tur TZ §3.6'da
    // xaritalangan (bu yerda yoki QuestionGroupBlock'da). Kelajakda yangi tur
    // qo'shilib, hali xaritalanmagan bo'lsa jimgina qulab tushish o'rniga
    // ochiq xabar berish uchun qoldirilgan.
    return (
      <p className="text-sm italic" style={{ color: 'var(--exam-muted)' }}>
        Savol #{props.question.number}: &quot;{props.group.type}&quot; turi hali qo&apos;llab-quvvatlanmaydi.
      </p>
    );
  }
  return <Renderer {...props} />;
}
