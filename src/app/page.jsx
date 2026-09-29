import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import Hero from '@/components/landing/Hero';
import Marquee from '@/components/landing/Marquee';
import Manifesto from '@/components/landing/Manifesto';
import ProductStory from '@/components/landing/ProductStory';
import SRSSection from '@/components/landing/SRSSection';
import SkillsSection from '@/components/landing/SkillsSection';
import AISection from '@/components/landing/AISection';
import ProgressSection from '@/components/landing/ProgressSection';
import MockSection from '@/components/landing/MockSection';
import FaqSection from '@/components/landing/FaqSection';
import FinalCTA from '@/components/landing/FinalCTA';
import ExperienceLoader from '@/components/landing/experience/ExperienceLoader';
import SmoothScroll from '@/components/landing/experience/SmoothScroll';
import { FAQS } from '@/components/landing/faqData';
import { landingFontVariables } from '@/components/landing/fonts';
import { ldGraph, organizationLd, webApplicationLd, tierOffers, SITE_URL, SITE_NAME, SITE_TAGLINE } from '@/lib/seo/site';

// VOCABLY-TZ.md §3.1 (IA) — '/' ochiq marketing landing (SEO uchun server
// komponent), login formasi /kirish'da (src/app/kirish).
//
// PREMIUM 3D / MAXIMALISM REDESIGN — butun sahifa orqasida bitta fixed WebGL
// canvas (src/components/landing/experience): "Deep Merlot" tokenlaridan
// olingan oqib turuvchi shader-fon (video kabi, scroll bilan harakatlanadi,
// to'q boblarda merlot tusiga o'tadi) va har bobga "uchib boradigan"
// Vocably Learning Core. Hech qanday yangi rang yo'q — faqat globals.css
// tokenlari va ularning kombinatsiyalari. Barcha muhim matn HTML'da
// (canvas faqat bezak), H1/H2 ierarxiyasi, metadata va JSON-LD saqlangan.
export const metadata = {
  title: "Vocably — IELTS va ingliz tili: SRS lug'at, mock imtihon, AI tutor",
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

export default function LandingPage() {
  const jsonLd = ldGraph([
    organizationLd,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_TAGLINE,
      inLanguage: 'uz',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    webApplicationLd(),
    {
      '@type': 'Course',
      name: 'Vocably — IELTS va ingliz tili',
      description: "So'z boyligini SRS tizimi bilan quring, Reading/Listening/Speaking/Writing'da ishlating va haqiqiy IELTS formatidagi mock imtihon topshiring.",
      inLanguage: 'en',
      educationalLevel: 'A2–C1',
      teaches: ['IELTS Reading', 'IELTS Listening', 'IELTS Writing', 'IELTS Speaking', 'English vocabulary'],
      provider: { '@id': `${SITE_URL}/#organization` },
      offers: tierOffers(),
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT30M' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]);

  return (
    // overflow-x-clip (not hidden): hidden would turn this div into a scroll
    // container and silently break the sticky header and GSAP pins.
    <div className={`${landingFontVariables} relative isolate min-h-dvh overflow-x-clip bg-bg font-landing-body`}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ExperienceLoader />
      <SmoothScroll />

      <LandingHeader floating />

      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <ProductStory />
        <SRSSection />
        <SkillsSection />
        <AISection />
        <ProgressSection />
        <MockSection />
        <FaqSection />
        <FinalCTA />
      </main>

      <div className="relative z-10 bg-bg">
        <LandingFooter />
      </div>
    </div>
  );
}
