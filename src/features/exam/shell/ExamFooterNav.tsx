'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Grid3x3 } from 'lucide-react';
import type { AnswerValue } from '@/lib/exam/types';
import { useIsMobile } from '../state/useIsMobile';
import QuestionSheet from './QuestionSheet';

// TZ-vocably-v2.md §5.5 — ExamFooterNav (balandligi 64px desktop, 88px mobil).
// ┌──────────────────────────────────────────────────────────────────┐
// │ Part 1 [1][2][3]…[10] │ Part 2 [11]…[20] │ Part 3 …  │  ← →  ✓ │
// └──────────────────────────────────────────────────────────────────┘
//
// "Boshqa bo'limda (mock)" holati (40% opacity, bosilmaydi) BU YERDA YO'Q —
// bir nechta bo'limli Mock'da ekranda bir vaqtning o'zida faqat JORIY
// bo'limning savollari ko'rsatiladi (ReadingSection/ListeningSection/
// WritingSection navbati bilan almashadi), shuning uchun "boshqa bo'lim"
// tugmasi umuman render qilinmaydi — buni ko'rsatishga hojat qolmagan.
export interface QuestionGroupNav {
  label: string; // "Part 1", "Passage 1"
  questions: number[]; // global savol raqamlari
}

export interface ExamFooterNavProps {
  groups: QuestionGroupNav[];
  answers: Record<string, AnswerValue>;
  flagged: Set<number>;
  currentQuestion: number;
  onGoTo: (qNum: number) => void;
  // §5.5 — "✓ tugmasi: mock'da faqat oxirgi bo'limda 'Yakunlash', practice'da
  // doim." `undefined` bo'lsa tugma umuman ko'rinmaydi (mock'ning oxirgi
  // bo'limidan boshqa har qanday bo'limi — bo'lim vaqt tugashi bilan
  // AVTOMATIK almashadi, foydalanuvchi tugma bosishi shart emas).
  onSubmit?: () => void;
  submitLabel?: string;
}

function isAnswered(answers: Record<string, AnswerValue>, qNum: number): boolean {
  const v = answers[`q${qNum}`];
  return v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
}

export default function ExamFooterNav({
  groups,
  answers,
  flagged,
  currentQuestion,
  onGoTo,
  onSubmit,
  submitLabel = 'Finish',
}: ExamFooterNavProps) {
  const allQuestions = groups.flatMap((g) => g.questions);
  const currentIdx = allQuestions.indexOf(currentQuestion);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx >= 0 && currentIdx < allQuestions.length - 1;

  const goPrev = () => canPrev && onGoTo(allQuestions[currentIdx - 1]);
  const goNext = () => canNext && onGoTo(allQuestions[currentIdx + 1]);

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // TZ §12.2 — "← Savol 14/40 → (bosilsa bottom sheet ochiladi)". Desktop'dagi
  // to'liq 40-tugmali ro'yxat <768px'da sig'maydi (footer balandligi 88px'ga
  // ko'tarilsa ham) — shuning uchun ixcham hisoblagich + QuestionSheet.tsx.
  if (isMobile) {
    return (
      <nav
        className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-t"
        style={{
          background: 'var(--exam-chrome)',
          borderColor: 'var(--exam-chrome-border)',
          minHeight: 64,
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        }}
        aria-label="Question navigation"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Previous question"
          className="flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ width: 44, height: 44, borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold"
          style={{ height: 44, borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <Grid3x3 size={15} />
          Question {currentQuestion} / {allQuestions.length}
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Next question"
          className="flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ width: 44, height: 44, borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronRight size={20} />
        </button>

        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3 rounded-lg text-white text-[13px] font-semibold"
            style={{ height: 44, background: 'var(--exam-accent)' }}
          >
            <Check size={15} /> {submitLabel}
          </button>
        )}

        {sheetOpen && (
          <QuestionSheet
            groups={groups}
            answers={answers}
            flagged={flagged}
            currentQuestion={currentQuestion}
            onGoTo={onGoTo}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </nav>
    );
  }

  return (
    <nav
      className="flex-shrink-0 min-h-16 sm:min-h-16 border-t flex items-center gap-3 px-3 sm:px-4 py-2"
      style={{ background: 'var(--exam-chrome)', borderColor: 'var(--exam-chrome-border)' }}
      aria-label="Question navigation"
    >
      {/* VOCABLY-TZ.md §1.3 auditi — `overflow-x-auto` ILGARI butun <nav>da
          edi, shuning uchun o'ng zonadagi (Oldingi/Keyingi/Yakunlash)
          tugmalar 40 ta savol raqami bilan BIRGA gorizontal scroll qilardi
          va Reading'da raqamlar ostida, Listening/Writing'da AI FAB ostida
          qolib bosilmas edi. Endi FAQAT shu ichki konteyner scroll qiladi,
          o'ng zona (pastda) har doim ko'rinadigan joyida qat'iy turadi. */}
      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
        {groups.map((g) => (
          <div key={g.label} className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide mr-0.5" style={{ color: 'var(--exam-muted)' }}>
              {g.label}
            </span>
            {g.questions.map((qNum) => {
              const answered = isAnswered(answers, qNum);
              const isCurrent = qNum === currentQuestion;
              const isFlagged = flagged.has(qNum);
              return (
                <button
                  key={qNum}
                  type="button"
                  onClick={() => onGoTo(qNum)}
                  aria-label={`Question ${qNum}${answered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}${isCurrent ? ', current' : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  className="relative w-7 h-7 flex-shrink-0 flex items-center justify-center rounded text-[12px] font-semibold border transition-colors"
                  style={{
                    borderColor: isCurrent ? 'var(--exam-accent)' : 'var(--exam-chrome-border)',
                    borderWidth: isCurrent ? 2 : 1,
                    background: answered ? 'var(--exam-answered-bg)' : '#ffffff',
                    color: answered ? 'var(--exam-answered)' : 'var(--exam-text)',
                    textDecoration: answered ? 'underline' : 'none',
                    boxShadow: isCurrent ? 'var(--exam-focus-ring)' : 'none',
                  }}
                >
                  {qNum}
                  {isFlagged && (
                    <span
                      className="absolute -top-1 -right-1 w-0 h-0"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderTop: '6px solid var(--exam-flag)',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Previous question"
          className="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Next question"
          className="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronRight size={18} />
        </button>
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className="ml-1 h-9 px-3 flex items-center gap-1.5 rounded-lg text-white text-[13px] font-semibold"
            style={{ background: 'var(--exam-accent)' }}
          >
            <Check size={15} /> {submitLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
