'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { createAttempt } from '@/features/exam/state/attemptsApi';
import RandomSectionStart from '@/features/exam/shell/RandomSectionStart';
import ExamBackLink from '@/features/exam/shell/ExamBackLink';

// 2026-09-24 (foydalanuvchi so'rovi) — Speaking ham Writing kabi: savollar
// tasodifiy tushadi, oldindan tanlash yo'q (yozish/page.jsx izohiga q.).
export default function GapirishPage() {
  const router = useRouter();
  const { isAuthed } = useApp();

  if (!isAuthed) {
    return <p className="p-8 text-sm text-muted">Avval tizimga kiring.</p>;
  }

  const start = async () => {
    const { attemptId } = await createAttempt(undefined, 'speaking');
    router.push(`/app/gapirish/${attemptId}`);
  };

  return (
    <div>
      <ExamBackLink />
      <RandomSectionStart
        title="Speaking"
        description="Part 1, cue card va Part 3 savollari tasodifiy tanlanadi — xuddi haqiqiy imtihondagidek, mavzuni oldindan ko'rmaysiz."
        buttonLabel="Tasodifiy suhbatni boshlash"
        onStart={start}
      />
    </div>
  );
}
