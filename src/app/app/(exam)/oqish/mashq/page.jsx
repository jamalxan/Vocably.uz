'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createPracticeAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';

// VOCABLY_TZ_FINAL...2026-09-20.md "Practice mode" (Reading) — TestPicker
// ASOSIY /oqish bilan bir xil (oqish/page.jsx), faqat `createAttempt`
// o'rniga `createPracticeAttempt` chaqiriladi (mode:'practice').
export default function OqishMashqPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
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

  return <TestPicker sectionKey="reading" title="Reading — mashq: testni tanlang" onPicked={handlePicked} />;
}
