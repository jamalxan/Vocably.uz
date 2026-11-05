import FunnelBeacon from '@/components/analytics/FunnelBeacon';
import LandingHeader from '@/components/landing/LandingHeader';
import PricingIntro from '@/components/pricing/PricingIntro';
import { serializeJsonLd } from '@/lib/jsonLd';
import LandingFooter from '@/components/landing/LandingFooter';
import PricingTable from '@/components/pricing/PricingTable';
import { ldGraph, organizationLd, webApplicationLd } from '@/lib/seo/site';

export const metadata = {
  title: 'Narxlar — Vocably',
  description: "Vocably tariflari: Bepul, Standard va Premium — narxlar va imkoniyatlar taqqoslash.",
  alternates: { canonical: '/pricing' },
};

// BILL-01/02 (VOCABLY_TZ_FINAL...2026-09-20.md §46) — bu ilgari "Tariflar tez
// orada" placeholder edi (§46.1/46.2 mavjud bo'lmagan davrda yozilgan izoh).
// Endi haqiqiy tarif/narx ma'lumoti TZ'ning o'zidan olinadi va bitta joyda
// (src/lib/entitlements.js) saqlanadi — bu sahifa faqat shuni render qiladi.
// Interaktiv qism (oylik/yillik almashtirish, joriy tarifni aniqlash, "Bog'lanish"
// CTA) client komponentga ajratilgan (PricingTable), metadata esa server
// komponentda qoladi.
export default function NarxlarPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(ldGraph([organizationLd, webApplicationLd()])) }} />
      <LandingHeader />
      <FunnelBeacon stage="landing" />
      <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <PricingIntro />
        </div>
        <PricingTable />
      </main>
      <LandingFooter />
    </div>
  );
}
