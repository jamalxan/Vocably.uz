import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import WordIsland from '@/components/flagship/WordIsland';
import { pageOpenGraph } from '@/lib/seo/site';

export const metadata = {
  title: "So'z oroli — IELTS so'zlari bilan 3D sarguzasht o'yini | Vocably",
  description:
    "3D orolda yuring, mayoqlarni toping va so'zini topib ularni yoqing. Bepul IELTS lug'at o'yini — ro'yxatdan o'tmasdan o'ynang.",
  alternates: { canonical: '/games/island' },
  openGraph: pageOpenGraph({ path: '/games/island', title: "So'z oroli", description: "Orolda yuring va so'zini topib mayoqlarni yoqing — bepul, ro'yxatsiz." }),
};

export default function IslandPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <WordIsland />
      </main>
    </div>
  );
}
