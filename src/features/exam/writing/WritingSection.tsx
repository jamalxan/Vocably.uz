'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useExamStore } from '../state/examStore';
import { useExamTimer } from '../state/useExamTimer';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, sendHeartbeat, submitAttempt, gradeWriting } from '../state/attemptsApi';
import ExamShell from '../shell/ExamShell';
import SplitPane from '../split/SplitPane';
import TaskPane from './TaskPane';
import EssayEditor from './EssayEditor';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 2 item 12 — "WritingSection to'liq". §8.4:
// "Footer'da ikkita katta tugma: Task 1 va Task 2. Bitta 60-daqiqalik taymer
// ikkalasiga umumiy... Foydalanuvchi ixtiyoriy ravishda almashadi — cheklov
// yo'q." AI baholash (§8.5) — Faza 2 item 13, alohida ish (queue+polling
// infratuzilmasi kerak); bu komponent faqat matnni saqlaydi va submit qiladi,
// `result.writing` `null` qoladi (attemptServer.ts hozircha shunday).
const HEARTBEAT_INTERVAL_MS = 15000;

export interface WritingSectionProps {
  attemptId: string;
  candidateName: string;
  candidateId: string;
  onSubmitted: (result: AttemptResult | null) => void;
  // TZ §9.3 — Mock'da Writing HAR DOIM oxirgi bo'lim (attemptServer.ts'dagi
  // MOCK_SECTION_ORDER), shuning uchun bu yerdagi "Yakunlash" — butun mock'ni
  // tugatadi. Qo'lda bosilganda (taymer tugashi bilan EMAS — o'shanda
  // tasdiqlashga vaqt/ma'no yo'q) `confirmFinish` berilgan bo'lsa avval
  // chaqiriladi; `false` qaytarsa yakunlash bekor qilinadi.
  confirmFinish?: () => Promise<boolean>;
}

export default function WritingSection({ attemptId, candidateName, candidateId, onSubmitted, confirmFinish }: WritingSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const essays = useExamStore((s) => s.essays);
  const activeWritingTask = useExamStore((s) => s.activeWritingTask);
  const setActiveWritingTask = useExamStore((s) => s.setActiveWritingTask);
  const setEssayText = useExamStore((s) => s.setEssayText);
  const splitRatio = useExamStore((s) => s.splitRatio);
  const setSplitRatio = useExamStore((s) => s.setSplitRatio);
  const reconcileFromHeartbeat = useExamStore((s) => s.reconcileFromHeartbeat);

  useAutosave(attemptId);

  // §8.5 — submit'dan keyin DARHOL grade-writing chaqiriladi (queue yo'q,
  // sinxron — writingGrader.ts izohiga q.). AI vaqtincha ishlamasa ham submit
  // natijasi baribir saqlangan bo'ladi (attempt.status 'submitted'da qoladi) —
  // WritingResult.tsx shu holatda "Qayta baholash" tugmasini ko'rsatadi.
  const doSubmit = useCallback(async () => {
    setSubmitting((already) => {
      if (already) return already;
      (async () => {
        try {
          await useExamStore.getState().syncNow();
          const { result: submitResult } = await submitAttempt(attemptId);
          try {
            const { result: gradedResult } = await gradeWriting(attemptId);
            onSubmitted(gradedResult);
          } catch {
            onSubmitted(submitResult);
          }
        } catch {
          setLoadError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
          setSubmitting(false);
        }
      })();
      return true;
    });
  }, [attemptId, onSubmitted]);

  // Qo'lda bosilgan "Yakunlash" — tasdiqlash (Mock'da) darvozasidan o'tadi,
  // avtomatik (taymer) yo'l esa to'g'ridan-to'g'ri `doSubmit`ni chaqiradi.
  const handleManualFinish = useCallback(async () => {
    if (confirmFinish) {
      const confirmed = await confirmFinish();
      if (!confirmed) return;
    }
    await doSubmit();
  }, [confirmFinish, doSubmit]);

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
          section: 'writing',
          answers: data.attempt.answers,
          flagged: data.attempt.flagged,
          currentQuestion: 0,
          endsAt: new Date(data.endsAt).getTime(),
          serverNow: new Date(data.serverNow).getTime(),
          essays: data.attempt.essays,
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
      const data = await sendHeartbeat(attemptId, {});
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
  if (!test?.sections.writing) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--exam-muted)' }} data-exam="">
        Yuklanmoqda...
      </div>
    );
  }

  const [task1, task2] = test.sections.writing.tasks;
  const activeTask = activeWritingTask === 1 ? task1 : task2;
  const activeEssay = activeWritingTask === 1 ? essays.task1 : essays.task2;

  return (
    <ExamShell
      candidateName={candidateName}
      candidateId={candidateId}
      customFooter={
        <div
          className="flex-shrink-0 h-16 flex items-center justify-between gap-3 px-4 border-t"
          style={{ background: 'var(--exam-chrome)', borderColor: 'var(--exam-chrome-border)' }}
        >
          <div className="flex items-center gap-2">
            {[1, 2].map((n) => {
              const isActive = activeWritingTask === n;
              const wc = n === 1 ? essays.task1.wordCount : essays.task2.wordCount;
              const min = n === 1 ? task1.minWords : task2.minWords;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setActiveWritingTask(n as 1 | 2)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  style={{
                    background: isActive ? 'var(--exam-accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--exam-text)',
                    border: isActive ? 'none' : '1px solid var(--exam-chrome-border)',
                  }}
                >
                  Task {n}
                  {wc >= min && <Check size={14} />}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleManualFinish}
            className="h-9 px-3 flex items-center gap-1.5 rounded-lg text-white text-[13px] font-semibold"
            style={{ background: 'var(--exam-accent)' }}
          >
            {submitting ? 'Yuborilmoqda…' : 'Yakunlash'}
          </button>
        </div>
      }
    >
      <SplitPane
        ratio={splitRatio}
        onRatioChange={setSplitRatio}
        leftLabel={`Writing Task ${activeTask.order}`}
        rightLabel="Editor"
        rightPadded={false}
        left={<TaskPane task={activeTask} />}
        right={
          <EssayEditor
            text={activeEssay.text}
            onTextChange={(text) => setEssayText(activeWritingTask, text)}
            wordCount={activeEssay.wordCount}
            minWords={activeTask.minWords}
          />
        }
      />
    </ExamShell>
  );
}
