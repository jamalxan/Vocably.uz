'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { AnswerValue } from '@/lib/exam/types';
import type { QuestionGroupNav } from './ExamFooterNav';

// TZ-vocably-v2.md §12.2 — "Savol raqamlari bottom sheet'da 5×8 grid." Mobil
// footer'ning ixcham "← Savol 14/40 →" tugmasi bosilganda ochiladi — desktop
// ExamFooterNav'dagi savol tugmalari ro'yxati bilan bir xil ma'lumot
// (javob berilgan/belgilangan/joriy), faqat grid bo'lib joylashadi, 44px'dan
// kichik bo'lmagan teginish maydoni bilan (§12.2).
export interface QuestionSheetProps {
  groups: QuestionGroupNav[];
  answers: Record<string, AnswerValue>;
  flagged: Set<number>;
  currentQuestion: number;
  onGoTo: (qNum: number) => void;
  onClose: () => void;
}

function isAnswered(answers: Record<string, AnswerValue>, qNum: number): boolean {
  const v = answers[`q${qNum}`];
  return v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
}

export default function QuestionSheet({ groups, answers, flagged, currentQuestion, onGoTo, onClose }: QuestionSheetProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Savollar ro'yxati"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[70vh] overflow-y-auto rounded-t-2xl"
        style={{ background: 'var(--exam-bg)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0" style={{ background: 'var(--exam-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--exam-text)' }}>
            Savollar
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="w-11 h-11 -mr-2 flex items-center justify-center"
            style={{ color: 'var(--exam-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {groups.map((g) => (
          <div key={g.label} className="px-4 mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--exam-muted)' }}>
              {g.label}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {g.questions.map((qNum) => {
                const answered = isAnswered(answers, qNum);
                const isCurrent = qNum === currentQuestion;
                const isFlagged = flagged.has(qNum);
                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => {
                      onGoTo(qNum);
                      onClose();
                    }}
                    aria-label={`Savol ${qNum}${answered ? ', javob berilgan' : ''}${isFlagged ? ', belgilangan' : ''}${isCurrent ? ', joriy' : ''}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    className="relative flex items-center justify-center rounded-lg text-sm font-semibold border"
                    style={{
                      minHeight: 44,
                      borderColor: isCurrent ? 'var(--exam-accent)' : 'var(--exam-chrome-border)',
                      borderWidth: isCurrent ? 2 : 1,
                      background: answered ? 'var(--exam-answered-bg)' : '#ffffff',
                      color: answered ? 'var(--exam-answered)' : 'var(--exam-text)',
                      textDecoration: answered ? 'underline' : 'none',
                    }}
                  >
                    {qNum}
                    {isFlagged && (
                      <span
                        className="absolute -top-1 -right-1 w-0 h-0"
                        style={{ borderLeft: '7px solid transparent', borderTop: '7px solid var(--exam-flag)' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
