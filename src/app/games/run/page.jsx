import LandingHeader from '@/components/landing/LandingHeader';
import VocablyRun from '@/components/flagship/VocablyRun';

export const metadata = {
  title: "Vocably Run — IELTS so'zlari bilan 3D yugurish o'yini | Vocably",
  description:
    "Tepada ma'no, yo'laklarda 3 ta so'z: to'g'ri yo'lakka o'ting. 90 soniyalik bepul IELTS lug'at o'yini — ro'yxatdan o'tmasdan o'ynang.",
  alternates: { canonical: '/games/run' },
  openGraph: { title: 'Vocably Run', description: "IELTS so'zlari bilan 3 yo'lakli yugurish — bepul, ro'yxatsiz." },
};

export default function RunPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <VocablyRun />
      </main>
    </div>
  );
}
