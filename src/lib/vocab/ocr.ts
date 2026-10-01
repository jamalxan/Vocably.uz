// Skanerlangan PDF uchun OCR (TZ §29 "Extract"): matn qatlami yo'q PDF sahifalarini AI (Gemini, PDF'ni to'g'ridan-to'g'ri
// o'qiydi) matnga aylantiradi. Sof mantiq (I/O yo'q) — AI chaqiruvi va saqlash `server/factoryService.js`/`aiJson.js` da.
// Natija baribir fabrikaning odatiy yo'liga tushadi: bo'lak -> nomzodlar -> AI tahlil -> AI_GENERATED -> inson ko'rib chiqishi.

/** Bitta OCR bo'lagi uchun sahifalar soni (javob uzunligi va vaqt chegarasi uchun kichik). */
export const OCR_PAGES_PER_CHUNK = 3;
/** OCR qilinadigan PDF chegaralari: base64 inline so'rov hajmi (~20 MB) va bo'laklar soni (FACTORY_LIMITS.maxChunks = 120). */
export const OCR_LIMITS = { maxPdfBytes: 14 * 1024 * 1024, maxPages: 120 * OCR_PAGES_PER_CHUNK };

export interface OcrRange {
  from: number;
  to: number;
}

/** Sahifalarni (1 dan boshlab) ketma-ket oraliqlarga bo'ladi. */
export function planOcrRanges(pageCount: number, perChunk = OCR_PAGES_PER_CHUNK): OcrRange[] {
  const n = Math.max(0, Math.floor(pageCount));
  const out: OcrRange[] = [];
  for (let from = 1; from <= n; from += perChunk) out.push({ from, to: Math.min(n, from + perChunk - 1) });
  return out;
}

export function buildOcrPrompt(from: number, to: number): string {
  const range = from === to ? `page ${from}` : `pages ${from} to ${to}`;
  return `Transcribe the printed English text on ${range} of the attached PDF.
Rules:
- Output ONLY the transcribed text, in natural reading order, paragraphs separated by a blank line.
- Do not describe images, do not add comments, headings of your own, or markdown.
- Skip running headers, footers and page numbers.
- If a page has no readable text, output nothing for that page.
- Do not translate and do not summarise; do not invent text you cannot read.`;
}

const PREAMBLE = /^(?:here(?:'s| is| are)[^\n]*|sure[^\n]*|okay[^\n]*|transcription[^\n]*|page \d+[^\n]*:)\s*\n+/i;

/** Model javobini tozalaydi: kod-blok o'rami, "Here is the text" kirish gapi, ortiqcha bo'sh qatorlar. */
export function cleanOcrText(raw: unknown): string {
  let t = typeof raw === 'string' ? raw : '';
  t = t.replace(/\r\n?/g, '\n').trim();
  const fenced = /^```[a-z]*\n([\s\S]*?)\n?```$/i.exec(t);
  if (fenced) t = fenced[1].trim();
  t = t.replace(PREAMBLE, '');
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

/** Model rad etgan/qila olmagan javoblarni (matn emas, uzr) ajratadi — bunday "matn"ni tahlilga yubormaymiz. */
export function looksLikeRefusal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return t.length < 400 && /^(i('m| am)? (sorry|unable|not able)|i can(?:no|')t|unable to|as an ai)/i.test(t);
}
