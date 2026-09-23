'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useExamStore } from '../state/examStore';
import { fetchTestPreview, createMockAttempt, fetchAttempt, fetchActiveMock, type ActiveMockInfo, type TestPreview } from '../state/attemptsApi';
import IntroScreen from './IntroScreen';
import ConfirmFinishModal from './ConfirmFinishModal';
import MockResult from './MockResult';
import SectionTransition from '../shell/SectionTransition';
import ListeningSection from '../listening/ListeningSection';
import ReadingSection from '../reading/ReadingSection';
import WritingSection from '../writing/WritingSection';
import type { AttemptResult, ExamSectionKey, SanitizedTest } from '@/lib/exam/types';

// TZ-vocably-v2.md §19 Faza 3 item 15 — "Bo'lim orkestratsiyasi, intro, o'tish
// ekranlari". §9.1: Intro → Listening → "tugadi" (10s) → Reading → "tugadi"
// (10s) → Writing → yakuniy submit → natija. Bitta ATTEMPT uch bo'limni
// bosib o'tadi (attemptServer.ts#advanceMockSection) — har bo'lim komponenti
// (Listening/Reading/WritingSection) o'zi allaqachon Faza 1/2'da qurilgan,
// bu shell ularni FAQAT to'g'ri tartibda, to'g'ri `isFinal` bilan chaqiradi.
const SECTION_LABEL: Record<ExamSectionKey, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

type Phase = 'intro' | 'section' | 'transition' | 'result';

export interface MockShellProps {
  // Ixtiyoriy — bo'lmasa server tomoni tasodifiy test tanlaydi (pastdagi
  // GENERIC_MOCK_PREVIEW izohiga q.). Foydalanuvchi so'rovi: "mockda tanlash
  // bo'lmasin, to'liq avto".
  testId?: string;
  candidateName: string;
}

// TZ §9.2 intro ekrani `testId` bo'lmaganda (tasodifiy mock) shu YENGIL
// ma'lumotdan foydalanadi — `fetchTestPreview` chaqirilmaydi, chunki
// qaysi test tanlanishi ATAYLAB oldindan ko'rsatilmaydi (aks holda bu
// "tanlash"ning yashirin shakli bo'lardi). Raqamlar barcha seed qilingan
// testlarda bir xil standart IELTS uzunligi (30/60/60 daq, 40/40/2).
const GENERIC_MOCK_PREVIEW: TestPreview = {
  id: '',
  title: 'Vocably Mock Imtihon',
  module: 'academic',
  sections: {
    listening: { durationSec: 1800, questionCount: 40 },
    reading: { durationSec: 3600, questionCount: 40 },
    writing: { durationSec: 3600, taskCount: 2 },
  },
};

// TZ-vocably-v2.md §5.4 — "soxta candidate ID (attemptId oxirgi 7 raqami)."
function candidateIdFrom(attemptId: string): string {
  return attemptId.slice(-7).toUpperCase();
}

interface PendingConfirm {
  unanswered: number[];
  resolve: (confirmed: boolean) => void;
}

export default function MockShell({ testId, candidateName }: MockShellProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [testPreview, setTestPreview] = useState<TestPreview | null>(null);
  const [previewError, setPreviewError] = useState('');
  // Boshlash xatosi intro ekranining ichida ko'rsatiladi (qayta urinish mumkin).
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);
  // VOCABLY-TZ.md §1.1/"Attempt boshqaruvi" auditi — `undefined` = hali
  // so'ralmoqda (intro ekrani shu payt "Yuklanmoqda..." ko'rsatadi, aks holda
  // tugma bir lahza noto'g'ri matn bilan chaqib keyin o'zgarib qolardi),
  // `null` = tugallanmagan mock yo'q (yoki `testId` aniq berilgan — bu holda
  // resume tanlovi kerak emas, /attempts o'zi mavjud urinishni qaytaradi).
  const [activeMock, setActiveMock] = useState<ActiveMockInfo | null | undefined>(testId ? null : undefined);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sections, setSections] = useState<ExamSectionKey[]>([]);
  const [currentSection, setCurrentSection] = useState<ExamSectionKey | null>(null);
  const [fullTest, setFullTest] = useState<SanitizedTest | null>(null);
  const [transitionInfo, setTransitionInfo] = useState<{ completed: ExamSectionKey; next: ExamSectionKey } | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  useEffect(() => {
    if (!testId) {
      setTestPreview(GENERIC_MOCK_PREVIEW);
      return;
    }
    let cancelled = false;
    fetchTestPreview(testId)
      .then((p) => !cancelled && setTestPreview(p))
      .catch(() => !cancelled && setPreviewError("Testni yuklab bo'lmadi."));
    return () => {
      cancelled = true;
    };
  }, [testId]);

  useEffect(() => {
    if (testId) return;
    let cancelled = false;
    fetchActiveMock()
      .then((info) => !cancelled && setActiveMock(info))
      .catch(() => !cancelled && setActiveMock(null));
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const handleStart = async (fresh?: boolean) => {
    setStarting(true);
    setStartError('');
    try {
      const { attemptId: newAttemptId } = await createMockAttempt(testId, fresh);
      const data = await fetchAttempt(newAttemptId);
      setAttemptId(newAttemptId);
      setSections(data.attempt.sections as ExamSectionKey[]);
      setCurrentSection(data.attempt.currentSection as ExamSectionKey);
      setFullTest(data.test);
      setPhase('section');
    } catch {
      setStartError("Imtihonni boshlab bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setStarting(false);
    }
  };

  const handleSectionAdvanced = useCallback(async () => {
    if (!attemptId || !currentSection) return;
    try {
      const data = await fetchAttempt(attemptId);
      const nextSection = data.attempt.currentSection as ExamSectionKey;
      setFullTest(data.test);
      setTransitionInfo({ completed: currentSection, next: nextSection });
      setCurrentSection(nextSection);
      setPhase('transition');
    } catch {
      // Tarmoq xatosi — bo'lim komponenti o'zining loadError holatini
      // ko'rsatgan bo'lishi mumkin, bu yerda qo'shimcha qilish shart emas.
    }
  }, [attemptId, currentSection]);

  const handleTransitionComplete = () => setPhase('section');

  const handleSubmitted = (r: AttemptResult | null) => {
    setResult(r);
    setPhase('result');
  };

  // TZ §9.3 — Writing'ning "Yakunlash" tugmasi qo'lda bosilganda (taymer
  // tugashi bilan EMAS) chaqiriladi. Javobsiz savollar ro'yxati Listening +
  // Reading bo'yicha hisoblanadi (Writing — matn, "javobsiz" tushunchasi yo'q).
  // `useExamStore`dagi `answers` MOCK davomida bitta umumiy to'plam (har
  // bo'lim o'zining "q{N}" kalitlarini yozadi), shuning uchun Writing
  // bosqichida ham oldingi ikki bo'limning javoblari allaqachon shu yerda.
  const confirmFinish = useCallback((): Promise<boolean> => {
    const answers = useExamStore.getState().answers;
    const allNumbers = [
      ...(fullTest?.sections.listening?.parts.flatMap((p) => p.questionGroups.flatMap((g) => g.questions.map((q) => q.number))) || []),
      ...(fullTest?.sections.reading?.passages.flatMap((p) => p.questionGroups.flatMap((g) => g.questions.map((q) => q.number))) || []),
    ];
    const unanswered = allNumbers.filter((n) => {
      const v = answers[`q${n}`];
      return v == null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    return new Promise((resolve) => setPendingConfirm({ unanswered, resolve }));
  }, [fullTest]);

  if (previewError) {
    return (
      <div className="p-8 text-center text-sm">
        <p className="text-danger">{previewError}</p>
        <Link href="/app" className="inline-flex items-center min-h-11 mt-2 font-semibold text-accent hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  if (phase === 'intro') {
    if (!testPreview || activeMock === undefined) {
      return <div className="p-8 text-center text-sm text-muted">Yuklanmoqda...</div>;
    }
    return <IntroScreen test={testPreview} onStart={handleStart} starting={starting} resumeInfo={activeMock} error={startError} />;
  }

  if (phase === 'transition' && transitionInfo) {
    return (
      <SectionTransition
        completedLabel={SECTION_LABEL[transitionInfo.completed]}
        nextLabel={SECTION_LABEL[transitionInfo.next]}
        onComplete={handleTransitionComplete}
      />
    );
  }

  if (phase === 'result' && attemptId) {
    return <MockResult attemptId={attemptId} result={result} />;
  }

  if (phase === 'section' && attemptId && currentSection) {
    const isFinal = sections.indexOf(currentSection) === sections.length - 1;

    if (currentSection === 'listening') {
      return (
        <ListeningSection
          attemptId={attemptId}
          candidateName={candidateName}
          candidateId={candidateIdFrom(attemptId)}
          isFinal={isFinal}
          onSectionAdvanced={handleSectionAdvanced}
          onSubmitted={handleSubmitted}
        />
      );
    }
    if (currentSection === 'reading') {
      return (
        <ReadingSection
          attemptId={attemptId}
          candidateName={candidateName}
          candidateId={candidateIdFrom(attemptId)}
          isFinal={isFinal}
          onSectionAdvanced={handleSectionAdvanced}
          onSubmitted={handleSubmitted}
        />
      );
    }
    if (currentSection === 'writing') {
      return (
        <>
          <WritingSection
            attemptId={attemptId}
            candidateName={candidateName}
            candidateId={candidateIdFrom(attemptId)}
            onSubmitted={handleSubmitted}
            confirmFinish={confirmFinish}
          />
          {pendingConfirm && (
            <ConfirmFinishModal
              unansweredNumbers={pendingConfirm.unanswered}
              onCancel={() => {
                pendingConfirm.resolve(false);
                setPendingConfirm(null);
              }}
              onConfirm={() => {
                pendingConfirm.resolve(true);
                setPendingConfirm(null);
              }}
            />
          )}
        </>
      );
    }
  }

  return null;
}
