'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useExamStore } from '../state/examStore';
import { useExamTimer } from '../state/useExamTimer';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, sendHeartbeat, submitAttempt, advanceMockSection } from '../state/attemptsApi';
import ExamShell from '../shell/ExamShell';
import QuestionGroupBlock from '../questions/QuestionGroupBlock';
import AudioEngine, { type AudioEngineHandle } from './AudioEngine';
import { resolveListeningAudioSrc } from './audioSrc';
import AudioProgress from './AudioProgress';
import VolumeCheck from './VolumeCheck';
import { NEUTRAL_TEST_TONE_URL } from './testTone';
import PartGap from './PartGap';
import { ExamLoadError, ExamLoading, SubmitErrorBanner } from '../shell/ExamStatus';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';
import type { QuestionGroupNav } from '../shell/ExamFooterNav';

// TZ-vocably-v2.md §19 Faza 2 item 10 (3/3) — ListeningSection: VolumeCheck →
// (30s preview, VOCABLY-TZ.md item 10) → part 1 → (gapAfterSec bo'lsa PartGap)
// → (30s preview) → part 2 → ... → oxirgi part tugagach 2 daqiqalik PartGap
// (§7.5) → avtomatik submit. Split-pane YO'Q (§7.3: "faqat savollar paneli,
// markazda, max-width: 860px").
//
// Diqqat — footer savol paneli BARCHA part'larni ko'rsatadi (ExamFooterNav,
// Reading bilan bir xil), lekin markaziy kontent FAQAT joriy o'ynalayotgan
// part'ning savollarini ko'rsatadi (audio ketma-ket, orqaga qaytib bo'lmaydi —
// §7.1). Boshqa part'ga tegishli tugma bosilsa `currentQuestion` yangilanadi,
// lekin ko'rinadigan kontent o'zgarmaydi (real imtihonda ham keyingi part
// audiosi tugamaguncha uning savollariga "sakrab" bo'lmaydi) — bu ataylab,
// unutilgani uchun emas.
const HEARTBEAT_INTERVAL_MS = 15000;
const FINAL_CHECK_SEC = 120; // §7.5 — "2 daqiqa tekshirish"
// VOCABLY-TZ.md §2.1/§5 item 10 — "har Part oldidan 'You will have 30
// seconds to look at questions X-Y'." Haqiqiy IELTS'da bu audio BOSHLANISHIDAN
// OLDIN beriladi (§7.4'dagi `gapAfterSec` esa PART TUGAGANDAN keyingi "javobni
// tekshirish" pauzasi — ikkalasi bir xil emas, ikkalasi ham kerak).
const PREVIEW_SEC = 30;

type Phase = 'loading' | 'volume-check' | 'part-preview' | 'playing' | 'part-gap' | 'final-check';

function questionRangeLabel(part: { questionGroups: { questions: { number: number }[] }[] }): string {
  const numbers = part.questionGroups.flatMap((g) => g.questions.map((q) => q.number));
  if (numbers.length === 0) return '';
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? `question ${min}` : `questions ${min}-${max}`;
}

export interface ListeningSectionProps {
  attemptId: string;
  candidateName: string;
  candidateId: string;
  onSubmitted: (result: AttemptResult | null) => void;
  // TZ §9.1 — Mock'da Listening HAR DOIM birinchi bo'lim (hech qachon oxirgi
  // emas) — ReadingSection.tsx'dagi izohga q.
  isFinal?: boolean;
  onSectionAdvanced?: () => void;
}

export default function ListeningSection({
  attemptId,
  candidateName,
  candidateId,
  onSubmitted,
  isFinal = true,
  onSectionAdvanced,
}: ListeningSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [partIndex, setPartIndex] = useState(0);
  const [playedParts, setPlayedParts] = useState<number[]>([]);
  const [volume, setVolume] = useState(1);
  const [position, setPosition] = useState(0);
  // Audio faylning HAQIQIY uzunligi (brauzer metadata'dan biladi). Kontent
  // hujjatidagi `part.durationSec` 0 bo'lishi mumkin — admin AI chat orqali
  // biriktirilgan audioda server tomonda uzunlikni o'lchaydigan vosita
  // (ffmpeg) yo'q. Shunday holatda progress chizig'i "0:00 / 0:00" bo'lib
  // qolmasligi uchun brauzerning o'z qiymatiga qaytamiz.
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlay, setAudioPlay] = useState(false);
  const [audioProblem, setAudioProblem] = useState(false);
  const positionRef = useRef(0);
  const audioRef = useRef<AudioEngineHandle>(null);
  // Heartbeat interval'i har volume/part o'zgarishida qayta yaratilmasligi uchun.
  const partIndexRef = useRef(0);
  const volumeRef = useRef(1);
  useEffect(() => {
    partIndexRef.current = partIndex;
    volumeRef.current = volume;
  }, [partIndex, volume]);

  const init = useExamStore((s) => s.init);
  const reset = useExamStore((s) => s.reset);
  const answers = useExamStore((s) => s.answers);
  const setAnswer = useExamStore((s) => s.setAnswer);

  useAutosave(attemptId);

  const doSubmit = useCallback(async () => {
    setSubmitting((already) => {
      if (already) return already;
      (async () => {
        try {
          await useExamStore.getState().syncNow();
          if (isFinal) {
            const { result } = await submitAttempt(attemptId);
            onSubmitted(result);
          } else {
            await advanceMockSection(attemptId);
            onSectionAdvanced?.();
          }
        } catch {
          setSubmitError("Yakunlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring.");
          setSubmitting(false);
        }
      })();
      return true;
    });
  }, [attemptId, isFinal, onSubmitted, onSectionAdvanced]);

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
        const parts = data.test.sections.listening?.parts || [];
        const savedPlayed = data.attempt.audio.playedParts || [];
        // Refresh'dan keyin allaqachon o'ynalgan partdan keyingisidan davom
        // etamiz — §7.1 "playedParts'ga qo'shilgan part qayta tinglanmaydi".
        let resumeIndex = data.attempt.audio.partIndex || 0;
        while (savedPlayed.includes(resumeIndex) && resumeIndex < parts.length - 1) resumeIndex += 1;
        // Barcha part'lar allaqachon tinglangan (masalan yakuniy tekshiruv
        // paytida refresh) — oxirgi part qayta o'ynalmaydi, darhol tekshiruvga.
        const allPlayed = parts.length > 0 && savedPlayed.includes(resumeIndex);
        setPartIndex(resumeIndex);
        setPlayedParts(savedPlayed);
        setVolume(data.attempt.audio.volume || 1);
        positionRef.current = savedPlayed.includes(resumeIndex) ? 0 : data.attempt.audio.positionSec || 0;
        setPosition(positionRef.current);

        init({
          attemptId,
          mode: 'practice',
          section: 'listening',
          answers: data.attempt.answers,
          flagged: data.attempt.flagged,
          currentQuestion: data.attempt.lastQuestion || parts[0]?.questionGroups[0]?.questions[0]?.number || 1,
          endsAt: new Date(data.endsAt).getTime(),
          serverNow: new Date(data.serverNow).getTime(),
        });
        setPhase(allPlayed ? 'final-check' : 'volume-check');
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
      const data = await sendHeartbeat(attemptId, {
        audioPositionSec: positionRef.current,
        currentQuestion: useExamStore.getState().currentQuestion,
        partIndex: partIndexRef.current,
        volume: volumeRef.current,
      });
      if (!data) return;
      useExamStore.getState().reconcileFromHeartbeat(data.remainingSec);
      if (data.status !== 'in_progress') doSubmit();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [test, attemptId, doSubmit]);

  const parts = test?.sections.listening?.parts || [];
  const currentPart = parts[partIndex];

  const handlePartEnded = useCallback(() => {
    if (!currentPart) return;
    setAudioPlay(false);
    setPlayedParts((prev) => (prev.includes(partIndex) ? prev : [...prev, partIndex]));
    sendHeartbeat(attemptId, { partIndex, partEnded: true }).catch(() => {});

    const isLastPart = partIndex >= parts.length - 1;
    if (isLastPart) {
      setPhase('final-check');
    } else if (currentPart.gapAfterSec) {
      setPhase('part-gap');
    } else {
      // `play` false→true o'tishi kerak (aks holda yangi src ijro etilmaydi) —
      // shuning uchun gap'siz part ham preview orqali boshlanadi.
      setPartIndex((i) => i + 1);
      positionRef.current = 0;
      setPosition(0);
      setPhase('part-preview');
    }
  }, [attemptId, currentPart, partIndex, parts.length]);

  const handleGapComplete = () => {
    setPartIndex((i) => i + 1);
    positionRef.current = 0;
    setPosition(0);
    setPhase('part-preview');
  };

  const handlePreviewComplete = () => {
    setAudioProblem(false);
    setAudioPlay(true);
    setPhase('playing');
  };

  const handleRetryAudio = async () => {
    const ok = await audioRef.current?.retryPlay();
    if (ok) setAudioProblem(false);
  };

  const retrySubmit = () => {
    setSubmitError(null);
    doSubmit();
  };

  if (loadError) {
    return <ExamLoadError message={loadError} />;
  }
  if (phase === 'loading' || !test?.sections.listening || !currentPart) {
    return <ExamLoading />;
  }

  if (phase === 'volume-check') {
    return (
      <VolumeCheck
        sampleAudioUrl={NEUTRAL_TEST_TONE_URL}
        volume={volume}
        onVolumeChange={setVolume}
        onStart={() => setPhase('part-preview')}
      />
    );
  }

  const footerGroups: QuestionGroupNav[] = parts.map((p, i) => ({
    label: `Part ${i + 1}`,
    questions: p.questionGroups.flatMap((g) => g.questions.map((q) => q.number)),
  }));

  // Preview / "javoblarni tekshiring" / yakuniy tekshiruv — savollar YASHIRILMAYDI,
  // taymer ular ustida ixcham banner sifatida. `key` — har bosqich yangi taymer.
  let banner: ReactNode = null;
  if (phase === 'part-preview') {
    banner = (
      <PartGap
        key={`preview-${partIndex}`}
        variant="banner"
        durationSec={PREVIEW_SEC}
        message={`You will have 30 seconds to look at ${questionRangeLabel(currentPart)}.`}
        onComplete={handlePreviewComplete}
      />
    );
  } else if (phase === 'part-gap' && currentPart.gapAfterSec) {
    banner = (
      <PartGap
        key={`gap-${partIndex}`}
        variant="banner"
        durationSec={currentPart.gapAfterSec}
        message="Javoblaringizni tekshiring"
        onComplete={handleGapComplete}
      />
    );
  } else if (phase === 'final-check') {
    banner = (
      <PartGap
        key="final-check"
        variant="banner"
        durationSec={FINAL_CHECK_SEC}
        message="Endi javoblaringizni tekshirish uchun vaqtingiz bor"
        onComplete={doSubmit}
      />
    );
  }

  // Yakuniy tekshiruvda barcha part'lar savollari, aks holda faqat joriy part.
  const visibleParts =
    phase === 'final-check' ? parts.map((part, index) => ({ part, index })) : [{ part: currentPart, index: partIndex }];

  return (
    <ExamShell
      candidateName={candidateName}
      candidateId={candidateId}
      showVolume
      volume={volume}
      onVolumeChange={setVolume}
      footerGroups={footerGroups}
      onSubmit={isFinal ? doSubmit : undefined}
      submitLabel={submitting ? 'Submitting…' : 'Finish'}
    >
      <AudioEngine
        ref={audioRef}
        src={resolveListeningAudioSrc(currentPart)}
        mode="exam"
        volume={volume}
        startPositionSec={positionRef.current}
        play={audioPlay}
        onPositionChange={(sec) => {
          positionRef.current = sec;
          setPosition(sec);
        }}
        onEnded={handlePartEnded}
        onDurationKnown={(sec) => setAudioDuration(Number.isFinite(sec) ? sec : 0)}
        onPlaybackError={() => setAudioProblem(true)}
      />

      <div className="h-full overflow-y-auto">
        {banner}
        <div className="max-w-[860px] mx-auto px-6 py-6 space-y-8">
          {audioProblem && phase === 'playing' && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
              style={{ borderColor: 'var(--exam-danger)', color: 'var(--exam-text)' }}
            >
              <p className="min-w-0 text-sm" style={{ color: 'var(--exam-danger)' }}>
                Audio ishga tushmadi.
              </p>
              <button
                type="button"
                onClick={handleRetryAudio}
                className="min-h-11 md:min-h-9 px-4 rounded-lg text-sm font-semibold text-white focus-visible:outline-none focus-visible:shadow-[var(--exam-focus-ring)]"
                style={{ background: 'var(--exam-accent)' }}
              >
                Audioni boshlash
              </button>
            </div>
          )}
          {visibleParts.map(({ part, index }) => (
            <section key={index} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--exam-muted)' }}>
                  Part {index + 1}
                </p>
                {phase !== 'final-check' && (
                  <div className="flex-1 max-w-xs">
                    <AudioProgress positionSec={position} durationSec={part.durationSec || audioDuration} />
                  </div>
                )}
              </div>
              {part.contextText && (
                <p className="text-sm" style={{ color: 'var(--exam-muted)' }}>
                  {part.contextText}
                </p>
              )}
              {part.questionGroups.map((g) => (
                <QuestionGroupBlock key={g.id} group={g} answers={answers} onAnswerChange={(qNum, value) => setAnswer(qNum, value)} />
              ))}
            </section>
          ))}
        </div>
      </div>
      {submitError && <SubmitErrorBanner message={submitError} onRetry={retrySubmit} retrying={submitting} />}
    </ExamShell>
  );
}
