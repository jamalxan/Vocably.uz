'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useExamStore } from '../state/examStore';
import { useExamTimer } from '../state/useExamTimer';
import { useAutosave } from '../state/useAutosave';
import { fetchAttempt, sendHeartbeat, submitAttempt } from '../state/attemptsApi';
import ExamShell from '../shell/ExamShell';
import QuestionGroupBlock from '../questions/QuestionGroupBlock';
import AudioEngine from './AudioEngine';
import AudioProgress from './AudioProgress';
import VolumeCheck from './VolumeCheck';
import PartGap from './PartGap';
import type { AttemptResult, SanitizedTest } from '@/lib/exam/types';
import type { QuestionGroupNav } from '../shell/ExamFooterNav';

// TZ-vocably-v2.md §19 Faza 2 item 10 (3/3) — ListeningSection: VolumeCheck →
// part 1 → (gapAfterSec bo'lsa PartGap) → part 2 → ... → oxirgi part tugagach
// 2 daqiqalik PartGap (§7.5) → avtomatik submit. Split-pane YO'Q (§7.3: "faqat
// savollar paneli, markazda, max-width: 860px").
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

type Phase = 'loading' | 'volume-check' | 'playing' | 'part-gap' | 'final-check';

export interface ListeningSectionProps {
  attemptId: string;
  candidateName: string;
  candidateId: string;
  onSubmitted: (result: AttemptResult | null) => void;
}

export default function ListeningSection({ attemptId, candidateName, candidateId, onSubmitted }: ListeningSectionProps) {
  const [test, setTest] = useState<SanitizedTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [partIndex, setPartIndex] = useState(0);
  const [playedParts, setPlayedParts] = useState<number[]>([]);
  const [volume, setVolume] = useState(1);
  const [position, setPosition] = useState(0);
  const [audioPlay, setAudioPlay] = useState(false);
  const positionRef = useRef(0);

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
        const parts = data.test.sections.listening?.parts || [];
        const savedPlayed = data.attempt.audio.playedParts || [];
        // Refresh'dan keyin allaqachon o'ynalgan partdan keyingisidan davom
        // etamiz — §7.1 "playedParts'ga qo'shilgan part qayta tinglanmaydi".
        let resumeIndex = data.attempt.audio.partIndex || 0;
        while (savedPlayed.includes(resumeIndex) && resumeIndex < parts.length - 1) resumeIndex += 1;
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
        setPhase('volume-check');
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
        partIndex,
        volume,
      });
      if (!data) return;
      useExamStore.getState().reconcileFromHeartbeat(data.remainingSec);
      if (data.status !== 'in_progress') doSubmit();
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [test, attemptId, partIndex, volume, doSubmit]);

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
      setPartIndex((i) => i + 1);
      positionRef.current = 0;
      setPosition(0);
      setAudioPlay(true);
    }
  }, [attemptId, currentPart, partIndex, parts.length]);

  const handleGapComplete = () => {
    setPartIndex((i) => i + 1);
    positionRef.current = 0;
    setPosition(0);
    setAudioPlay(true);
    setPhase('playing');
  };

  if (loadError) {
    return (
      <div className="p-8 text-center text-sm text-danger" data-exam="">
        {loadError}
      </div>
    );
  }
  if (phase === 'loading' || !test?.sections.listening || !currentPart) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--exam-muted)' }} data-exam="">
        Yuklanmoqda...
      </div>
    );
  }

  if (phase === 'volume-check') {
    return (
      <VolumeCheck
        sampleAudioUrl={currentPart.audioUrl}
        volume={volume}
        onVolumeChange={setVolume}
        onStart={() => {
          setPhase('playing');
          setAudioPlay(true);
        }}
      />
    );
  }

  const footerGroups: QuestionGroupNav[] = parts.map((p, i) => ({
    label: `Part ${i + 1}`,
    questions: p.questionGroups.flatMap((g) => g.questions.map((q) => q.number)),
  }));

  return (
    <ExamShell
      candidateName={candidateName}
      candidateId={candidateId}
      showVolume
      volume={volume}
      onVolumeChange={setVolume}
      footerGroups={footerGroups}
      onSubmit={doSubmit}
      submitLabel={submitting ? 'Yuborilmoqda…' : 'Yakunlash'}
    >
      <AudioEngine
        src={currentPart.audioUrl}
        mode="exam"
        volume={volume}
        startPositionSec={positionRef.current}
        play={audioPlay}
        onPositionChange={(sec) => {
          positionRef.current = sec;
          setPosition(sec);
        }}
        onEnded={handlePartEnded}
      />

      {phase === 'part-gap' && currentPart.gapAfterSec ? (
        <PartGap durationSec={currentPart.gapAfterSec} message="Javoblaringizni tekshiring" onComplete={handleGapComplete} />
      ) : phase === 'final-check' ? (
        <PartGap durationSec={FINAL_CHECK_SEC} message="Endi javoblaringizni tekshirish uchun vaqtingiz bor" onComplete={doSubmit} />
      ) : (
        <div className="h-full overflow-y-auto">
          <div className="max-w-[860px] mx-auto px-6 py-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--exam-muted)' }}>
                Part {partIndex + 1}
              </p>
              <div className="flex-1 max-w-xs">
                <AudioProgress positionSec={position} durationSec={currentPart.durationSec} />
              </div>
            </div>
            {currentPart.contextText && (
              <p className="text-sm" style={{ color: 'var(--exam-muted)' }}>
                {currentPart.contextText}
              </p>
            )}
            {currentPart.questionGroups.map((g) => (
              <QuestionGroupBlock key={g.id} group={g} answers={answers} onAnswerChange={(qNum, value) => setAnswer(qNum, value)} />
            ))}
          </div>
        </div>
      )}
    </ExamShell>
  );
}
