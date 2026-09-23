'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/yozish-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function YozishPage() {
  const router = useRouter();
  const { token } = useApp();

  if (!token) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createAttempt(testId, 'writing', fresh);
      router.push(`/app/yozish/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <ExamBackLink />
      <TestPicker sectionKey="writing" title="Writing — testni tanlang" onPicked={handlePicked} />
      <div className="max-w-lg mx-auto px-6 sm:px-10 pb-6 -mt-4">
        <Link href="/app/yozish/mashq" className="text-sm text-accent hover:underline font-semibold">
          Mashq rejimida sinab ko'ring — vaqt cheklanmagan, qoralama bilan →
        </Link>
      </div>
    </div>
  );
}
