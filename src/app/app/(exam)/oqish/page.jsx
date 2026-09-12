'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/oqish-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function OqishPage() {
  const router = useRouter();
  const { token } = useApp();

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId) => {
    try {
      const { attemptId } = await createAttempt(testId, 'reading');
      router.push(`/app/oqish/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return <TestPicker sectionKey="reading" title="Reading — testni tanlang" onPicked={handlePicked} />;
}
