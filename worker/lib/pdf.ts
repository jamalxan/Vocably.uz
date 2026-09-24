// AI-01 worker, S1 "extract" / S8 "extract_images" — PDF -> text + page
// images + embedded images. Ataylab `pdf-parse` v2 (pdfjs-dist + @napi-rs/canvas
// asosida, ikkalasi ham toza npm paket — prebuilt native binary, Visual Studio
// build tools SHART EMAS) ishlatiladi, Poppler (`pdftoppm`/`pdfimages`) EMAS:
// bu dev mashinada (Windows) Poppler o'rnatilmagan, `@napi-rs/canvas` esa
// qo'lda sinovda (2026-09-22) shu mashinada ishlashi TASDIQLANDI — getText()
// va getScreenshot() ikkalasi ham sinov PDF'ida to'g'ri natija berdi.
// Production (Docker, node:20-slim) uchun ham bir xil — hech qanday qo'shimcha
// OS paketi (poppler-utils) o'rnatish shart emas, faqat shu npm paket.
import { PDFParse } from 'pdf-parse';

// 2026-09-24 — MATN ajratishning o'zi endi `src/lib/contentAgent/
// documentText.ts`da (admin AI chat uni worker'siz, to'g'ridan-to'g'ri
// Next.js server tarafida ishlatadi). Bu yerda faqat QAYTA EKSPORT qilinadi,
// shunda worker bosqichlari (`stages/extract.ts`) va ularning testlari
// o'zgarishsiz qoladi va ikkala oqim ham BITTA implementatsiyani baham
// ko'radi.
export { extractPdfText, type ExtractedPage, type ExtractedPdf } from '@/lib/contentAgent/documentText';

export interface PageScreenshot {
  n: number;
  buffer: Buffer;
  contentType: 'image/png';
}

/** Har sahifani PNG'ga render qiladi — parse/QA bosqichlariga VIZUAL kontekst
 * berish uchun (matn-only extraction diagram/table joylashuvini yo'qotadi).
 * `scale:1.5` ≈ 150dpi'ga yaqin (Poppler'dagi `-r 150` bilan solishtirsa
 * bo'ladigan sifat), IELTS sahifasidagi matnni AI vision modeli o'qishi uchun
 * yetarli. `pageNumbers` berilmasa BARCHA sahifalar render qilinadi — katta
 * kitoblarda chaqiruvchi buni bosqichma-bosqich (masalan bitta test doirasida)
 * chaqirishi kerak, xotira/vaqtni tejash uchun. */
export async function renderPageScreenshots(pdfBuffer: Buffer, pageNumbers?: number[]): Promise<PageScreenshot[]> {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const result = await parser.getScreenshot({ scale: 1.5, partial: pageNumbers, imageDataUrl: false, imageBuffer: true });
    // ⚠️ `Screenshot.pageNumber`, `TextResult.pages[].num` EMAS — pdf-parse v2'ning
    // getText/getScreenshot/getImage natijalari BIR XIL maydon nomini ishlatmaydi
    // (kutubxonaning o'zidagi nomuvofiqlik, ImageResult.d.ts/ScreenshotResult.d.ts/
    // TextResult.d.ts'dan tasdiqlandi) — shuning uchun bu yerda ATAYLAB `pageNumber`.
    return (result.pages || []).map((p) => ({ n: p.pageNumber, buffer: Buffer.from(p.data), contentType: 'image/png' as const }));
  } finally {
    await parser.destroy();
  }
}

export interface EmbeddedImage {
  pageNumber: number;
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
}

/** PDF ichiga o'rnatilgan (chizma/diagramma/xarita kabi) rasmlarni chiqaradi —
 * S8 "extract_images" uchun. `imageThreshold: 80` (default) kichik/dekorativ
 * rasmlarni (masalan chiziqcha, logotip) avtomatik chetlab o'tadi. */
export async function extractEmbeddedImages(pdfBuffer: Buffer, pageNumbers?: number[]): Promise<EmbeddedImage[]> {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const result = await parser.getImage({ partial: pageNumbers, imageDataUrl: false, imageBuffer: true, imageThreshold: 80 });
    const images: EmbeddedImage[] = [];
    for (const page of result.pages || []) {
      for (const img of page.images || []) {
        // `EmbeddedImage.kind` — asl piksel formati (RGB_24BPP kabi), fayl
        // formati EMAS: pdf-parse README'sining o'z namunasi `data`ni
        // to'g'ridan-to'g'ri `.png` sifatida yozadi — kutubxona ichkarida
        // PNG'ga kodlab beradi, shuning uchun `contentType` shu yerda
        // qattiq 'image/png' (kutubxona `mimeType` maydonini bermaydi).
        images.push({ pageNumber: page.pageNumber, buffer: Buffer.from(img.data), contentType: 'image/png', width: img.width, height: img.height });
      }
    }
    return images;
  } finally {
    await parser.destroy();
  }
}
