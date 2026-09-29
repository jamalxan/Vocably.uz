import { TIER_CONFIG, SUBSCRIPTION_TIERS } from '@/lib/entitlements';

// One place for the facts search engines and AI answer engines read about
// Vocably (JSON-LD on the landing/pricing pages and /llms.txt), so the two
// never drift apart.
export const SITE_URL = 'https://vocably.uz';
export const SITE_NAME = 'Vocably';
export const SITE_TAGLINE = "O'zbek tilida so'zlashuvchilar uchun ingliz tili va IELTS tayyorgarlik platformasi";
export const SITE_SUMMARY_EN =
  'Vocably is an English-learning and IELTS preparation platform for Uzbek speakers: a spaced-repetition (SRS) vocabulary notebook, ' +
  'Reading, Listening, Writing and Speaking practice in real IELTS format, timed full and mini mock exams with band estimates, ' +
  'AI feedback on Writing and Speaking, and an AI tutor that answers in English or Uzbek.';

export const organizationLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
};

export function tierOffers() {
  return SUBSCRIPTION_TIERS.map((t) => ({
    '@type': 'Offer',
    name: TIER_CONFIG[t].label,
    price: String(TIER_CONFIG[t].priceMonthly),
    priceCurrency: 'UZS',
    category: t === 'free' ? 'free' : 'subscription',
    url: `${SITE_URL}/narxlar`,
  }));
}

export const webApplicationLd = () => ({
  '@type': 'WebApplication',
  '@id': `${SITE_URL}/#app`,
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web, Android, iOS',
  inLanguage: ['uz', 'en'],
  description: SITE_SUMMARY_EN,
  publisher: { '@id': `${SITE_URL}/#organization` },
  offers: tierOffers(),
  featureList: [
    'Spaced repetition vocabulary (SRS)',
    'IELTS Reading practice',
    'IELTS Listening practice',
    'IELTS Writing with AI band feedback',
    'IELTS Speaking with AI feedback',
    'Timed full and mini IELTS mock exams',
    'Per-skill band estimates and progress statistics',
  ],
});

/** Wraps nodes in one @graph document. */
export function ldGraph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
