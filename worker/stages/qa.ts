// AI-01 worker, S12 "qa" — mustaqil (parse bosqichidan BOSHQA model oilasi —
// `DEFAULT_MODEL_MATRIX.qa.validate` ataylab Claude, parse bosqichlari
// odatda Gemini, aiRouter.js izohiga q.: "bir xil model o'z xatosini
// ko'rmaydi") tekshiruv: assemble qilingan savol/javoblarni ASL bo'lim
// matni (`split_sections`) bilan solishtirib, nomuvofiqlik topadi.
//
// TZ §13 S12'dagi "sahifa rasmi bilan solishtirish + tasodifiy 20% + barcha
// past-ishonchli guruhlar" TO'LIQ sxemasi (per-group confidence tracking +
// vizual QA) BU MVP versiyada QURILMAGAN (vaqt/murakkablik) — buning
// o'rniga SODDA, lekin HAQIQIY: BUTUN test kontentini ASL matn bilan bitta
// AI so'rovida solishtiradi. Kamroq granular (savol-savol emas, test-test),
// lekin haqiqiy nomuvofiqlikni (masalan javob kaliti matnda yozilganidan
// farq qilsa) TOPADI — soxta emas.
import { ExamTest, ReviewItem } from '@/lib/models';
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutputs } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { AssembleOutput } from './assemble';
import type { SplitSectionsOutput } from './splitSections';

const ExamTestModel: any = ExamTest;
const ReviewItemModel: any = ReviewItem;
const PROMPT_VERSION = 'v1';

const QA_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sectionKey: { type: 'string', enum: ['listening', 'reading', 'writing', 'speaking'] },
          questionNumber: { type: 'integer' },
          issue: { type: 'string' },
        },
        required: ['sectionKey', 'issue'],
      },
    },
  },
  required: ['score', 'issues'],
};

function summarizeExtracted(test: any): string {
  const lines: string[] = [];
  for (const passage of test.sections?.reading?.passages || []) {
    for (const g of passage.questionGroups || []) {
      for (const q of g.questions || []) lines.push(`[reading q${q.number}] ${g.type}: accepted=${JSON.stringify(q.answer?.accepted)}`);
    }
  }
  for (const part of test.sections?.listening?.parts || []) {
    for (const g of part.questionGroups || []) {
      for (const q of g.questions || []) lines.push(`[listening q${q.number}] ${g.type}: accepted=${JSON.stringify(q.answer?.accepted)}`);
    }
  }
  return lines.join('\n');
}

function buildPrompt(extractedSummary: string, sourceText: string): string {
  return `Quyida AI tomonidan avtomatik chiqarilgan IELTS savol/javoblar RO'YXATI va shu testning ASL (xom) matni berilgan. Vazifang — ular orasidagi NOMUVOFIQLIKNI topish: chiqarilgan javob asl matndagi javob kalitiga mos kelmasa, yoki savol raqami asl matnda yo'q bo'lsa.

CHIQARILGAN (tekshirilishi kerak):
"""
${extractedSummary.slice(0, 15000)}
"""

ASL MATN (haqiqat manbai):
"""
${sourceText.slice(0, 30000)}
"""

Har nomuvofiqlik uchun: sectionKey, questionNumber (bo'lsa), issue (aniq nima noto'g'ri). "score" — 0 (juda ko'p xato) dan 1 (mukammal mos) gacha umumiy baho.`;
}

export interface QaTestResult {
  testId: string;
  score: number;
  issueCount: number;
}

export interface QaOutput {
  results: QaTestResult[];
}

export async function runQa(ctx: StageContext): Promise<QaOutput> {
  const { assemble, split_sections: splitSections } = await requireStageOutputs(ctx.job.bookId, ['assemble', 'split_sections']);
  const assembleOutput = assemble as AssembleOutput;
  const splitOutput = splitSections as SplitSectionsOutput;

  const results: QaTestResult[] = [];
  for (const testId of assembleOutput.testIds) {
    const test = await ExamTestModel.findById(testId).lean();
    if (!test) continue;

    const sourceSplit = splitOutput.tests.find((t) => t.index === test.source?.testIndex);
    const sourceText = sourceSplit ? [sourceSplit.sections.reading, sourceSplit.sections.listening].filter(Boolean).join('\n\n') : '';
    const extractedSummary = summarizeExtracted(test);

    if (!extractedSummary.trim() || !sourceText.trim()) {
      results.push({ testId, score: 0, issueCount: 0 });
      continue;
    }

    const { data } = await runAiStage<{ score: number; issues: { sectionKey: string; questionNumber?: number; issue: string }[] }>({
      taskKey: 'qa.validate',
      bookId: ctx.job.bookId,
      jobId: ctx.job._id,
      systemPrompt: "Sen IELTS kontent sifatini tekshiradigan MUSTAQIL tafitchisan (kontentni O'ZING yaratmagansan) — faqat so'ralgan JSON'ni qaytar.",
      userContent: buildPrompt(extractedSummary, sourceText),
      jsonSchema: { name: 'qa_result', schema: QA_SCHEMA },
      promptVersion: PROMPT_VERSION,
      inputForHash: `${testId}:${extractedSummary.length}:${sourceText.length}`,
    });

    const score = typeof data.score === 'number' ? Math.max(0, Math.min(1, data.score)) : 0;
    const issues = data.issues || [];

    await ExamTestModel.updateOne({ _id: testId }, { $set: { 'qa.score': score, 'qa.validatedAt': new Date() } });

    await Promise.all(
      issues.map((issue) =>
        ReviewItemModel.create({
          bookId: ctx.job.bookId,
          testId,
          target: { sectionKey: issue.sectionKey, questionNumber: issue.questionNumber ?? null },
          reason: 'qa_disagreement',
          severity: 'blocker',
          evidence: { rawText: issue.issue },
          status: 'open',
        })
      )
    );

    results.push({ testId, score, issueCount: issues.length });
  }

  return { results };
}
