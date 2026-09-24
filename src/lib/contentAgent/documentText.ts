// Manba hujjat (PDF/DOCX) -> matn. Bu mantiq AVVAL faqat `worker/lib/pdf.ts`
// va `worker/lib/docx.ts` ichida yashardi — ya'ni faqat alohida Docker
// worker'ida (Redis + R2 + BullMQ ulangan holatda) ishga tushardi.
//
// 2026-09-24 (admin AI chat orqali kontent yuklash) — admin endi faylni
// TO'G'RIDAN-TO'G'RI chatga tashlaydi va javobni O'SHA ZAHOTI kutadi; bu
// oqim Next.js server tarafida (worker'siz, Redis'siz, R2'siz) ishlashi
// kerak. `pdf-parse` va `mammoth` ikkalasi ham oddiy npm paket (native
// build/OS paketi talab qilmaydi, q. worker/lib/pdf.ts izohi), shuning
// uchun MATN AJRATISHning o'zi bu yerga — `src/lib`ga — ko'chirildi va
// worker fayllari endi shu yagona manbani qayta eksport qiladi (ikki xil
// natija chiqishi mumkin bo'lgan ikkinchi nusxa YO'Q).
//
// Worker'da QOLGANI: sahifa render'i (screenshot) va PDF ichidagi rasmlarni
// chiqarish — ular `@napi-rs/canvas`ga tayanadi va Vercel serverless
// muhitida ishonchli emas, shuning uchun ataylab ko'chirilmadi.
import mammoth from 'mammoth';
import { ensurePdfNodePolyfills } from './pdfNodePolyfills';

// `pdf-parse` ATAYLAB statik import qilinmaydi: pdfjs moduli yuklanishi
// bilanoq `DOMMatrix`ni talab qiladi, Vercel'da esa u yo'q edi — statik
// importda butun route (audio/DOCX yuklash ham) modul darajasida yiqilardi.
// Endi PDF faqat haqiqatan kerak bo'lganda, polyfill'dan KEYIN yuklanadi.
//
// Worker: Node'da pdfjs "fake worker"ni `import("./pdf.worker.mjs")` bilan
// (webpackIgnore) yuklaydi — bundle ichida bu nisbiy fayl yo'q. Worker
// modulini o'zimiz import qilsak, u `globalThis.pdfjsWorker`ni o'rnatadi va
// pdfjs o'sha tayyor handler'ni ishlatadi (fayl qidirmaydi).
let pdfParseLoader: Promise<typeof import('pdf-parse')['PDFParse']> | null = null;

function loadPdfParse() {
  pdfParseLoader ||= (async () => {
    ensurePdfNodePolyfills();
    if (!(globalThis as any).pdfjsWorker?.WorkerMessageHandler) {
      await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    }
    const { PDFParse } = await import('pdf-parse');
    return PDFParse;
  })().catch((err) => {
    pdfParseLoader = null; // keyingi urinishda qayta sinab ko'rilsin
    throw err;
  });
  return pdfParseLoader;
}

export interface ExtractedPage {
  n: number;
  text: string;
}

export interface ExtractedDocument {
  pageCount: number;
  hasTextLayer: boolean;
  fullText: string;
  pages: ExtractedPage[];
}

// Eski nom (`ExtractedPdf`) worker fayllarida ishlatiladi — orqaga moslik.
export type ExtractedPdf = ExtractedDocument;

// Bo'sh sahifa (skan qilingan, matn qatlami yo'q) va oddiy qisqa sahifani
// ajratish uchun — "matn qatlami umuman yo'q" holati OCR zarurligi haqidagi
// signal (bu modul o'zi OCR qilmaydi).
const MIN_MEANINGFUL_CHARS_PER_PAGE = 20;

// ~500-700 so'zli bosma sahifaga yaqin — DOCX'da haqiqiy sahifa tushunchasi
// yo'q, shuning uchun psevdo-sahifalar shu chegara bo'yicha yasaladi.
const PSEUDO_PAGE_CHARS = 3000;

/** Xom PDF baytlaridan har sahifa matnini ajratadi. */
export async function extractPdfText(pdfBuffer: Buffer): Promise<ExtractedDocument> {
  const PDFParse = await loadPdfParse();
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const result = await parser.getText();
    const pages: ExtractedPage[] = (result.pages || []).map((p: any) => ({ n: p.num, text: (p.text || '').trim() }));
    const totalMeaningfulChars = pages.reduce((sum, p) => sum + p.text.length, 0);
    const hasTextLayer = pages.length > 0 && totalMeaningfulChars / pages.length >= MIN_MEANINGFUL_CHARS_PER_PAGE;
    return {
      pageCount: pages.length,
      hasTextLayer,
      fullText: pages.map((p) => p.text).join('\n\n'),
      pages,
    };
  } finally {
    await parser.destroy();
  }
}

/** Xom matnni paragraf chegaralarida (bo'sh qator) ~`PSEUDO_PAGE_CHARS`
 * belgigacha "sahifa"larga guruhlaydi. Bitta paragrafning o'zi chegaradan
 * katta bo'lsa — bo'linmaydi (paragraf o'rtasidan kesish keyingi AI
 * bosqichlariga ma'nosiz chegara berardi). */
export function paginateText(fullText: string): ExtractedPage[] {
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

function fromPlainText(fullText: string): ExtractedDocument {
  const trimmed = (fullText || '').trim();
  const pages = paginateText(trimmed);
  const totalMeaningfulChars = pages.reduce((sum, p) => sum + p.text.length, 0);
  return {
    pageCount: pages.length,
    hasTextLayer: pages.length > 0 && totalMeaningfulChars / pages.length >= MIN_MEANINGFUL_CHARS_PER_PAGE,
    fullText: trimmed,
    pages,
  };
}

/** Xom .docx baytlaridan matnni ajratadi va `extractPdfText` bilan BIR XIL
 * shaklda qaytaradi — chaqiruvchi formatga qarab faqat qaysi funksiyani
 * chaqirishni tanlaydi, natijani qanday ishlatishni EMAS. */
export async function extractDocxText(docxBuffer: Buffer): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ buffer: docxBuffer });
  return fromPlainText(result.value || '');
}

/** Oddiy matn fayl (.txt/.md) — admin ba'zan butun kitobni emas, bitta
 * ko'chirilgan passage + javob kalitini tashlaydi. Bu ham xuddi shu
 * shaklda qaytadi, shunda chat oqimida hech qanday maxsus holat kerak emas. */
export function extractPlainText(buffer: Buffer): ExtractedDocument {
  return fromPlainText(buffer.toString('utf8'));
}

export type DocumentFormat = 'pdf' | 'docx' | 'text';

/** Bitta kirish nuqtasi — format bo'yicha to'g'ri parser tanlaydi. */
export async function extractDocumentText(buffer: Buffer, format: DocumentFormat): Promise<ExtractedDocument> {
  if (format === 'pdf') return extractPdfText(buffer);
  if (format === 'docx') return extractDocxText(buffer);
  return extractPlainText(buffer);
}
