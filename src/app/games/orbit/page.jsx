import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import WordOrbit from '@/components/flagship/WordOrbit';
import { pageOpenGraph } from '@/lib/seo/site';

export const metadata = {
  title: "So'z orbitasi — IELTS so'zlarini gap ichida o'rgatadigan 3D o'yin | Vocably",
  description:
    "Gapda bitta so'z yetishmaydi: mos so'z turgan sayyoraga uching. So'zlarni kontekstda o'rgatadigan bepul 3D IELTS lug'at o'yini — ro'yxatdan o'tmasdan o'ynang.",
  alternates: { canonical: '/games/orbit' },
  openGraph: pageOpenGraph({ path: '/games/orbit', title: "So'z orbitasi", description: "Gapni to'ldiring: mos so'z turgan sayyoraga uching — bepul, ro'yxatsiz." }),
};

export default function OrbitPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 py-6 sm:py-10">
        <WordOrbit />
      </main>
    </div>
  );
}
