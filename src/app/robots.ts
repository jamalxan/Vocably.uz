import type { MetadataRoute } from 'next';

// VOCABLY-TZ.md §17.3. /app va /admin — himoyalangan zonalar, qidiruv
// botlariga foydasi yo'q (login talab qiladi) va indekslanmasligi kerak;
// /api — hech qachon HTML/kontent qaytarmaydi, indekslash uchun ma'nosiz.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/admin', '/api', '/kirish', '/royxat'],
    },
    sitemap: 'https://vocably.uz/sitemap.xml',
  };
}
