import type { MetadataRoute } from 'next';
import { SEO_WORDS } from '@/lib/seoWords';
import { BLOG_POSTS } from '@/lib/blogPosts';

// VOCABLY-TZ.md §17.3 (SEO). /kirish va /royxat qasddan KIRITILMAGAN — ular
// `robots: { index: false }` (src/app/kirish, src/app/royxat) bilan belgilangan,
// noindex sahifalarni sitemap'ga qo'shish qidiruv botlarini chalg'itadi
// (umumiy amaliyotga zid).
const BASE_URL = 'https://vocably.uz';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/demo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/narxlar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/lugat`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const wordPages: MetadataRoute.Sitemap = SEO_WORDS.map((w) => ({
    url: `${BASE_URL}/lugat/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages, ...wordPages];
}
