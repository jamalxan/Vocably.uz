'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useExamStore } from '../state/examStore';
import { useExamTimer } from '../state/useExamTimer';
import { fetchAttempt, sendHeartbeat, submitAttempt, gradeSpeaking } from '../state/attemptsApi';
import ExamShell from '../shell/ExamShell';
import PartGap from '../listening/PartGap';
import CueCard from './CueCard';
import RecordingPane from './RecordingPane';
import type { AttemptResult, SanitizedTest, SpeakingRecording } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 4 item 23 — Speaking bo'limi. §9.1'dagi eski TZ
// qoidasi bo'yicha Mock orkestratsiyasidan (Listening->Reading->Writing)
// TASHQARIDA — mustaqil `mode:'section'` urinish, xuddi eski (pre-exam-engine)
// `/app/gapirish` kabi. Split-pane YO'Q (Reading/Listening/Writing'dan farqli) —
// bitta ustunli, savoldan-savolga o'tuvchi oqim, chunki Speaking'da "matn +
// javob" emas, faqat "savol -> ovozli javob" bor.
const HEARTBEAT_INTERVAL_MS = 15000;

interface Step {
  part: 1 | 2 | 3;
  questionIndex: number;
  prompt: string;
}

function stepKey(s: Pick<Step, 'part' | 'questionIndex'>): string {
  return `${s.part}:${s.questionIndex}`;
}

export interface SpeakingSectionProps {
  attemptId: string;
  candidateName: string;
  candidateId: string;
  onSubmitted: (result: AttemptResult | null) => void;
}

export default function SpeakingSection({ attemptId, candidateName, candidateId, onSubmitted }: SpeakingSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<Set<string>>(new Set());
  const [stepIndex, setStepIndex] = useState(0);
  // Part 2: kartochka o'qish + 1 daqiqalik tayyorgarlik BIR VAQTDA (haqiqiy
  // IELTS'da ham shunday — examiner kartochkani beradi VA "bir daqiqangiz bor"
  // deydi, ikkalasi ketma-ket EMAS). Faqat hali yozib olinmagan bo'lsa prep
  // bosqichidan boshlanadi; qayta ochilganda (masalan orqaga qaytilsa) yoki
  // qayta yozib olishda ham xuddi shu — foydalanuvchi navbatdan tashqari
  // "Tayyorman" deb to'xtata olmaydi, chunki bu haqiqiy imtihon amaliyoti.
  const [part2Phase, setPart2Phase] = useState<'prep' | 'record'>('prep');

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const reconcileFromHeartbeat = useExamStore((s) => s.reconcileFromHeartbeat);

  const doSubmit = useCallback(async () => {
    setSubmitting((already) => {
      if (already) return already;
      (async () => {
        try {
          const { result: submitResult } = await submitAttempt(attemptId);
          try {
            const { result: gradedResult } = await gradeSpeaking(attemptId);
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
        const keys = new Set((data.attempt.speaking?.recordings || []).map((r: SpeakingRecording) => stepKey(r)));
        setRecordedKeys(keys);
        init({
          attemptId,
          mode: 'practice',
          section: 'speaking',
          answers: {},
          flagged: [],
          currentQuestion: 0,
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
      const data = await sendHeartbeat(attemptId, {});
      if (!data) return;
      reconcileFromHeartbeat(data.remainingSec);
      if (data.status !== 'in_progress') doSubmit();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [test, attemptId, reconcileFromHeartbeat, doSubmit]);

  const steps: Step[] = useMemo(() => {
    const s = test?.sections.speaking;
    if (!s) return [];
    return [
      ...s.part1Questions.map((prompt, questionIndex) => ({ part: 1 as const, questionIndex, prompt })),
      { part: 2 as const, questionIndex: 0, prompt: s.part2CueCard.topic },
      ...s.part3Questions.map((prompt, questionIndex) => ({ part: 3 as const, questionIndex, prompt })),
    ];
  }, [test]);

  // Sahifa yangilansa — birinchi HALI yozib olinmagan savolga qaytadi (barchasi
  // yozib olingan bo'lsa oxirgisida qoladi, foydalanuvchi erkin ko'rib chiqadi/
  // qayta yozadi).
  useEffect(() => {
    if (steps.length === 0) return;
    const firstUnrecorded = steps.findIndex((s) => !recordedKeys.has(stepKey(s)));
    setStepIndex(firstUnrecorded === -1 ? steps.length - 1 : firstUnrecorded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length > 0]);

  useEffect(() => {
    const step = steps[stepIndex];
    if (step?.part === 2 && !recordedKeys.has(stepKey(step))) setPart2Phase('prep');
  }, [stepIndex, steps, recordedKeys]);

  if (loadError) {
    return (
      <div className="p-8 text-center text-sm text-danger" data-exam="">
        {loadError}
      </div>
    );
  }
  if (!test?.sections.speaking || steps.length === 0) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--exam-muted)' }} data-exam="">
        Yuklanmoqda...
      </div>
    );
  }

  const cueCard = test.sections.speaking.part2CueCard;
  const step = steps[stepIndex];
  const partLabel = { 1: 'Part 1 — Kirish savollari', 2: 'Part 2 — Cue card', 3: 'Part 3 — Muhokama' }[step.part];
  const partSteps = steps.filter((s) => s.part === step.part);
  const positionInPart = partSteps.findIndex((s) => s.questionIndex === step.questionIndex) + 1;

  return (
    <ExamShell
      candidateName={candidateName}
      candidateId={candidateId}
      customFooter={
        <div
          className="flex-shrink-0 h-16 flex items-center justify-between gap-3 px-4 border-t"
          style={{ background: 'var(--exam-chrome)', borderColor: 'var(--exam-chrome-border)' }}
        >
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            aria-label="Oldingi savol"
            className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-30 focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
            style={{ border: '1px solid var(--exam-chrome-border)', color: 'var(--exam-text)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--exam-muted)' }}>
            {stepIndex + 1} / {steps.length}
          </p>
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            disabled={stepIndex === steps.length - 1}
            aria-label="Keyingi savol"
            className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-30 focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
            style={{ border: '1px solid var(--exam-chrome-border)', color: 'var(--exam-text)' }}
          >
            <ChevronRight size={16} />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={doSubmit}
            className="h-9 px-3 flex items-center gap-1.5 rounded-lg text-white text-[13px] font-semibold focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
            style={{ background: 'var(--exam-accent)' }}
          >
            {submitting ? 'Yuborilmoqda…' : 'Yakunlash'}
          </button>
        </div>
      }
    >
      <div className="h-full overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--exam-muted)' }}>
            {partLabel} · {positionInPart}/{partSteps.length}
          </p>

          {step.part === 2 ? (
            <>
              <CueCard cueCard={cueCard} />
              <div className="mt-4">
                {recordedKeys.has(stepKey(step)) ? (
                  <RecordingPane
                    part={2}
                    questionIndex={0}
                    maxDurationSec={cueCard.speakSec}
                    alreadyRecorded
                    onUploaded={() => setRecordedKeys((prev) => new Set(prev).add(stepKey(step)))}
                  />
                ) : part2Phase === 'prep' ? (
                  <PartGap
                    durationSec={cueCard.prepSec}
                    message="Tayyorgarlik vaqti — kartochkani o'qing, qisqacha eslatma tuzishingiz mumkin"
                    onComplete={() => setPart2Phase('record')}
                  />
                ) : (
                  <RecordingPane
                    part={2}
                    questionIndex={0}
                    maxDurationSec={cueCard.speakSec}
                    alreadyRecorded={false}
                    onUploaded={() => setRecordedKeys((prev) => new Set(prev).add(stepKey(step)))}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold mb-4" style={{ color: 'var(--exam-text)' }}>
                {step.prompt}
              </p>
              <RecordingPane
                key={stepKey(step)}
                part={step.part}
                questionIndex={step.questionIndex}
                alreadyRecorded={recordedKeys.has(stepKey(step))}
                onUploaded={() => setRecordedKeys((prev) => new Set(prev).add(stepKey(step)))}
              />
            </>
          )}
        </div>
      </div>
    </ExamShell>
  );
}
