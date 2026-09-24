'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import RandomSectionStart from '@/features/exam/shell/RandomSectionStart';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// 2026-09-24 (foydalanuvchi so'rovi) — Writing endi test TANLASH ekrani
// emas: topshiriq tasodifiy tushadi (Reading/Listening'da tanlash qoladi,
// chunki ular ustida maqsadli mashq qilish mantiqiy; Writing/Speaking'da esa
// oldindan mavzuni ko'rib qo'yish imtihon shartini buzardi).
export default function YozishPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const start = async () => {
    const { attemptId } = await createAttempt(undefined, 'writing');
    router.push(`/app/yozish/${attemptId}`);
  };

  return (
    <div>
      <ExamBackLink />
      <RandomSectionStart
        title="Writing"
        description="Topshiriq tasodifiy tanlanadi — Task 1 va Task 2, 60 daqiqa. Har safar yangi variant tushadi."
        buttonLabel="Tasodifiy topshiriqni boshlash"
        onStart={start}
        footer={
          <Link href="/app/yozish/mashq" className="text-sm text-accent hover:underline font-semibold">
            Mashq rejimida sinab ko'ring — vaqt cheklanmagan, qoralama bilan →
          </Link>
        }
      />
    </div>
  );
}
