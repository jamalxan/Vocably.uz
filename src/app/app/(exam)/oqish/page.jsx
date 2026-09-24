'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/oqish-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function OqishPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createAttempt(testId, 'reading', fresh);
      router.push(`/app/oqish/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <ExamBackLink />
      <TestPicker sectionKey="reading" title="Reading — testni tanlang" onPicked={handlePicked} />
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-6 -mt-4">
        <Link href="/app/oqish/mashq" className="text-sm text-accent hover:underline font-semibold">
          Mashq rejimida sinab ko'ring — vaqt cheklanmagan, izohlar bilan →
        </Link>
      </div>
    </div>
  );
}
