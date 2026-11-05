import LandingHeader from '@/components/landing/LandingHeader';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import FunnelBeacon from '@/components/analytics/FunnelBeacon';

export const metadata = {
  title: "Shaxsiy IELTS reja — 2 daqiqada | Vocably",
  description:
    "7 ta savol va 5 daqiqalik so'z testi: imtihon sanangiz, maqsad bandingiz va kunlik vaqtingizga mos shaxsiy IELTS reja. Narxlar ochiq, ro'yxatdan o'tish bepul.",
  alternates: { canonical: '/start' },
};

export default function StartPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* /start is an entry page too — count it as a landing so onboarding never exceeds landing. */}
        <FunnelBeacon stage="landing" />
        <FunnelBeacon stage="onboarding_start" />
        <OnboardingWizard />
      </main>
    </div>
  );
}
