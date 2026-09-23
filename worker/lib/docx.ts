// §50.2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — DOCX manba fayllar uchun
// matn ajratish. `mammoth` — .docx -> xom matn, yetuk/keng ishlatiladigan
// npm kutubxonasi (yangi API kalit/kredensial shart emas). `extractRawText`
// tanlandi (`convertToHtml` emas): `worker/lib/pdf.ts#extractPdfText` ham
// XOM MATN qaytaradi (PDF'ning o'zida ham HTML yo'q) — keyingi bosqichlar
// (`segment.ts`, `parseReading.ts` va h.k.) allaqachon xom matn kutadi,
// shuning uchun DOCX yo'li ularga BIR XIL shaklda uzatilishi kerak.
//
// PDF'dan farqli, .docx faylda HAQIQIY "sahifa" tushunchasi yo'q (matn
// oqimi, sahifalanish faqat renderlashda — Word/printer darajasida hosil
// bo'ladi, fayl formatining o'zida saqlanmaydi). Shuning uchun bu yerda
// XOM matn belgilar soni bo'yicha PSEVDO-SAHIFALARGA bo'linadi — bu
// `extract.ts`dan pastdagi HAMMA bosqich (segment/split_sections/parse_*)
// faqat `{n, text}` juftligini kutadi, "sahifa" chinakam qog'oz varag'iga
// mos kelishini talab qilmaydi (`segment.ts`dagi AI xaritasi ham shunchaki
// "PAGE N" belgilariga qarab ishlaydi).
import mammoth from 'mammoth';
import type { ExtractedPage, ExtractedPdf } from './pdf';

// ~500-700 so'zli bosma sahifaga yaqin (IELTS kitoblari uchun taxminiy) —
// `segment.ts` promptida har "sahifa" alohida ko'rsatiladigan bo'lgani
// uchun bu juda katta bo'lmasligi kerak (AI xarita chiqarishda foydali
// granularity), lekin juda kichik ham emas (ortiqcha "sahifa" soni AI
// promptini keraksiz shishiradi).
const PSEUDO_PAGE_CHARS = 3000;
const MIN_MEANINGFUL_CHARS_PER_PAGE = 20; // worker/lib/pdf.ts bilan bir xil chegara

/** Xom matnni paragraf chegaralarida (bo'sh qator) ~`PSEUDO_PAGE_CHARS`
 * belgigacha "sahifa"larga guruhlaydi. Bitta paragrafning o'zi chegaradan
 * katta bo'lsa — bo'linmaydi (bitta "sahifa"ga yaxlit tushadi), chunki
 * paragraf o'rtasidan kesish keyingi AI bosqichlarga ma'nosiz chegara
 * berardi. */
function paginate(fullText: string): ExtractedPage[] {
  const paragraphs = fullText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return [];

  const pages: ExtractedPage[] = [];
  let current: string[] = [];
  let currentLen = 0;
  for (const para of paragraphs) {
    if (currentLen > 0 && currentLen + para.length > PSEUDO_PAGE_CHARS) {
      pages.push({ n: pages.length + 1, text: current.join('\n\n') });
      current = [];
      currentLen = 0;
    }
    current.push(para);
    currentLen += para.length + 2;
  }
  if (current.length > 0) pages.push({ n: pages.length + 1, text: current.join('\n\n') });
  return pages;
}

/** Xom .docx baytlaridan matnni ajratadi va `extractPdfText`
 * (`worker/lib/pdf.ts`) bilan BIR XIL shaklda (`ExtractedPdf`) qaytaradi —
 * `worker/stages/extract.ts` shu tufayli formatga qarab faqat qaysi
 * funksiyani chaqirishni tanlaydi, natijani qanday ishlatishni EMAS. */
export async function extractDocxText(docxBuffer: Buffer): Promise<ExtractedPdf> {
  const result = await mammoth.extractRawText({ buffer: docxBuffer });
  const fullText = (result.value || '').trim();
  const pages = paginate(fullText);
  const totalMeaningfulChars = pages.reduce((sum, p) => sum + p.text.length, 0);
  const hasTextLayer = pages.length > 0 && totalMeaningfulChars / pages.length >= MIN_MEANINGFUL_CHARS_PER_PAGE;
  return {
    pageCount: pages.length,
    hasTextLayer,
    fullText,
    pages,
  };
}
