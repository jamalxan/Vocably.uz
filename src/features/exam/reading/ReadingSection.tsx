'use client';
import { useCallback, useEffect, useState } from 'react';
import { useExamStore } from '../state/examStore';
import { useExamTimer } from '../state/useExamTimer';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, sendHeartbeat, submitAttempt } from '../state/attemptsApi';
import ExamShell from '../shell/ExamShell';
import SplitPane from '../split/SplitPane';
import PassagePane from './PassagePane';
import QuestionGroupBlock from '../questions/QuestionGroupBlock';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';
import type { QuestionGroupNav } from '../shell/ExamFooterNav';

// TZ-vocably-v2.md §19 Faza 1 item 7 — "ReadingSection to'liq". Bu komponent
// examStore/useExamTimer/useAutosave/attemptsApi/ExamShell/SplitPane/
// QuestionGroupBlock'ni birlashtirib, `/api/exam/attempts/:id`dan boshlab
// to yakunlashgacha (submit) to'liq oqimni yuritadi.
const HEARTBEAT_INTERVAL_MS = 15000;

export interface ReadingSectionProps {
  attemptId: string;
  candidateName: string;
  candidateId: string;
  onSubmitted: (result: AttemptResult | null) => void;
}

function firstQuestionNumber(test: SanitizedTest): number {
  return test.sections.reading?.passages[0]?.questionGroups[0]?.questions[0]?.number ?? 1;
}

export default function ReadingSection({ attemptId, candidateName, candidateId, onSubmitted }: ReadingSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const answers = useExamStore((s) => s.answers);
  const currentQuestion = useExamStore((s) => s.currentQuestion);
  const setAnswer = useExamStore((s) => s.setAnswer);
  const goToQuestion = useExamStore((s) => s.goToQuestion);
  const splitRatio = useExamStore((s) => s.splitRatio);
  const setSplitRatio = useExamStore((s) => s.setSplitRatio);
  const reconcileFromHeartbeat = useExamStore((s) => s.reconcileFromHeartbeat);

  useAutosave(attemptId);

  // Taymer nolga yetganda HAM, "Yakunlash" bosilganda HAM shu bitta yo'ldan
  // o'tadi — submitAttempt() serverda idempotent (attemptServer.ts), shuning
  // uchun ikkalasi bir vaqtda chaqirilsa ham xavfsiz.
  const doSubmit = useCallback(async () => {
    setSubmitting((already) => {
      if (already) return already;
      (async () => {
        try {
          // Yakunlashdan oldin so'nggi javoblarni saqlaymiz — aks holda hali
          // otilmagan 800ms debounce'dagi oxirgi javob yo'qolib qolardi.
          await useExamStore.getState().syncNow();
          const { result } = await submitAttempt(attemptId);
          onSubmitted(result);
        } catch {
          setLoadError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
          setSubmitting(false);
        }
      })();
      return true;
    });
  }, [attemptId, onSubmitted]);

  useExamTimer(doSubmit);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAttempt(attemptId);
        if (cancelled) return;
        if (data.attempt.status !== 'in_progress') {
          onSubmitted(data.attempt.result);
          return;
        }
        setTest(data.test);
        init({
          attemptId,
          mode: 'practice',
          section: 'reading',
          answers: data.attempt.answers,
          flagged: data.attempt.flagged,
          currentQuestion: data.attempt.lastQuestion || firstQuestionNumber(data.test),
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

  useEffect(() => {
    if (!test) return undefined;
    const id = setInterval(async () => {
      const data = await sendHeartbeat(attemptId, { currentQuestion: useExamStore.getState().currentQuestion });
      if (!data) return;
      reconcileFromHeartbeat(data.remainingSec);
      if (data.status !== 'in_progress') doSubmit();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [test, attemptId, reconcileFromHeartbeat, doSubmit]);

  if (loadError) {
    return (
      <div className="p-8 text-center text-sm text-danger" data-exam="">
        {loadError}
      </div>
    );
  }
  if (!test?.sections.reading) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--exam-muted)' }} data-exam="">
        Yuklanmoqda...
      </div>
    );
  }

  const passages = test.sections.reading.passages;
  const activePassage =
    passages.find((p) => p.questionGroups.some((g) => g.questions.some((q) => q.number === currentQuestion))) || passages[0];

  const footerGroups: QuestionGroupNav[] = passages.map((p, i) => ({
    label: `Passage ${i + 1}`,
    questions: p.questionGroups.flatMap((g) => g.questions.map((q) => q.number)),
  }));

  return (
    <ExamShell
      candidateName={candidateName}
      candidateId={candidateId}
      footerGroups={footerGroups}
      onSubmit={doSubmit}
      submitLabel={submitting ? 'Yuborilmoqda…' : 'Yakunlash'}
    >
      <SplitPane
        ratio={splitRatio}
        onRatioChange={setSplitRatio}
        leftLabel={`Reading Passage ${passages.indexOf(activePassage) + 1}`}
        rightLabel="Questions"
        left={<PassagePane passage={activePassage} />}
        right={
          <div>
            {activePassage.questionGroups.map((g) => (
              <QuestionGroupBlock key={g.id} group={g} answers={answers} onAnswerChange={(qNum, value) => setAnswer(qNum, value)} />
            ))}
          </div>
        }
      />
      {/* Savol paneli tugmasi bosilganda faqat savol paneli scroll qilishi
          kerak edi (§5.5) — currentQuestion o'zgarishini shu yerda kuzatib,
          shu savolga scroll qilamiz. */}
      <ScrollToQuestion currentQuestion={currentQuestion} />
    </ExamShell>
  );
}

// §5.5: "Tugma bosilganda savol paneli shu savolga smooth scroll + input'ga
// focus. Passage paneli qimirlamaydi." `goToQuestion` chaqirilganda
// (ExamFooterNav) shu effekt currentQuestion'ni kuzatib mos elementga scroll
// qiladi — komponent alohida, chunki uni chaqirish uchun DOM'ga ega bo'lishi kerak.
function ScrollToQuestion({ currentQuestion }: { currentQuestion: number }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-question-number="${currentQuestion}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentQuestion]);
  return null;
}
