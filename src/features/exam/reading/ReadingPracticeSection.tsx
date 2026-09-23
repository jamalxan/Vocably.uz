'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useExamStore } from '../state/examStore';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, submitAttempt } from '../state/attemptsApi';
import QuestionGroupBlock from '../questions/QuestionGroupBlock';
import ConfirmFinishModal from '../mock/ConfirmFinishModal';
import { ExamLoadError, ExamLoading, SubmitErrorBanner } from '../shell/ExamStatus';
import { unansweredNumbers } from '../state/unanswered';
import type { SanitizedTest } from '@/lib/exam/types';

// VOCABLY_TZ_FINAL...2026-09-20.md "Reading practice mode": "timer optional"
// + izoh/evidence-paragraph ("explanation"/"why this answer") ALLAQACHON
// qurilgan — faqat submit'dan KEYIN, `ReviewScreen.tsx` orqali (u
// `explanationHtml`/`locatorParagraph`ni ko'rsatadi). Shuning uchun bu
// komponent FAQAT "vaqtsiz o'qish+javob berish" qismini qo'shadi — submit'dan
// keyin sahifa (route) to'g'ridan-to'g'ri `ReviewScreen`ga o'tkazadi (plain
// band-score ekrani o'rniga), chunki practice'ning butun ma'nosi — darhol
// batafsil fikr-mulohaza.
//
// ATAYLAB `ReadingSection.tsx`dan ALOHIDA, `SplitPane`/`ExamShell`SIZ: real
// exam'ning qat'iy taymer bosimi/sudraladigan ikki panel bu yerda kerak emas
// (ExamShell'ning `h-full` layout zanjiri SplitPane uchun aniq balandlik
// beradi — uni bu yerda qayta qurish ortiqcha murakkablik/xavf qo'shardi).
// O'rniga — Listening mashq (ListeningPracticeSection.tsx) bilan bir xil
// naqsh: bitta vertikal scroll ustun, passage matni ReviewScreen.tsx'dagi
// bilan bir xil (o'qish-uchun, belgilashsiz — `useHighlights` bu yerga
// ATAYLAB ulanmagan, kelajakda qo'shilishi mumkin).
export interface ReadingPracticeSectionProps {
  attemptId: string;
  onSubmitted: () => void;
}

export default function ReadingPracticeSection({ attemptId, onSubmitted }: ReadingPracticeSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmUnanswered, setConfirmUnanswered] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const answers = useExamStore((s) => s.answers);
  const setAnswer = useExamStore((s) => s.setAnswer);

  useAutosave(attemptId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAttempt(attemptId);
        if (cancelled) return;
        if (data.attempt.status !== 'in_progress') {
          onSubmitted();
          return;
        }
        setTest(data.test);
        init({
          attemptId,
          mode: 'practice',
          section: 'reading',
          answers: data.attempt.answers,
          flagged: data.attempt.flagged,
          currentQuestion: data.attempt.lastQuestion || 1,
          endsAt: new Date(data.endsAt).getTime(),
          serverNow: new Date(data.serverNow).getTime(),
        });
      } catch {
        if (!cancelled) setLoadError("Urinishni yuklab bo'lmadi.");
      }
    })();
    return () => {
      cancelled = true;
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const passages = test?.sections.reading?.passages || [];
  const activePassage = passages[passageIndex];

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await useExamStore.getState().syncNow();
      await submitAttempt(attemptId);
      onSubmitted();
    } catch {
      setSubmitError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
      setSubmitting(false);
    }
  }, [attemptId, submitting, onSubmitted]);

  // Bir tasodifiy bosish mashqni yopib qo'ymasligi uchun — avval tasdiqlash.
  const requestFinish = () => {
    const numbers = passages.flatMap((p) => p.questionGroups.flatMap((g) => g.questions.map((q) => q.number)));
    setConfirmUnanswered(unansweredNumbers(numbers, useExamStore.getState().answers));
  };

  if (loadError) {
    return <ExamLoadError message={loadError} />;
  }
  if (!test?.sections.reading || !activePassage) {
    return <ExamLoading />;
  }

  const paragraphLabels = activePassage.paragraphs.map((p) => p.label).filter((l): l is string => !!l);

  return (
    <div data-exam="" className="min-h-dvh">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 space-y-4">
        <Link
          href="/app/mashq"
          className="inline-flex items-center gap-1.5 min-h-11 -ml-2 px-2 rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
          style={{ color: 'var(--exam-muted)' }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Mashq
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--exam-muted)' }}>
              Reading — mashq
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--exam-muted)' }}>
              Vaqt cheklanmagan — yakunlagach izohlar bilan ko'rib chiqasiz
            </p>
          </div>
          <button
            type="button"
            onClick={requestFinish}
            disabled={submitting}
            className="flex-shrink-0 flex items-center gap-1.5 min-h-11 md:min-h-9 px-4 py-2 disabled:opacity-60 text-white text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
            style={{ background: 'var(--exam-accent)' }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Yakunlash
          </button>
        </div>

        {passages.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {passages.map((p, i) => (
              <button
                key={p.order}
                type="button"
                onClick={() => setPassageIndex(i)}
                aria-pressed={i === passageIndex}
                className="min-h-11 md:min-h-9 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
                style={{
                  background: i === passageIndex ? 'var(--exam-accent)' : 'transparent',
                  color: i === passageIndex ? '#fff' : 'var(--exam-text)',
                  borderColor: i === passageIndex ? 'var(--exam-accent)' : 'var(--exam-chrome-border)',
                }}
              >
                Passage {i + 1}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm font-bold" style={{ color: 'var(--exam-text)' }}>
          {activePassage.title}
        </p>
        <div
          className="border rounded-xl p-4 max-h-[50dvh] md:max-h-[60dvh] overflow-y-auto overscroll-contain text-base leading-relaxed"
          style={{ borderColor: 'var(--exam-chrome-border)', background: 'var(--exam-bg)', color: 'var(--exam-text)' }}
        >
          {activePassage.paragraphs.map((para, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {para.label && <span className="font-bold mr-1">{para.label}</span>}
              {/* eslint-disable-next-line react/no-danger */}
              <span dangerouslySetInnerHTML={{ __html: para.html }} />
            </p>
          ))}
        </div>

        <div className="space-y-4">
          {activePassage.questionGroups.map((g) => (
            <QuestionGroupBlock
              key={g.id}
              group={g}
              answers={answers}
              onAnswerChange={(qNum, value) => setAnswer(qNum, value)}
              paragraphLabels={paragraphLabels}
            />
          ))}
        </div>
      </div>
      {submitError && <SubmitErrorBanner message={submitError} onRetry={doSubmit} retrying={submitting} />}
      {confirmUnanswered && (
        <ConfirmFinishModal
          unansweredNumbers={confirmUnanswered}
          onCancel={() => setConfirmUnanswered(null)}
          onConfirm={() => {
            setConfirmUnanswered(null);
            doSubmit();
          }}
        />
      )}
    </div>
  );
}
