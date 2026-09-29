import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { IELTS_GUIDES } from '@/lib/seo/ieltsGuides';
import { SITE_URL, organizationLd, breadcrumbLd, faqLd, ldGraph } from '@/lib/seo/site';
import SeoPageShell from '@/components/seo/SeoPageShell';

const TITLE = "IELTS'ga tayyorgarlik: to'liq qo'llanma o'zbek tilida";
const DESCRIPTION =
  "IELTS Reading, Listening, Writing va Speaking — format, savol turlari, band hisoblash va onlayn mock test. O‘zbek tilida tushunarli qo‘llanma.";

const FAQ = [
  ['IELTS necha bo‘limdan iborat?', 'To‘rtta: Listening, Reading, Writing va Speaking. Listening, Reading va Writing bir kunda, Speaking alohida topshiriladi.'],
  ['IELTS umumiy bali qanday hisoblanadi?', 'To‘rt bo‘lim bandining o‘rtachasi eng yaqin 0.5 ga yaxlitlanadi.'],
  ['IELTS’ga qancha vaqt tayyorlanish kerak?', 'Bir band ko‘tarilish uchun odatda 2–3 oy muntazam tayyorgarlik kerak bo‘ladi; bu boshlang‘ich darajangizga bog‘liq.'],
  ['Onlayn IELTS mock testni qayerda topshirish mumkin?', 'Vocably’da haqiqiy kompyuter IELTS interfeysida to‘liq yoki mini mock topshirib, band ballingizni bilishingiz mumkin.'],
];

export const metadata = {
  title: `${TITLE} | Vocably`,
  description: DESCRIPTION,
  alternates: { canonical: '/ielts' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/ielts' },
};

export default function IeltsHubPage() {
  const crumbs = [
    ['Bosh sahifa', '/'],
    ['IELTS', '/ielts'],
  ];
  const jsonLd = ldGraph([
    organizationLd,
    {
      '@type': 'CollectionPage',
      name: TITLE,
      description: DESCRIPTION,
      url: `${SITE_URL}/ielts`,
      inLanguage: 'uz',
      hasPart: IELTS_GUIDES.map((g) => ({ '@type': 'Article', headline: g.title, url: `${SITE_URL}/ielts/${g.slug}` })),
    },
    breadcrumbLd(crumbs),
    faqLd(FAQ),
  ]);

  return (
    <SeoPageShell crumbs={crumbs} jsonLd={jsonLd}>
      <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-ink leading-tight">{TITLE}</h1>
      <p className="text-base text-muted mt-3 leading-7">{DESCRIPTION}</p>

      <Link
        href="/ielts/band-kalkulyator"
        className="mt-6 flex items-center gap-4 p-5 rounded-2xl bg-primary text-on-primary hover:opacity-95 transition-opacity"
      >
        <span className="w-11 h-11 rounded-xl bg-accent grid place-items-center flex-shrink-0">
          <Calculator size={20} className="text-on-accent" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-bold">IELTS band kalkulyatori</span>
          <span className="block text-sm text-on-primary/70">To‘g‘ri javoblar soni → band, umumiy ball hisoblash</span>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {IELTS_GUIDES.map((g) => (
          <Link key={g.slug} href={`/ielts/${g.slug}`} className="p-5 rounded-2xl bg-surface border border-border shadow-card hover:border-accent/50 transition-colors">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-accent">{g.short}</span>
            <span className="block font-display font-bold text-ink mt-1.5 leading-snug">{g.title}</span>
            <span className="block text-sm text-muted mt-2 line-clamp-3">{g.description}</span>
          </Link>
        ))}
      </div>

      <section aria-labelledby="faq" className="mt-10">
        <h2 id="faq" className="font-display text-2xl font-bold text-ink mb-4">
          Ko'p so'raladigan savollar
        </h2>
        <div className="space-y-2.5">
          {FAQ.map(([q, a]) => (
            <details key={q} className="rounded-2xl bg-surface border border-border px-5 py-4">
              <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
              <p className="text-sm text-muted mt-2 leading-6">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </SeoPageShell>
  );
}
