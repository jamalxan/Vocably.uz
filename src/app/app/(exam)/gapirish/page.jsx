'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/gapirish-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function GapirishPage() {
  const router = useRouter();
  const { token } = useApp();

  if (!token) {
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

  return <TestPicker sectionKey="speaking" title="Speaking — testni tanlang" onPicked={handlePicked} />;
}
