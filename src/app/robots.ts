import type { MetadataRoute } from 'next';

// VOCABLY-TZ.md §17.3. /app, /admin, /dashboard, /teacher — himoyalangan
// zonalar (login talab qiladi), indekslanmasligi kerak; /api — hech qachon
// HTML/kontent qaytarmaydi.
//
// AI qidiruv/javob botlari (ChatGPT, Claude, Perplexity, Gemini) ochiq
// sahifalarga ATAYLAB ruxsat etilgan: "ingliz tili qayerda o'rganaman"
// degan savolga AI javobida Vocably chiqishi uchun ular sahifani o'qiy
// olishi kerak. Qisqa tavsif ular uchun /llms.txt'da.
const PRIVATE = ['/app', '/admin', '/dashboard', '/teacher', '/api', '/kirish', '/royxat'];
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: PRIVATE },
    ],
    sitemap: 'https://vocably.uz/sitemap.xml',
    host: 'https://vocably.uz',
  };
}
