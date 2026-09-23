'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createPracticeAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// VOCABLY_TZ_FINAL...2026-09-20.md "Writing" — "note area practice'da".
// TestPicker ASOSIY /yozish bilan bir xil (yozish/page.jsx), faqat
// `createAttempt` o'rniga `createPracticeAttempt` chaqiriladi (mode:'practice').
export default function YozishMashqPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createPracticeAttempt(testId, 'writing', fresh);
      router.push(`/app/yozish/mashq/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <ExamBackLink />
      <TestPicker sectionKey="writing" title="Writing — mashq: testni tanlang" onPicked={handlePicked} />
    </div>
  );
}
