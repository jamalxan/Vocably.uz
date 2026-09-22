// AI-01 worker, S2 "segment" — butun kitob matnidan "xarita" chiqaradi: qaysi
// sahifalar qaysi testga, qaysi bo'limga tegishli. TZ §13 S2 izohi bo'yicha
// ATAYLAB "AI faqat xaritani chizadi, matnni ko'chirmaydi" — gallyutsinatsiya
// xavfini kamaytirish uchun (parse_* bosqichlari haqiqiy matnni keyinroq,
// split_sections orqali, DETERMINISTIK tarzda kesib oladi).
import { ContentBook } from '@/lib/models';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { ExtractOutput } from './extract';

const ContentBookModel: any = ContentBook;

// v2 — har test uchun `audioscript` sahifa oralig'i so'raladigan bo'ldi
// (audio<->test kontent-asosli moslashtirish uchun, processAudio.ts izohiga q.).
const PROMPT_VERSION = 'v2';

const SEGMENT_SCHEMA = {
  type: 'object',
  properties: {
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          pageFrom: { type: 'integer' },
          pageTo: { type: 'integer' },
          sections: {
            type: 'object',
            properties: {
              listening: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              reading: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              writing: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
              speaking: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
            },
          },
          // AUDIT — audio<->test moslashtirish uchun: "Audioscripts" bo'limi
          // odatda kitob OXIRIDA, testlar bo'yicha alohida-alohida
          // guruhlangan (masalan "Test 1 Audioscript", "Test 2 Audioscript").
          // Bu maydon YO'Q bo'lgan eski chaqiruvlarda ham (`audioscriptPages`
          // ustidan) ishlaydi — orqaga moslik uchun ixtiyoriy.
          audioscript: { type: 'object', properties: { pageFrom: { type: 'integer' }, pageTo: { type: 'integer' } } },
          confidence: { type: 'number' },
        },
        required: ['index', 'pageFrom', 'pageTo', 'sections'],
      },
    },
    answerKeyPages: { type: 'array', items: { type: 'integer' } },
    audioscriptPages: { type: 'array', items: { type: 'integer' } },
    generalTrainingPages: { type: 'array', items: { type: 'integer' } },
    frontMatterPages: { type: 'array', items: { type: 'integer' } },
  },
  required: ['tests'],
};

function buildPrompt(pages: { n: number; text: string }[]): string {
  const numbered = pages.map((p) => `[PAGE ${p.n}]\n${p.text.slice(0, 2000)}`).join('\n\n');
  return `Quyida IELTS practice test kitobining HAR SAHIFA matni (sahifa raqami bilan belgilangan) berilgan.

Vazifang: kitobning STRUKTURAVIY XARITASINI chiqarish — nechta test bor, har biri qaysi sahifalarda, har testning Listening/Reading/Writing/Speaking bo'limlari qaysi sahifa oralig'ida, Answer Key va Audioscript qaysi sahifalarda.

QATTIQ QOIDA: matnni KO'CHIRMA — faqat sahifa raqamlarini aniqla. Har bir "Test N" sarlavhasi, "Reading Passage", "SECTION", "Answer Key", "Audioscripts/Tapescripts" kabi belgilarni izlab, qaysi sahifada boshlanib qaysi sahifada tugashini top.

MUHIM: "Audioscripts"/"Tapescripts" bo'limi odatda kitob oxirida, HAR TEST UCHUN ALOHIDA guruhlangan bo'ladi (masalan "Test 1 Audioscript", "Test 2 Audioscript" kabi sarlavhalar bilan). Agar buni ajrata olsang, har testning "audioscript" maydoniga O'SHA testga tegishli audioscript sahifa oralig'ini yoz — bu audio fayl(lar)ni to'g'ri testga bog'lash uchun ishlatiladi. Ajrata olmasang, bo'sh qoldir (umumiy "audioscriptPages" baribir bor).

SAHIFALAR:
"""
${numbered.slice(0, 100000)}
"""

Agar biror narsa noaniq bo'lsa (masalan test chegarasi aniq ko'rinmasa), eng yaqin taxminni ber, lekin "confidence"ni pastroq qo'y (0-1 oralig'ida) — 0'ga yaqin taxminiy, 1'ga yaqin ishonchli.`;
}

/** Yengil, ADEDGAN deterministik tekshiruv — AI aytgan "Test N" sahifa
 * oralig'ida haqiqatan ham shu raqam matnda uchraydimi (regex). Mos kelmasa
 * hard-block QILMAYDI (AI xatosi bo'lishi ham, matn formatining g'alatiligi
 * bo'lishi ham mumkin) — faqat ogohlantirish sifatida qaytariladi, admin/QA
 * bosqichi ko'rib chiqadi. */
function crossCheckTestBoundaries(pages: { n: number; text: string }[], tests: { index: number; pageFrom: number; pageTo: number }[]): string[] {
  const warnings: string[] = [];
  const textByPage = new Map(pages.map((p) => [p.n, p.text] as const));
  for (const t of tests) {
    const windowText = Array.from({ length: Math.max(1, t.pageTo - t.pageFrom + 1) }, (_, i) => textByPage.get(t.pageFrom + i) || '').join(' ');
    const pattern = new RegExp(`test\\s*${t.index}\\b`, 'i');
    if (!pattern.test(windowText)) {
      warnings.push(`Test ${t.index}: "Test ${t.index}" matni ${t.pageFrom}-${t.pageTo} sahifalarda topilmadi (AI xarita xatosi bo'lishi mumkin)`);
    }
  }
  return warnings;
}

export interface SegmentOutput {
  tests: {
    index: number;
    pageFrom: number;
    pageTo: number;
    sections: Record<string, { pageFrom: number; pageTo: number } | undefined>;
    audioscript?: { pageFrom: number; pageTo: number };
    confidence?: number;
  }[];
  answerKeyPages: number[];
  audioscriptPages: number[];
  generalTrainingPages: number[];
  frontMatterPages: number[];
  crossCheckWarnings: string[];
}

export async function runSegment(ctx: StageContext): Promise<SegmentOutput> {
  const extractOutput = (await requireStageOutput(ctx.job.bookId, 'extract')) as ExtractOutput;
  const pages = extractOutput.pages.map((p) => ({ n: p.n, text: p.text }));

  const { data } = await runAiStage<{
    tests: SegmentOutput['tests'];
    answerKeyPages?: number[];
    audioscriptPages?: number[];
    generalTrainingPages?: number[];
    frontMatterPages?: number[];
  }>({
    taskKey: 'book.segment',
    bookId: ctx.job.bookId,
    jobId: ctx.job._id,
    systemPrompt: "Sen IELTS practice test kitoblarini tuzilishiga qarab xaritalaydigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
    userContent: buildPrompt(pages),
    jsonSchema: { name: 'book_segment', schema: SEGMENT_SCHEMA },
    promptVersion: PROMPT_VERSION,
    inputForHash: pages.map((p) => `${p.n}:${p.text.length}`).join(','),
  });

  const tests = Array.isArray(data.tests) ? data.tests : [];
  const crossCheckWarnings = crossCheckTestBoundaries(pages, tests);

  const output: SegmentOutput = {
    tests,
    answerKeyPages: data.answerKeyPages || [],
    audioscriptPages: data.audioscriptPages || [],
    generalTrainingPages: data.generalTrainingPages || [],
    frontMatterPages: data.frontMatterPages || [],
    crossCheckWarnings,
  };

  await ContentBookModel.updateOne(
    { _id: ctx.job.bookId },
    {
      $set: {
        'detected.tests': tests,
        'detected.answerKeyPages': output.answerKeyPages,
        'detected.audioscriptPages': output.audioscriptPages,
        updatedAt: new Date(),
      },
    }
  );

  return output;
}
