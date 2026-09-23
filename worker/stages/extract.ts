// AI-01 worker, S1 "extract" — TZ §13: manba fayldan matn + (PDF uchun) har
// sahifa render'ini chiqaradi. Poppler/`pdftoppm` O'RNIGA `pdf-parse` v2
// (pure-JS + prebuilt-native @napi-rs/canvas) ishlatiladi — worker/lib/pdf.ts
// izohiga q.
//
// §50.2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — manba format DOCX ham
// bo'lishi mumkin (`worker/lib/docx.ts`, `mammoth` orqali). Qaysi parser
// ishlatilishini `detectSourceFormat` (`@/lib/contentAgent/sourceFormat`, sof funksiya)
// hal qiladi — saqlangan asset'ning `storage.contentType`/`storage.key`
// (fayl nomi/kengaytmasi)idan, xuddi yuklash API'si (`src/app/api/admin/
// books/route.js`) bilan BIR XIL mantiq. DOCX'da haqiqiy "sahifa" (page
// render/screenshot) tushunchasi yo'q — shuning uchun `pageAssetId` har
// doim `null` qoladi va rasm render qilinmaydi (bu ixtiyoriy — `assemble.ts`
// `extract_images`ni allaqachon ixtiyoriy deb ko'radi). Qolgan HAMMA
// natija shakli (`ExtractOutput`) formatidan qat'iy nazar BIR XIL — shundan
// keyingi bosqichlarning (segment/split_sections/parse_*) birortasi ham
// o'zgartirilmadi.
//
// OCR: agar `hasTextLayer:false` chiqsa (PDF uchun — skan qilingan kitob;
// DOCX uchun — deyarli bo'sh hujjat), bu bosqich O'ZI OCR qilmaydi — faqat
// signalni `ContentBook.progress.message`ga yozadi. Vision-based OCR
// (Gemini orqali) alohida keyingi qadam — bu MVP versiyada ATAYLAB
// qurilmagan (audit AI-01 asosiy maqsadi: matn qatlamli PDF'lar uchun
// to'liq ishlaydigan spinal yo'l; skan qilingan kitoblar uchun OCR qo'shish
// tabiiy davomi).
import { ContentBook, ContentAsset } from '@/lib/models';
import { getObjectBuffer, putObject } from '@/lib/storage/r2';
import { extractPdfText, renderPageScreenshots } from '../lib/pdf';
import { extractDocxText } from '../lib/docx';
import { detectSourceFormat } from '@/lib/contentAgent/sourceFormat';
import { UnrecoverableStageError } from '../lib/errors';
import type { StageContext } from '../types';

const ContentBookModel: any = ContentBook;
const ContentAssetModel: any = ContentAsset;

export interface ExtractOutput {
  pageCount: number;
  hasTextLayer: boolean;
  pages: { n: number; text: string; pageAssetId: string | null }[];
}

export async function runExtract(ctx: StageContext): Promise<ExtractOutput> {
  const book = await ContentBookModel.findById(ctx.job.bookId);
  if (!book) throw new UnrecoverableStageError(`ContentBook topilmadi: ${ctx.job.bookId}`);
  if (!book.source?.pdfAssetId) throw new UnrecoverableStageError('ContentBook.source.pdfAssetId yo\'q — manba fayl hali yuklanmagan');

  const sourceAsset = await ContentAssetModel.findById(book.source.pdfAssetId).lean();
  if (!sourceAsset) throw new UnrecoverableStageError(`ContentAsset (manba fayl) topilmadi: ${book.source.pdfAssetId}`);

  const format = detectSourceFormat({ mimeType: sourceAsset.storage.contentType, filename: sourceAsset.storage.key });
  if (!format) {
    throw new UnrecoverableStageError(
      `Manba faylning formati aniqlanmadi (contentType: ${sourceAsset.storage.contentType}, key: ${sourceAsset.storage.key}) — faqat PDF/DOCX qo'llab-quvvatlanadi`
    );
  }

  const sourceBuffer = await getObjectBuffer(sourceAsset.storage.key);
  const extracted = format === 'docx' ? await extractDocxText(sourceBuffer) : await extractPdfText(sourceBuffer);

  // Sahifa render'i (screenshot) faqat PDF uchun — DOCX'da bosma "sahifa"
  // yo'q, render qilinadigan narsa yo'q (izohga q. yuqorida). `assemble.ts`
  // `extract_images` chiqishini ixtiyoriy deb ko'radi, shuning uchun bu
  // DOCX kitoblarda hech narsani buzmaydi (writing task rasmlari bo'lmaydi,
  // xolos — kutilgan holat).
  const pageAssetIdByPage = new Map<number, string>();
  if (format === 'pdf') {
    // Har sahifani PNG'ga render qilib R2'ga yuklaymiz — keyingi bosqichlar
    // (parse_*, qa) vizual kontekst sifatida ishlatishi uchun. Katta
    // kitoblarda (100+ sahifa) bu sezilarli vaqt olishi mumkin — MVP uchun
    // qabul qilingan kelishuv (keyingi optimallashtirish: faqat segment
    // aniqlagan test sahifalarini render qilish, butun kitobni emas).
    const screenshots = await renderPageScreenshots(sourceBuffer);
    for (const shot of screenshots) {
      const key = `books/${book._id}/pages/${String(shot.n).padStart(4, '0')}.png`;
      await putObject(key, shot.buffer, 'image/png');
      const asset = await ContentAssetModel.create({
        bookId: book._id,
        kind: 'page_render',
        storage: { bucket: process.env.R2_BUCKET, key, bytes: shot.buffer.length, contentType: 'image/png' },
        image: { width: null, height: null, pageNumber: shot.n },
      });
      pageAssetIdByPage.set(shot.n, String(asset._id));
    }
  }

  book.source.pageCount = extracted.pageCount;
  book.source.hasTextLayer = extracted.hasTextLayer;
  book.progress = {
    stage: 'extract',
    percent: 100,
    message: extracted.hasTextLayer
      ? ''
      : format === 'pdf'
        ? "Matn qatlami topilmadi — bu skan qilingan kitob bo'lishi mumkin, OCR hali qo'lda ko'rib chiqish talab qiladi."
        : "Hujjatda deyarli matn topilmadi — DOCX fayl bo'sh yoki asosan rasm/jadvaldan iborat bo'lishi mumkin, qo'lda tekshiring.",
  };
  book.updatedAt = new Date();
  await book.save();

  return {
    pageCount: extracted.pageCount,
    hasTextLayer: extracted.hasTextLayer,
    pages: extracted.pages.map((p) => ({ n: p.n, text: p.text, pageAssetId: pageAssetIdByPage.get(p.n) ?? null })),
  };
}
