import type { MetadataRoute } from 'next';
import { SEO_WORDS } from '@/lib/seoWords';
import { BLOG_POSTS } from '@/lib/blogPosts';
import { IELTS_GUIDES } from '@/lib/seo/ieltsGuides';

// VOCABLY-TZ.md §17.3 (SEO). /kirish va /royxat qasddan KIRITILMAGAN — ular
// `robots: { index: false }` (src/app/kirish, src/app/royxat) bilan belgilangan,
// noindex sahifalarni sitemap'ga qo'shish qidiruv botlarini chalg'itadi.
//
// lastModified — sahifa mazmuni oxirgi marta o'zgargan sana (qat'iy). Avval
// har so'rovda `new Date()` edi: Google o'zgarmagan sahifaning "yangi" sanasini
// ko'rib, lastmod'ga ishonishni to'xtatadi. Kontent o'zgarganda shu yerda yangilang.
const BASE_URL = 'https://vocably.uz';
const CONTENT_UPDATED = new Date('2026-09-29');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: CONTENT_UPDATED, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/ielts`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/ielts/band-kalkulyator`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/demo`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/narxlar`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(BLOG_POSTS[0]?.date || CONTENT_UPDATED), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/lugat`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const guidePages: MetadataRoute.Sitemap = IELTS_GUIDES.map((g) => ({
    url: `${BASE_URL}/ielts/${g.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const wordPages: MetadataRoute.Sitemap = SEO_WORDS.map((w) => ({
    url: `${BASE_URL}/lugat/${w.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticPages, ...guidePages, ...blogPages, ...wordPages];
}
