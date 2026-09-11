'use client';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { AnswerValue } from '@/lib/exam/types';

// TZ-vocably-v2.md §5.5 — ExamFooterNav (balandligi 64px desktop, 88px mobil).
// ┌──────────────────────────────────────────────────────────────────┐
// │ Part 1 [1][2][3]…[10] │ Part 2 [11]…[20] │ Part 3 …  │  ← →  ✓ │
// └──────────────────────────────────────────────────────────────────┘
//
// "Boshqa bo'limda (mock)" holati (40% opacity, bosilmaydi) BU YERDA YO'Q —
// Faza 1 faqat `mode:'section'` (bitta bo'lim) bilan ishlaydi, bir nechta
// bo'limli Mock orkestratsiyasi Faza 3 ishi (TZ §19 item 15).
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
  onSubmit: () => void;
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
  submitLabel = 'Yakunlash',
}: ExamFooterNavProps) {
  const allQuestions = groups.flatMap((g) => g.questions);
  const currentIdx = allQuestions.indexOf(currentQuestion);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx >= 0 && currentIdx < allQuestions.length - 1;

  const goPrev = () => canPrev && onGoTo(allQuestions[currentIdx - 1]);
  const goNext = () => canNext && onGoTo(allQuestions[currentIdx + 1]);

  return (
    <nav
      className="flex-shrink-0 min-h-16 sm:min-h-16 border-t flex items-center gap-3 px-3 sm:px-4 py-2 overflow-x-auto"
      style={{ background: 'var(--exam-chrome)', borderColor: 'var(--exam-chrome-border)' }}
      aria-label="Savollar paneli"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {groups.map((g) => (
          <div key={g.label} className="flex items-center gap-1.5 flex-shrink-0">
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
                  aria-label={`Savol ${qNum}${answered ? ", javob berilgan" : ''}${isFlagged ? ', belgilangan' : ''}${isCurrent ? ', joriy' : ''}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-[13px] font-semibold border transition-colors"
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
          aria-label="Oldingi savol"
          className="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Keyingi savol"
          className="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-30"
          style={{ borderColor: 'var(--exam-chrome-border)', color: 'var(--exam-text)' }}
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="ml-1 h-9 px-3 flex items-center gap-1.5 rounded-lg text-white text-[13px] font-semibold"
          style={{ background: 'var(--exam-accent)' }}
        >
          <Check size={15} /> {submitLabel}
        </button>
      </div>
    </nav>
  );
}
