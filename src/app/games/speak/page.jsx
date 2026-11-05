import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import SpeakOrFall from '@/components/flagship/SpeakOrFall';

export const metadata = {
  title: "Gapir yoki yiqil — IELTS Speaking fluency o'yini | Vocably",
  description:
    "IELTS Part 2 mavzusida 60 soniya to'xtamasdan gapiring: jim qolsangiz, qahramon jarga yaqinlashadi. Pauza xaritasi va filler so'zlar soni — bepul, ro'yxatsiz.",
  alternates: { canonical: '/games/speak' },
  openGraph: { title: 'Gapir yoki yiqil', description: '60 soniya IELTS Speaking — pauza qilsangiz, yiqilasiz.' },
};

export default function SpeakPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <SpeakOrFall />
      </main>
    </div>
  );
}
