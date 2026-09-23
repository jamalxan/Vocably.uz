// AI-01 worker, S8 "extract_images" — PDF ichidagi rasmlarni chiqaradi
// (`worker/lib/pdf.ts`, Poppler'siz) va har birini vision-AI bilan
// klassifikatsiya qiladi: diagram/chart/map/photo/decorative. Dekorativ
// (yoki past ishonchli) rasmlar R2'ga yuklanmaydi — faqat MA'NOLI rasmlar.
//
// `relatesTo` (aniq qaysi savol guruhiga tegishli) — bu bosqichda
// HISOBLANMAYDI: bu yerda rasm hali qaysi savolga tegishli ekanini bilish
// uchun yetarli kontekst yo'q (parse_reading/listening natijasi bilan
// KESISHISH kerak). Sahifa-asosli bog'lash `assemble.ts`da (yaqinlik
// evristikasi bilan) qilinadi — bu bosqich faqat "bu sahifada shu turdagi
// rasm bor" deb belgilaydi.
import { ContentAsset } from '@/lib/models';
import { getObjectBuffer, putObject } from '@/lib/storage/r2';
import { extractEmbeddedImages } from '../lib/pdf';
import { detectSourceFormat } from '@/lib/contentAgent/sourceFormat';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import { UnrecoverableStageError } from '../lib/errors';
import type { StageContext } from '../types';

const ContentAssetModel: any = ContentAsset;
const PROMPT_VERSION = 'v1';

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['diagram', 'chart', 'table_image', 'map', 'plan', 'photo', 'decorative'] },
    confidence: { type: 'number' },
  },
  required: ['kind', 'confidence'],
};

const DECORATIVE_CONFIDENCE_THRESHOLD = 0.7;

export interface ExtractedImageOutput {
  pageNumber: number;
  assetId: string;
  kind: string;
  confidence: number;
}

export interface ExtractImagesOutput {
  images: ExtractedImageOutput[];
}

export async function runExtractImages(ctx: StageContext): Promise<ExtractImagesOutput> {
  // `extract`'ning ContentBook'i emas, to'g'ridan-to'g'ri manba PDF'ni qayta
  // o'qiymiz — chunki `extractEmbeddedImages` PDF baytlariga muhtoj (matn
  // emas, `extract.output`da saqlanmaydi, hajmi katta bo'lgani uchun).
  await requireStageOutput(ctx.job.bookId, 'extract'); // faqat extract tugaganini tekshirish uchun

  const { ContentBook } = await import('@/lib/models');
  const book = await (ContentBook as any).findById(ctx.job.bookId).lean();
  if (!book?.source?.pdfAssetId) throw new UnrecoverableStageError('ContentBook.source.pdfAssetId yo\'q');
  const pdfAsset = await ContentAssetModel.findById(book.source.pdfAssetId).lean();

  // §50.2 — manba DOCX bo'lsa (`@/lib/contentAgent/sourceFormat`, `extract.ts`
  // bilan BIR XIL detektsiya), bu yerda hech narsa qilinmaydi: DOCX ichiga
  // o'rnatilgan rasmlarni chiqarish shu sessiya doirasiga kirmaydi (faqat
  // matn ajratish — TZ), va PDF-ga xos `extractEmbeddedImages` DOCX
  // baytlarida CHIQARIB TASHLAYDI (xato). `assemble.ts` bu bosqich
  // natijasini ALLAQACHON ixtiyoriy deb ko'radi (`extract_images` yo'q
  // bo'lsa `{images:[]}` bilan davom etadi) — shuning uchun bo'sh natija
  // qaytarish HECH NIMANI buzmaydi, faqat foydasiz retry-loop'ning oldini
  // oladi.
  const format = detectSourceFormat({ mimeType: pdfAsset.storage.contentType, filename: pdfAsset.storage.key });
  if (format !== 'pdf') return { images: [] };

  const pdfBuffer = await getObjectBuffer(pdfAsset.storage.key);

  const embedded = await extractEmbeddedImages(pdfBuffer);
  const results: ExtractedImageOutput[] = [];

  for (const img of embedded) {
    const dataUrl = `data:${img.contentType};base64,${img.buffer.toString('base64')}`;
    let classification: { kind: string; confidence: number };
    try {
      const { data } = await runAiStage<{ kind: string; confidence: number }>({
        taskKey: 'image.classify',
        bookId: ctx.job.bookId,
        jobId: ctx.job._id,
        systemPrompt: "Sen IELTS kitobidagi rasmlarni turkumlaydigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
        jsonSchema: { name: 'image_classification', schema: CLASSIFY_SCHEMA },
        promptVersion: PROMPT_VERSION,
        inputForHash: img.buffer.subarray(0, 256).toString('base64'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Bu IELTS practice test kitobidan olingan rasm. Uning turini aniqla: diagram (jarayon/tuzilma sxemasi), chart (grafik/diagramma), table_image (jadval rasmi), map (xarita), plan (bino/hudud rejasi), photo (oddiy surat, savol uchun ahamiyatsiz), yoki decorative (bezak, logotip). confidence (0-1) qo\'sh.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      classification = data;
    } catch {
      // Klassifikatsiya muvaffaqiyatsiz bo'lsa rasmni yo'qotmaymiz — past
      // ishonch bilan "photo" deb belgilaymiz, QA/admin ko'rib chiqadi.
      classification = { kind: 'photo', confidence: 0 };
    }

    if (classification.kind === 'decorative' && classification.confidence >= DECORATIVE_CONFIDENCE_THRESHOLD) continue;

    const key = `images/${ctx.job.bookId}/${img.pageNumber}-${results.length}.png`;
    await putObject(key, img.buffer, img.contentType);
    const asset = await ContentAssetModel.create({
      bookId: ctx.job.bookId,
      kind: 'image',
      storage: { bucket: process.env.R2_BUCKET, key, bytes: img.buffer.length, contentType: img.contentType },
      image: { width: img.width, height: img.height, pageNumber: img.pageNumber },
    });

    results.push({ pageNumber: img.pageNumber, assetId: String(asset._id), kind: classification.kind, confidence: classification.confidence });
  }

  return { images: results };
}
