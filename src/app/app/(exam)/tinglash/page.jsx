'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import TestPicker from '@/features/exam/shell/TestPicker';

// TZ-vocably-v2.md §20 migratsiyasi YAKUNLANDI — bu endi yangi exam engine
// (avval `/app/tinglash-beta`da qurilgan, endi asosiy yo'lga ko'chirildi).
export default function TinglashPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const handlePicked = async (testId, fresh) => {
    try {
      const { attemptId } = await createAttempt(testId, 'listening', fresh);
      router.push(`/app/tinglash/${attemptId}`);
    } catch {
      // TestPicker ro'yxati saqlanadi, foydalanuvchi qayta bosishi mumkin.
    }
  };

  return (
    <div>
      <TestPicker sectionKey="listening" title="Listening — testni tanlang" onPicked={handlePicked} />
      <div className="max-w-lg mx-auto px-6 sm:px-10 pb-6 -mt-4">
        <Link href="/app/tinglash/mashq" className="text-sm text-accent hover:underline font-semibold">
          Mashq rejimida sinab ko'ring — qayta tinglash va tezlikni o'zgartirish erkin →
        </Link>
      </div>
    </div>
  );
}
