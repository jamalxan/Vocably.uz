import Link from 'next/link';
import { ArrowRight, RotateCw, Globe, Palette } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import Hero from '@/components/landing/Hero';
import ProductStory from '@/components/landing/ProductStory';
import SRSSection from '@/components/landing/SRSSection';
import SkillsSection from '@/components/landing/SkillsSection';
import AISection from '@/components/landing/AISection';
import ProgressSection from '@/components/landing/ProgressSection';
import MockSection from '@/components/landing/MockSection';
import FinalCTA from '@/components/landing/FinalCTA';
import { landingFontVariables } from '@/components/landing/fonts';

// VOCABLY-TZ.md §3.1 (IA) — '/' ochiq marketing landing (SEO uchun server
// komponent), login formasi /kirish'da (src/app/kirish).
//
// PREMIUM 3D REDESIGN (2026) — brief: mavjud "Deep Merlot" rang tokenlari
// (src/app/globals.css) TO'LIQ saqlanadi, hech qanday yangi palitra
// qo'shilmadi. Yangilangan narsa: typography (Sora/Inter/JetBrains Mono —
// src/components/landing/fonts.js, faqat shu sahifaga scoped), hero'dagi
// React Three Fiber "Vocably Learning Core" 3D obyekti
// (LearningCore3DLoader — dynamic import, ssr:false, WebGL/reduced-motion/
// mobile fallback), va GSAP ScrollTrigger asosidagi cinematic scroll story
// (ProductStory/SRSSection/... — har biri o'z ScrollTrigger'ini ro'yxatdan
// o'tkazadi va gsap.context() bilan tozalaydi).
export const metadata = {
  title: 'Vocably — Ingliz tilini ilmiy asoslangan usulda o\'rganing',
  description:
    "Vocably — o'zbek tilida so'zlashuvchilar uchun ingliz tili platformasi. So'z boyligini ilmiy asoslangan takrorlash (SRS) tizimi bilan quring va Reading, Listening, Writing, Speaking, Vocabulary, AI va Mock testlarni bitta tizimga birlashtiradi.",
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Vocably — Ingliz tilini ilmiy asoslangan usulda o\'rganing',
    description: "So'z boyligini SRS tizimi bilan quring, Reading/Listening/Speaking/Writing'da darhol ishlating.",
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vocably' }],
  },
};

const DIFFERENTIATORS = [
  {
    icon: Globe,
    title: "O'zbek tili birinchi",
    body: "Tarjima, izoh, AI yordamchi, butun interfeys — hammasi o'zbekcha. Boshqa tilni bilish shart emas.",
  },
  {
    icon: RotateCw,
    title: "So'z → ko'nikma zanjiri",
    body: "Bugun o'rgangan so'zingiz 24 soat ichida Reading matnida, Listening dialogida va Speaking savolida qaytadan uchraydi.",
  },
  {
    icon: Palette,
    title: 'Boshqacha dizayn',
    body: "Deep Merlot — issiq, premium palitra. Ko'k-yashil shablonlardan charchagan bo'lsangiz, bu sizga yoqadi.",
  },
];

const FAQS = [
  { q: 'Vocably bepulmi?', a: "Ha, hozircha to'liq bepul. Pullik tariflar joriy etilganda mavjud foydalanuvchilar birinchi bo'lib xabardor qilinadi." },
  { q: "Ro'yxatdan o'tmasdan sinab ko'ra olamanmi?", a: "Ha — /demo sahifasida 10 ta so'zni ro'yxatdan o'tmasdan sinab ko'rishingiz mumkin." },
  { q: 'Telefonda ishlaydimi?', a: "Ha, Vocably to'liq mobil-moslashuvchan va PWA sifatida telefon ekraniga o'rnatilishi mumkin." },
  { q: "So'z boyligim qanday oshadi?", a: "Ilmiy asoslangan takrorlash (SRS) tizimi har so'zni unutish arafasida qayta ko'rsatadi — natijada kamroq vaqt bilan ko'proq eslab qolasiz." },
];

export default function LandingPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Vocably — Ingliz tili',
      description: "So'z boyligini SRS tizimi bilan quring, Reading/Listening/Speaking/Writing'da ishlating.",
      provider: { '@type': 'Organization', name: 'Vocably', sameAs: 'https://vocably.uz' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalProgram',
      name: 'Vocably ingliz tili dasturi',
      description: "O'zbek tilida so'zlashuvchilar uchun ingliz tili o'rganish dasturi.",
      provider: { '@type': 'Organization', name: 'Vocably' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <div className={`${landingFontVariables} relative min-h-dvh bg-bg overflow-x-hidden font-landing-body`}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Fon: gradient mesh — mavjud brend ranglaridan, CSS-only */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-32 w-[26rem] h-[26rem] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <LandingHeader floating />

      <main>
        <Hero />

        {/* ============ FARQLANISH ============ */}
        <section className="relative px-4 sm:px-6 py-16 sm:py-20 bg-surface border-y border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-landing-display text-2xl sm:text-3xl font-semibold text-ink text-center mb-3">
              Nega Vocably boshqacha
            </h2>
            <p className="text-sm text-muted text-center max-w-lg mx-auto mb-12">
              Ko'p ilova so'z yodlashni "o'yin" qiladi. Biz uni <strong className="text-ink">tizim</strong> qildik.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {DIFFERENTIATORS.map((d) => (
                <div key={d.title} className="bg-bg border border-border rounded-2xl p-6 shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-4">
                    <d.icon size={20} />
                  </div>
                  <h3 className="font-landing-display text-base font-semibold text-ink mb-1.5">{d.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductStory />
        <SRSSection />
        <SkillsSection />
        <AISection />
        <ProgressSection />
        <MockSection />

        {/* ============ FAQ ============ */}
        <section className="relative px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-landing-display text-2xl sm:text-3xl font-semibold text-ink text-center mb-10">
              Ko'p beriladigan savollar
            </h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group bg-surface border border-border rounded-2xl p-5">
                  <summary className="text-sm font-landing-body font-semibold text-ink cursor-pointer list-none flex items-center justify-between gap-3">
                    {f.q}
                    <ArrowRight size={14} className="text-muted group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <p className="text-sm text-muted mt-3 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
