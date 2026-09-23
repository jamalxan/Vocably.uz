'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/gapirish-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function GapirishPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createAttempt(testId, 'speaking', fresh);
      router.push(`/app/gapirish/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <ExamBackLink />
      <TestPicker sectionKey="speaking" title="Speaking — testni tanlang" onPicked={handlePicked} />
    </div>
  );
}
