import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import WordDefense from '@/components/flagship/WordDefense';
import { pageOpenGraph } from '@/lib/seo/site';

export const metadata = {
  title: "Word Defense — IELTS so'zlari bilan bazani himoya qilish o'yini | Vocably",
  description:
    "Dushmanlar o'zbekcha ma'no olib kelyapti: inglizcha so'zni yozing va otib tashlang. Xato qilsangiz — to'g'ri so'zni yozib tuzating. Bepul IELTS spelling o'yini, ro'yxatsiz.",
  alternates: { canonical: '/games/defense' },
  openGraph: pageOpenGraph({ path: '/games/defense', title: 'Word Defense', description: "IELTS so'zlarini yozib bazangizni himoya qiling — bepul, ro'yxatsiz." }),
};

export default function DefensePage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <WordDefense />
      </main>
    </div>
  );
}
