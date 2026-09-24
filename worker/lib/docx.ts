// §50.2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — DOCX manba fayllar uchun
// matn ajratish (`mammoth` orqali, xom matn — `extractPdfText` bilan BIR XIL
// shaklda, chunki `extract.ts`dan pastdagi hamma bosqich faqat `{n, text}`
// juftligini kutadi).
//
// 2026-09-24 — implementatsiyaning o'zi `src/lib/contentAgent/documentText.ts`ga
// ko'chirildi (admin AI chat uni worker'siz ishlatadi, worker/lib/pdf.ts
// izohiga q.); bu yerda faqat qayta eksport — `stages/extract.ts` va
// mavjud testlar o'zgarishsiz ishlayveradi.
export { extractDocxText } from '@/lib/contentAgent/documentText';
