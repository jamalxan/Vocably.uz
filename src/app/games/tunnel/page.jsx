import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import WordTunnel from '@/components/flagship/WordTunnel';
import { pageOpenGraph } from '@/lib/seo/site';

export const metadata = {
  title: "So'z tunneli — IELTS so'zlarini yozib o'rganadigan 3D o'yin | Vocably",
  description:
    "O'zbekcha ma'no chiqadi — inglizcha so'zni yozing, har bir harf tunnelga aylanadi. 90 soniyalik bepul IELTS spelling o'yini — ro'yxatdan o'tmasdan o'ynang.",
  alternates: { canonical: '/games/tunnel' },
  openGraph: pageOpenGraph({ path: '/games/tunnel', title: "So'z tunneli", description: "IELTS so'zlarini yozib, 3D tunnel bo'ylab uching — bepul, ro'yxatsiz." }),
};

export default function TunnelPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <WordTunnel />
      </main>
    </div>
  );
}
