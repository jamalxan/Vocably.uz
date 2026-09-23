'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useExamStore } from '../state/examStore';
import {
  fetchTestPreview,
  createMockAttempt,
  fetchAttempt,
  fetchActiveMock,
  goToMockSection as goToMockSectionApi,
  type ActiveMockInfo,
  type TestPreview,
} from '../state/attemptsApi';
import { useIntegrityEvents } from '../state/useIntegrityEvents';
import IntroScreen from './IntroScreen';
import ConfirmFinishModal from './ConfirmFinishModal';
import MockResult from './MockResult';
import SectionTransition from '../shell/SectionTransition';
import ListeningSection from '../listening/ListeningSection';
import ReadingSection from '../reading/ReadingSection';
import WritingSection from '../writing/WritingSection';
import type { AttemptResult, ExamSectionKey, SanitizedTest } from '@/lib/exam/types';
import { DEFAULT_MOCK_KIND, type MockKind } from '@/lib/exam/mockKind';

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
  // AUDIT Sprint 2/§52.1 — tanlangan (yoki davom ettirilayotgan urinishning
  // haqiqiy) mock rejimi. Server javobidan olinadi (`data.attempt.mockKind`) —
  // IntroScreen'dagi tanlov faqat "Boshlash" bosilganda ishlatiladi, shundan
  // keyin YAGONA haqiqat manbai server (masalan "Davom ettirish" bosilganda
  // eski urinishning ASL rejimi qaytadi, joriy UI tanlovidan qat'i nazar).
  const [mockKind, setMockKind] = useState<MockKind>(DEFAULT_MOCK_KIND);
  const [switchingSection, setSwitchingSection] = useState(false);

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

  // §52.1/§52.2 — `kind` IntroScreen'dagi tanlov (Practice/Exam/Secure).
  // Boshlangandan keyin YAGONA haqiqat manbai `data.attempt.mockKind` (server
  // javobi) — "Davom ettirish" bosilganda bu eski urinishning ASL rejimi
  // bo'lishi mumkin, `kind`dan farqli.
  const handleStart = async (fresh?: boolean, kind: MockKind = DEFAULT_MOCK_KIND) => {
    setStarting(true);
    setStartError('');
    try {
      const { attemptId: newAttemptId } = await createMockAttempt(testId, fresh, kind);
      const data = await fetchAttempt(newAttemptId);
      const resolvedKind = (data.attempt.mockKind as MockKind) || DEFAULT_MOCK_KIND;
      setAttemptId(newAttemptId);
      setSections(data.attempt.sections as ExamSectionKey[]);
      setCurrentSection(data.attempt.currentSection as ExamSectionKey);
      setFullTest(data.test);
      setMockKind(resolvedKind);
      // §52.2 — "distraction-free fullscreen exam environment" Exam/Secure
      // uchun (Practice'da majburlanmaydi). Ba'zi brauzer/kontekstlarda
      // (masalan iframe, yoki bevosita foydalanuvchi gesti bo'lmasa) rad
      // etilishi mumkin — try/catch bilan JIMGINA o'tkazib yuboriladi,
      // imtihon baribir boshlanadi (§52.2 talabi — bloklamaydi).
      if (resolvedKind !== 'practice' && typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // Rad etildi — jimgina davom etamiz.
        }
      }
      setPhase('section');
    } catch {
      setStartError("Imtihonni boshlab bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setStarting(false);
    }
  };

  // AUDIT Sprint 2/§52.1 — "Practice Mock: erkin navigation". Faqat
  // `mockKind==='practice'`da chaqiriladi (pastdagi UI shart shunga qarab
  // ko'rsatiladi) — `goToMockSection` (attemptServer.ts) baribir server-side
  // qayta tekshiradi, bu himoya faqat UI qulayligi uchun. `currentSection`
  // o'zgarishi kifoya: pastdagi render bo'limlarni ALOHIDA komponent sifatida
  // shart bilan tanlaydi (masalan Reading -> Listening), shuning uchun
  // maqsad komponent YANGIDAN mount bo'ladi va o'z holatini serverdan qayta
  // yuklaydi (yangilangan `endsAt` bilan) — qo'lda qo'shimcha sync shart emas.
  const handleGoToSection = useCallback(
    async (target: ExamSectionKey) => {
      if (!attemptId || target === currentSection || switchingSection) return;
      setSwitchingSection(true);
      try {
        await goToMockSectionApi(attemptId, target);
        setCurrentSection(target);
      } catch {
        // Jimgina e'tiborsiz qoldiriladi — foydalanuvchi joriy bo'limda qoladi.
      } finally {
        setSwitchingSection(false);
      }
    },
    [attemptId, currentSection, switchingSection]
  );

  // AUDIT Sprint 2/§52.6 — halollik logi FAQAT `mode:'mock'`da (bu shell
  // shunday) va FAQAT haqiqiy urinish sessiyasi davomida (section/transition
  // fazalarida) — intro/result'da yo'q (hali urinish boshlanmagan yoki
  // allaqachon tugagan). `useIntegrityEvents` o'zi `level==='practice'`da
  // hech narsa biriktirmaydi.
  useIntegrityEvents({
    attemptId,
    active: !!attemptId && (phase === 'section' || phase === 'transition'),
    level: mockKind,
  });

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
    // §52.1 — Practice mock'da bo'limlar orasida erkin o'tish tugmalari.
    // ExamShell `fixed inset-0` bilan butun ekranni qoplaydi (§5.1'dagi
    // "imtihon ekrani ATAYLAB neytral" qoidasi — ExamShell/ExamHeader'ga
    // tegilmadi), shuning uchun bu bar undan YUQORI z-index bilan alohida
    // overlay sifatida chiziladi.
    const practiceNav = mockKind === 'practice' && (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-1.5 px-2 py-1.5 rounded-full shadow-lg bg-surface border border-border">
        {sections.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleGoToSection(key)}
            disabled={switchingSection || key === currentSection}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default ${
              key === currentSection ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink hover:bg-bg'
            }`}
          >
            {SECTION_LABEL[key]}
          </button>
        ))}
      </div>
    );

    if (currentSection === 'listening') {
      return (
        <>
          {practiceNav}
          <ListeningSection
            attemptId={attemptId}
            candidateName={candidateName}
            candidateId={candidateIdFrom(attemptId)}
            isFinal={isFinal}
            onSectionAdvanced={handleSectionAdvanced}
            onSubmitted={handleSubmitted}
          />
        </>
      );
    }
    if (currentSection === 'reading') {
      return (
        <>
          {practiceNav}
          <ReadingSection
            attemptId={attemptId}
            candidateName={candidateName}
            candidateId={candidateIdFrom(attemptId)}
            isFinal={isFinal}
            onSectionAdvanced={handleSectionAdvanced}
            onSubmitted={handleSubmitted}
          />
        </>
      );
    }
    if (currentSection === 'writing') {
      return (
        <>
          {practiceNav}
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
