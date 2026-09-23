'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createPracticeAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// VOCABLY_TZ_FINAL...2026-09-20.md "Practice mode" (Reading) — TestPicker
// ASOSIY /oqish bilan bir xil (oqish/page.jsx), faqat `createAttempt`
// o'rniga `createPracticeAttempt` chaqiriladi (mode:'practice').
export default function OqishMashqPage() {
  const router = useRouter();
  const { token } = useApp();

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createPracticeAttempt(testId, 'reading', fresh);
      router.push(`/app/oqish/mashq/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <ExamBackLink />
      <TestPicker sectionKey="reading" title="Reading — mashq: testni tanlang" onPicked={handlePicked} />
    </div>
  );
}
