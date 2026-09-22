// AI-01 worker, S4 "parse_reading" — TZ §13 S4 "one call/passage" desan ham,
// bu yerda BITTA testning BUTUN Reading bo'limi (odatda 3 passage) bitta
// chaqiruvda yuboriladi — chunki `src/lib/exam/aiImportSchema.ts` (P0-01
// ishi, shu sessiyaning oldingi bosqichida) buni ALLAQACHON qo'llab-quvvatlaydi
// (bitta javobda `passages: [...]` massivi) va 15 turdagi savolni to'liq
// qamraydi — buni qayta yozish o'rniga to'g'ridan-to'g'ri qayta ishlatamiz
// (SXEMA + NORMALIZATOR). Faqat PROMPT'ning o'zi bu yerda ALOHIDA
// (`buildParseReadingPrompt`) — `aiImportSchema.ts`dagi `buildAiImportPrompt`
// 12000 belgiga kesadi (bitta passage uchun yetarli, lekin BUTUN bo'lim —
// 3 passage + savollar — uchun KAM). AI CHAQIRUVI ham farq qiladi:
// `aiImportSchema.ts`ning o'zi (`ai-generate/route.js`, admin qo'lda import)
// `generateJson`/Groq-Gemini-Cerebras-OpenRouter zanjiridan foydalanadi;
// worker esa BUTUN pipeline bilan bir xil yo'ldan (`aiStageRunner` ->
// `aiRouter` -> OpenRouter, `AiTaskConfig`dan boshqariladigan) o'tishi kerak —
// ikkalasi HAM oxir-oqibat bir xil sxema/normalizator ishlatgani uchun
// natija formati bir xil, faqat "kim chaqiradi" farq qiladi.
import { AI_IMPORT_RESPONSE_SCHEMA, normalizeAiPassages } from '@/lib/exam/aiImportSchema';
import type { Passage } from '@/lib/exam/types';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

const PROMPT_VERSION = 'v1';
const MAX_CHARS = 45000; // 3 passage + savol + javob kaliti uchun yetarli, ochiq-chek uchun cheklangan

function buildParseReadingPrompt(sectionText: string): string {
  return `Quyida bitta IELTS testining BUTUN Reading bo'limi (odatda 3 passage, har biriga tegishli savollar va javob kaliti aralash holda) — xom, formatlanmagan matn berilgan. Buni strukturali JSON'ga o'gir.

XOM MATN:
"""
${sectionText.slice(0, MAX_CHARS)}
"""

Qoidalar:
- Har bir passage uchun: order (1, 2, 3), title, paragraphs (har biri {label?, text} — label faqat matnda A/B/C... harflari aniq ko'rsatilgan bo'lsa).
- Har savol guruhi uchun: yuqoridagi sxemada ruxsat etilgan turlardan birini tanla (true_false_notgiven, matching_headings, summary_completion va h.k.) — hech qachon eng yaqiniga majburan almashtirma, noaniq bo'lsa needsReview:true qo'y.
- O'zingdan hech narsa TO'QIMA — faqat berilgan matndan chiqar.`;
}

export interface ParseReadingOutput {
  tests: { index: number; passages: Passage[]; needsReview: ReturnType<typeof normalizeAiPassages>['needsReview'] }[];
}

export async function runParseReading(ctx: StageContext): Promise<ParseReadingOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;

  const tests: ParseReadingOutput['tests'] = [];
  for (const test of splitOutput.tests) {
    const sectionText = test.sections.reading?.trim();
    if (!sectionText) continue;

    const { data } = await runAiStage<{ passages?: unknown[] }>({
      taskKey: 'reading.parse',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS Reading kontentini JSON strukturaga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar.",
      userContent: buildParseReadingPrompt(sectionText),
      jsonSchema: AI_IMPORT_RESPONSE_SCHEMA,
      promptVersion: PROMPT_VERSION,
      inputForHash: sectionText,
    });

    const normalized = normalizeAiPassages(data as any);
    tests.push({ index: test.index, passages: normalized.passages, needsReview: normalized.needsReview });
  }

  return { tests };
}
