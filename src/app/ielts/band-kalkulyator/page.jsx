import { SITE_URL, organizationLd, breadcrumbLd, faqLd, ldGraph } from '@/lib/seo/site';
import SeoPageShell from '@/components/seo/SeoPageShell';
import BandCalculator from '@/components/seo/BandCalculator';
import Prose from '@/components/seo/Prose';

const TITLE = 'IELTS band kalkulyatori — Listening, Reading va umumiy ball hisoblash';
const DESCRIPTION =
  "IELTS band score kalkulyatori: to‘g‘ri javoblar sonini kiriting — Listening va Reading bandi hamda umumiy (overall) band darhol hisoblanadi. Academic va General Training.";

const FAQ = [
  ['IELTS Listening’da 30 ta to‘g‘ri javob qancha band?', 'Odatda 30/40 — band 7.0.'],
  ['IELTS Reading Academic’da 35 ta to‘g‘ri javob qancha band?', 'Odatda 35/40 — band 8.0.'],
  ['Umumiy band qanday yaxlitlanadi?', 'To‘rt bo‘lim o‘rtachasi: .25 bo‘lsa .5 ga, .75 bo‘lsa keyingi butun songa ko‘tariladi; qolgan holatda pastga yaxlitlanadi.'],
  ['General Training Reading nega boshqacha hisoblanadi?', 'GT matnlari osonroq, shuning uchun bir xil bandga ko‘proq to‘g‘ri javob kerak (masalan band 7 uchun ~34/40).'],
];

const EXPLAIN = `## Band qanday hisoblanadi?

Listening va Reading'da har bir to'g'ri javob 1 ball, jami 40 ball. Bu **xom ball** rasmiy jadval bo'yicha 0–9 bandga o'giriladi. Jadval har bir test uchun biroz farq qilishi mumkin, shuning uchun natija taxminiy.

Writing va Speaking esa imtihonchi tomonidan 4 ta mezon bo'yicha baholanadi.

**Umumiy band** — to'rt bo'lim o'rtachasi, eng yaqin 0.5 ga yaxlitlanadi. Masalan: Listening 7.0, Reading 6.5, Writing 6.0, Speaking 6.5 → o'rtacha 6.5 → **overall 6.5**.

Haqiqiy bandingizni bilish uchun Vocably'da to'liq mock test topshiring — javoblar avtomatik tekshiriladi, Writing va Speaking esa AI tomonidan baholanadi.`;

export const metadata = {
  title: `${TITLE} | Vocably`,
  description: DESCRIPTION,
  alternates: { canonical: '/ielts/band-kalkulyator' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/ielts/band-kalkulyator' },
};

export default function BandCalculatorPage() {
  const crumbs = [
    ['Bosh sahifa', '/'],
    ['IELTS', '/ielts'],
    ['Band kalkulyatori', '/ielts/band-kalkulyator'],
  ];
  const jsonLd = ldGraph([
    organizationLd,
    {
      '@type': 'WebApplication',
      name: 'IELTS band kalkulyatori',
      url: `${SITE_URL}/ielts/band-kalkulyator`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'uz',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' },
      description: DESCRIPTION,
    },
    breadcrumbLd(crumbs),
    faqLd(FAQ),
  ]);
  return (
    <SeoPageShell crumbs={crumbs} jsonLd={jsonLd}>
      <h1 className="font-luxury text-3xl sm:text-4xl font-bold text-ink leading-tight">IELTS band kalkulyatori</h1>
      <p className="text-base text-muted mt-3 mb-6 leading-7">{DESCRIPTION}</p>
      <BandCalculator />
      <div className="mt-8">
        <Prose>{EXPLAIN}</Prose>
      </div>
      <section aria-labelledby="faq" className="mt-8">
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
