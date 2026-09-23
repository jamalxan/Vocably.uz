'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, Rewind, FastForward, Loader2 } from 'lucide-react';
import { useExamStore } from '../state/examStore';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, submitAttempt } from '../state/attemptsApi';
import AudioEngine, { type AudioEngineHandle } from './AudioEngine';
import { resolveListeningAudioSrc } from './audioSrc';
import AudioProgress from './AudioProgress';
import QuestionGroupBlock from '../questions/QuestionGroupBlock';
import ConfirmFinishModal from '../mock/ConfirmFinishModal';
import { ExamLoadError, ExamLoading, SubmitErrorBanner } from '../shell/ExamStatus';
import { unansweredNumbers } from '../state/unanswered';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';

// VOCABLY_TZ_FINAL...2026-09-20.md "7. LISTENING — PROFESSIONAL REBUILD ›
// Practice mode": "replay allowed / 0.75x-1x-1.25x speed (practice only)".
// ATAYLAB ListeningSection.tsx'dan ALOHIDA komponent — bu yerda §7.1'ning
// qat'iy exam qoidalari (ketma-ket part, majburiy preview/gap, taymer bosimi)
// UMUMAN QO'LLANMAYDI, aralashtirish ikkalasini ham murakkablashtirar edi.
// Shuning uchun ham `ExamShell`/`data-exam` "imtihon xromi" ishlatilmaydi —
// faqat savol input'lari to'g'ri ko'rinishi uchun `data-exam` skoupidagi
// CSS o'zgaruvchilari kerak (QuestionGroupBlock ichidagi GapInput va h.k.
// ularga bevosita tayanadi), lekin taymer/footer-nav chizilmaydi.
const SEEK_STEP_SEC = 10;
const PLAYBACK_RATES = [0.75, 1, 1.25] as const;

export interface ListeningPracticeSectionProps {
  attemptId: string;
  onSubmitted: (result: AttemptResult | null) => void;
}

export default function ListeningPracticeSection({ attemptId, onSubmitted }: ListeningPracticeSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmUnanswered, setConfirmUnanswered] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [partIndex, setPartIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState(1);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<AudioEngineHandle>(null);

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
          onSubmitted(data.attempt.result);
          return;
        }
        setTest(data.test);
        init({
          attemptId,
          mode: 'practice',
          section: 'listening',
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

  const parts = test?.sections.listening?.parts || [];
  const currentPart = parts[partIndex];

  const handlePartChange = useCallback((i: number) => {
    setPartIndex(i);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await useExamStore.getState().syncNow();
      const { result } = await submitAttempt(attemptId);
      onSubmitted(result);
    } catch {
      setSubmitError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
      setSubmitting(false);
    }
  }, [attemptId, submitting, onSubmitted]);

  // Bir tasodifiy bosish mashqni yopib qo'ymasligi uchun — avval tasdiqlash.
  const requestFinish = () => {
    const numbers = parts.flatMap((p) => p.questionGroups.flatMap((g) => g.questions.map((q) => q.number)));
    setConfirmUnanswered(unansweredNumbers(numbers, useExamStore.getState().answers));
  };

  if (loadError) {
    return <ExamLoadError message={loadError} />;
  }
  if (!test?.sections.listening || !currentPart) {
    return <ExamLoading />;
  }

  return (
    <div data-exam="" className="min-h-dvh">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 space-y-4">
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
              Listening — mashq
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--exam-muted)' }}>
              Qayta tinglash va tezlikni o'zgartirish erkin
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

        <div className="flex gap-2 flex-wrap">
          {parts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePartChange(i)}
              aria-pressed={i === partIndex}
              className="min-h-11 md:min-h-9 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
              style={{
                background: i === partIndex ? 'var(--exam-accent)' : 'transparent',
                color: i === partIndex ? '#fff' : 'var(--exam-text)',
                borderColor: i === partIndex ? 'var(--exam-accent)' : 'var(--exam-chrome-border)',
              }}
            >
              Part {i + 1}
            </button>
          ))}
        </div>

        <AudioEngine
          ref={audioRef}
          src={resolveListeningAudioSrc(currentPart)}
          mode="practice"
          volume={volume}
          playbackRate={playbackRate}
          startPositionSec={0}
          play={playing}
          onPositionChange={setPosition}
          onEnded={() => setPlaying(false)}
          onDurationKnown={setDuration}
        />

        <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: 'var(--exam-chrome-border)', background: 'var(--exam-chrome)' }}>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => audioRef.current?.seekBy(-SEEK_STEP_SEC)}
              title="10 soniya orqaga"
              aria-label="10 soniya orqaga"
              className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
              style={{ color: 'var(--exam-text)' }}
            >
              <Rewind size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pauza' : "Ijro etish"}
              className="w-12 h-12 flex items-center justify-center rounded-full text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
              style={{ background: 'var(--exam-accent)' }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              type="button"
              onClick={() => audioRef.current?.seekBy(SEEK_STEP_SEC)}
              title="10 soniya oldinga"
              aria-label="10 soniya oldinga"
              className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
              style={{ color: 'var(--exam-text)' }}
            >
              <FastForward size={18} />
            </button>
          </div>

          <AudioProgress positionSec={position} durationSec={duration || currentPart.durationSec} />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              {PLAYBACK_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  aria-pressed={rate === playbackRate}
                  className="min-h-11 min-w-11 md:min-h-8 md:min-w-0 px-3 md:px-2 py-1 rounded text-xs font-semibold border focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
                  style={{
                    background: rate === playbackRate ? 'var(--exam-accent)' : 'transparent',
                    color: rate === playbackRate ? '#fff' : 'var(--exam-muted)',
                    borderColor: rate === playbackRate ? 'var(--exam-accent)' : 'var(--exam-chrome-border)',
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24"
              aria-label="Ovoz balandligi"
            />
          </div>
        </div>

        {currentPart.contextText && (
          <p className="text-sm" style={{ color: 'var(--exam-muted)' }}>
            {currentPart.contextText}
          </p>
        )}

        <div className="space-y-4">
          {currentPart.questionGroups.map((g) => (
            <QuestionGroupBlock key={g.id} group={g} answers={answers} onAnswerChange={(qNum, value) => setAnswer(qNum, value)} />
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
