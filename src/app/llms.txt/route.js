import { BLOG_POSTS } from '@/lib/blogPosts';
import { SEO_WORDS } from '@/lib/seoWords';
import { TIER_CONFIG, SUBSCRIPTION_TIERS } from '@/lib/entitlements';
import { SITE_URL, SITE_SUMMARY_EN } from '@/lib/seo/site';
import { IELTS_GUIDES } from '@/lib/seo/ieltsGuides';

// https://llmstxt.org — a short, plain-markdown map of the site for AI
// assistants and answer engines. Generated from the same data the pages
// render, so it never goes stale.
export const dynamic = 'force-static';

function price(n) {
  return n === 0 ? 'free' : `${n.toLocaleString('en-US')} UZS / month`;
}

export function GET() {
  const tiers = SUBSCRIPTION_TIERS.map((t) => `- ${TIER_CONFIG[t].label}: ${price(TIER_CONFIG[t].priceMonthly)}`).join('\n');
  const posts = BLOG_POSTS.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`).join('\n');
  const guides = IELTS_GUIDES.map((g) => `- [${g.title}](${SITE_URL}/ielts/${g.slug}): ${g.description}`).join('\n');
  const words = SEO_WORDS.map((w) => `- [${w.word}](${SITE_URL}/lugat/${w.slug}): ${w.translations.join(', ')}`).join('\n');

  const body = `# Vocably

> ${SITE_SUMMARY_EN}

Interface language: Uzbek (Latin). Learning content (Reading passages, Listening audio, tasks) is in English.
Audience: Uzbek speakers preparing for IELTS (Academic) or improving general English, roughly A2–C1.

## Product

- [Home](${SITE_URL}/): overview of the platform
- [Free demo](${SITE_URL}/demo): try the flashcard (SRS) mode without signing up
- [Pricing](${SITE_URL}/narxlar): plans and what each includes
- [Blog](${SITE_URL}/blog): articles on learning vocabulary and IELTS preparation
- [Dictionary](${SITE_URL}/lugat): English words with Uzbek translations, IPA and examples
- [IELTS guide](${SITE_URL}/ielts): IELTS format and strategy in Uzbek
- [IELTS band calculator](${SITE_URL}/ielts/band-kalkulyator): raw score → band for Listening/Reading, overall band
- [Full text for LLMs](${SITE_URL}/llms-full.txt): all guides and articles in one file

## Key facts

- Vocabulary: personal word lists reviewed with spaced repetition (SRS); flashcards, quizzes and typing drills.
- IELTS practice: Reading, Listening, Writing and Speaking sections in the real exam format and timing.
- Mock exams: timed full mocks, and a shorter Mini mock when full-length content is not available; results give per-skill and overall band estimates.
- AI: Writing is scored against the four IELTS criteria (TA/CC/LR/GRA); Speaking gets feedback; an AI tutor answers in English by default and in Uzbek when asked.
- Subscriptions run for one calendar month; after expiry, access stays open for 3 grace days with a daily reminder, then falls back to the free plan.

## Plans

${tiers}

## IELTS guides (Uzbek)

${guides}

## Blog

${posts}

## Dictionary pages

${words}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
