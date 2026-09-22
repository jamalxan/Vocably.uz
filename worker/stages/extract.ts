// AI-01 worker, S1 "extract" — TZ §13: manba PDF'dan matn + har sahifa
// render'ini chiqaradi. Poppler/`pdftoppm` O'RNIGA `pdf-parse` v2 (pure-JS +
// prebuilt-native @napi-rs/canvas) ishlatiladi — worker/lib/pdf.ts izohiga q.
//
// OCR: agar `hasTextLayer:false` chiqsa (skan qilingan kitob), bu bosqich
// O'ZI OCR qilmaydi — faqat signalni `ContentBook.progress.message`ga yozadi.
// Vision-based OCR (Gemini orqali) alohida keyingi qadam — bu MVP versiyada
// ATAYLAB qurilmagan (audit AI-01 asosiy maqsadi: matn qatlamli PDF'lar
// uchun to'liq ishlaydigan spinal yo'l; skan qilingan kitoblar uchun OCR
// qo'shish tabiiy davomi).
import { ContentBook, ContentAsset } from '@/lib/models';
import { getObjectBuffer, putObject } from '@/lib/storage/r2';
import { extractPdfText, renderPageScreenshots } from '../lib/pdf';
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
  if (!book.source?.pdfAssetId) throw new UnrecoverableStageError('ContentBook.source.pdfAssetId yo\'q — PDF hali yuklanmagan');

  const pdfAsset = await ContentAssetModel.findById(book.source.pdfAssetId).lean();
  if (!pdfAsset) throw new UnrecoverableStageError(`ContentAsset (PDF) topilmadi: ${book.source.pdfAssetId}`);

  const pdfBuffer = await getObjectBuffer(pdfAsset.storage.key);
  const extracted = await extractPdfText(pdfBuffer);

  // Har sahifani PNG'ga render qilib R2'ga yuklaymiz — keyingi bosqichlar
  // (parse_*, qa) vizual kontekst sifatida ishlatishi uchun. Katta kitoblarda
  // (100+ sahifa) bu sezilarli vaqt olishi mumkin — MVP uchun qabul qilingan
  // kelishuv (keyingi optimallashtirish: faqat segment aniqlagan test
  // sahifalarini render qilish, butun kitobni emas).
  const screenshots = await renderPageScreenshots(pdfBuffer);
  const pageAssetIdByPage = new Map<number, string>();
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

  book.source.pageCount = extracted.pageCount;
  book.source.hasTextLayer = extracted.hasTextLayer;
  book.progress = {
    stage: 'extract',
    percent: 100,
    message: extracted.hasTextLayer ? '' : "Matn qatlami topilmadi — bu skan qilingan kitob bo'lishi mumkin, OCR hali qo'lda ko'rib chiqish talab qiladi.",
  };
  book.updatedAt = new Date();
  await book.save();

  return {
    pageCount: extracted.pageCount,
    hasTextLayer: extracted.hasTextLayer,
    pages: extracted.pages.map((p) => ({ n: p.n, text: p.text, pageAssetId: pageAssetIdByPage.get(p.n) ?? null })),
  };
}
