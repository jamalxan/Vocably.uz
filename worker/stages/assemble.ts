// AI-01 worker, S10 "assemble" — AI EMAS, deterministik birlashtirish:
// parse_reading/listening/writing/speaking/answerkey + extract_images +
// process_audio natijalarini BITTA `ExamTest`-shaklidagi `sections`ga
// yig'adi va har test uchun DRAFT `ExamTest` hujjati yaratadi/yangilaydi
// (`isPublished:false` — TZ §14 "AI hech qachon o'zi hal qilmasin: ...score
// override'ni examiner sifatida tasdiqlash" bilan bir xil ruhda, "publish"
// alohida, ongli qadam bo'lib qoladi — LEGAL-01 gate + admin/avtopilot
// tasdig'i, bu bosqich EMAS).
//
// `ListeningPart.audioUrl` — `process_audio` endi yakuniy WebM/Opus
// partlarni GridFS'ga yozadi (`/lib/exam/audioStorage.ts`, Speaking
// yozuvlari ishlatadigan BIR XIL mexanizm), shuning uchun `audioUrl` shu
// yerda ALLAQACHON MAVJUD, HAQIQIY, auth-gated serving route'ga
// (`/api/exam/audio/[fileId]`, Range-so'rovlarni qo'llab-quvvatlaydi)
// ishora qiladi — hech qanday yangi infratuzilma kerak emas edi.
//
// Audio fayl <-> test moslashtirish endi KONTENT bo'yicha (Whisper namuna
// transkripti + audioscript solishtirish, `processAudio.ts` `matching`
// maydoni) — faqat kontent aniqlab bo'lmagan holatlarda TARTIB'ga
// qaytadi (`method:'order-fallback'`). Bitta manba ichidagi PART
// chegaralari ham xuddi shunday Whisper bilan tekshiriladi
// (`processAudio.ts`'dagi `transcriptMatchRatio`).
//
// `WritingTask.imageUrl` (Academic Task 1 grafik) — `/api/content/assets/
// [assetId]/route.js` (302 redirect'ga presigned R2 GET) orqali beriladi.
// Audio'dan farqli GridFS'ga ko'chirilmadi — statik rasm uchun redirect
// YETARLI (Range/progressiv oqim muammosi yo'q, faylning izohiga q.).
import { ContentBook, ExamTest, ReviewItem } from '@/lib/models';
import { requireStageOutputs } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SegmentOutput } from './segment';
import type { ParseReadingOutput } from './parseReading';
import type { ParseListeningOutput } from './parseListening';
import type { ParseWritingOutput } from './parseWriting';
import type { ParseSpeakingOutput } from './parseSpeaking';
import type { AnswerKeyOutput } from './parseAnswerkey';
import type { ExtractImagesOutput } from './extractImages';
import type { ProcessAudioOutput } from './processAudio';

const ContentBookModel: any = ContentBook;
const ExamTestModel: any = ExamTest;
const ReviewItemModel: any = ReviewItem;

const RIGHTS_SOURCE_MAP: Record<string, string> = {
  own: 'own',
  licensed: 'licensed',
  public_domain: 'public_domain',
  third_party_copyright: 'third_party_copyright',
};
const PUBLISH_SCOPE_MAP: Record<string, string> = { public: 'public', internal: 'organization', private: 'private' };

/** Answer-key'dagi `{number, accepted}` ro'yxatini savol raqami bo'yicha
 * `Question.answer.accepted`ga BIRIKTIRADI. Raqam mos kelmasa (parse_reading
 * chiqargan savol raqami answer key'da yo'q) — bloklovchi emas, faqat shu
 * savolning `accepted`si bo'sh qoladi (keyin `validate.ts` buni error
 * sifatida ushlaydi — "Kamida 1 ta accepted javob bo'lishi kerak").
 *
 * AI-04 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) tekshiruvi — TESKARI
 * yo'nalish (javob kalitida bor, lekin shu raqamli savol parse qilingan
 * kontentda YO'Q — masalan answer key boshqa nashr/bosqichga tegishli
 * sahifadan noto'g'ri ajratilgan bo'lsa) ilgari BUTUNLAY jim yutilardi —
 * `byNumber`da ishlatilmay qolgan yozuv hech qayerga qayd etilmasdi.
 * Endi qaysi raqamlar HAQIQATDA bitta savolga bog'langani qaytariladi —
 * chaqiruvchi (`runAssemble`) qolganlarini (`unmatched`) review navbatiga
 * yozadi (`reason:'missing_answer'` — bu qiymat sxemada/UI'da
 * (`ReviewQueuePanel.jsx#REASON_LABEL`) ALLAQACHON bor edi, lekin hech
 * qayerda yaratilmasdi). */
export function mergeAnswerKey(
  passages: ParseReadingOutput['tests'][number]['passages'],
  answerKey: { number: number; accepted: string[] }[]
): Set<number> {
  const byNumber = new Map(answerKey.map((a) => [a.number, a.accepted] as const));
  const matched = new Set<number>();
  for (const passage of passages) {
    for (const group of passage.questionGroups) {
      for (const question of group.questions) {
        const accepted = byNumber.get(question.number);
        if (accepted?.length) {
          question.answer = { accepted };
          matched.add(question.number);
        }
      }
    }
  }
  return matched;
}

export function mergeListeningAnswerKey(
  parts: ParseListeningOutput['tests'][number]['parts'],
  answerKey: { number: number; accepted: string[] }[]
): Set<number> {
  const byNumber = new Map(answerKey.map((a) => [a.number, a.accepted] as const));
  const matched = new Set<number>();
  for (const part of parts) {
    for (const group of part.questionGroups) {
      for (const question of group.questions) {
        const accepted = byNumber.get(question.number);
        if (accepted?.length) {
          question.answer = { accepted };
          matched.add(question.number);
        }
      }
    }
  }
  return matched;
}

/** AI-04 — `answerKey` ro'yxatidagi, lekin `matched`ga tushmagan (hech qaysi
 * savolga BIRIKTIRILMAGAN) raqamlar uchun `ReviewItem('missing_answer',
 * 'warning')` yaratadi. Bloklovchi EMAS (ehtimol javob kaliti to'g'ri,
 * lekin parse_reading/parse_listening shu savolni umuman chiqarmagan —
 * bu holat allaqachon boshqa yo'l bilan (parse bosqichining o'zi) ko'rinadi;
 * bu yerda faqat admin'ga signal — "javob kaliti X-savol uchun javob
 * beradi, lekin testda bunday raqamli savol topilmadi"). */
export async function flagUnmatchedAnswerKeyEntries(
  ReviewItemModel: any,
  bookId: unknown,
  testId: string,
  sectionKey: 'reading' | 'listening',
  answerKey: { number: number; accepted: string[] }[],
  matched: Set<number>
): Promise<void> {
  const unmatched = answerKey.filter((a) => a.accepted.length > 0 && !matched.has(a.number));
  await Promise.all(
    unmatched.map((a) =>
      ReviewItemModel.create({
        bookId,
        testId,
        target: { sectionKey, questionNumber: a.number },
        reason: 'missing_answer',
        severity: 'warning',
        evidence: {
          rawText: `Javob kaliti ${a.number}-savol uchun javob beradi ("${a.accepted.join(', ')}"), lekin ${sectionKey === 'reading' ? 'Reading' : 'Listening'} bo'limida shu raqamli savol topilmadi — javob kaliti boshqa test/nashrga tegishli bo'lishi yoki savol parse qilinmagan bo'lishi mumkin. Qo'lda tekshiring.`,
        },
        status: 'open',
      })
    )
  );
}

export interface AssembleOutput {
  testIds: string[];
  testCount: number;
}

export async function runAssemble(ctx: StageContext): Promise<AssembleOutput> {
  const book = await ContentBookModel.findById(ctx.job.bookId);
  if (!book) throw new Error(`ContentBook topilmadi: ${ctx.job.bookId}`);

  const outputs = await requireStageOutputs(ctx.job.bookId, [
    'segment',
    'parse_reading',
    'parse_listening',
    'parse_writing',
    'parse_speaking',
    'parse_answerkey',
  ]);
  // extract_images/process_audio — ixtiyoriy (rasm/audio bo'lmagan kitob ham
  // bo'lishi mumkin, masalan faqat Reading practice kitobi) — yo'q bo'lsa
  // bloklovchi emas.
  const optional = await Promise.allSettled([
    requireStageOutputs(ctx.job.bookId, ['extract_images']),
    requireStageOutputs(ctx.job.bookId, ['process_audio']),
  ]);
  const extractImages = optional[0].status === 'fulfilled' ? (optional[0].value.extract_images as ExtractImagesOutput) : { images: [] };
  const processAudio =
    optional[1].status === 'fulfilled' ? (optional[1].value.process_audio as ProcessAudioOutput) : { sources: [], byTestIndex: {}, matching: [] };

  const segment = outputs.segment as SegmentOutput;
  const parseReading = outputs.parse_reading as ParseReadingOutput;
  const parseListening = outputs.parse_listening as ParseListeningOutput;
  const parseWriting = outputs.parse_writing as ParseWritingOutput;
  const parseSpeaking = outputs.parse_speaking as ParseSpeakingOutput;
  const answerKey = outputs.parse_answerkey as AnswerKeyOutput;

  const examModule = book.module === 'both' ? 'academic' : book.module;
  const rightsSourceType = RIGHTS_SOURCE_MAP[book.licence] || 'third_party_copyright'; // noma'lum bo'lsa ENG XAVFSIZ taxmin — bloklovchi tomonga
  const publishScope = PUBLISH_SCOPE_MAP[book.publishScope] || 'private';

  const testIds: string[] = [];

  for (const testMeta of segment.tests) {
    const index = testMeta.index;
    const readingTest = parseReading.tests.find((t) => t.index === index);
    const listeningTest = parseListening.tests.find((t) => t.index === index);
    const writingTest = parseWriting.tests.find((t) => t.index === index);
    const speakingTest = parseSpeaking.tests.find((t) => t.index === index);
    const answerKeyTest = answerKey.tests.find((t) => t.index === index);

    let readingMatched: Set<number> | null = null;
    let listeningMatched: Set<number> | null = null;
    if (readingTest && answerKeyTest) readingMatched = mergeAnswerKey(readingTest.passages, answerKeyTest.reading);
    if (listeningTest && answerKeyTest) listeningMatched = mergeListeningAnswerKey(listeningTest.parts, answerKeyTest.listening);

    // Audio: kontent-asosli moslashtirish natijasi (yuqoridagi fayl izohiga q.).
    const audioSource = processAudio.byTestIndex?.[index];

    const sections: Record<string, unknown> = {};
    if (readingTest?.passages.length) sections.reading = { durationSec: 3600, passages: readingTest.passages };
    if (listeningTest?.parts.length) {
      sections.listening = {
        durationSec: 1800,
        checkTimeSec: 120,
        parts: listeningTest.parts.map((p) => ({
          order: p.order,
          audioUrl: audioSource?.parts[p.order - 1] ? `/api/exam/audio/${audioSource.parts[p.order - 1].gridFsFileId}` : '',
          durationSec: audioSource?.parts[p.order - 1] ? Math.round(audioSource.parts[p.order - 1].durationMs / 1000) : 0,
          contextText: p.contextText || undefined,
          questionGroups: p.questionGroups,
        })),
      };
    }
    if (writingTest?.tasks.length === 2) {
      sections.writing = {
        durationSec: 3600,
        tasks: writingTest.tasks.map((t) => {
          const relatedImage = t.hasVisual ? extractImages.images.find((img) => img.pageNumber === t.visualPageHint) : undefined;
          return {
            order: t.order,
            minWords: t.minWords,
            recommendedMin: t.recommendedMin,
            promptHtml: t.promptHtml,
            imageUrl: relatedImage ? `/api/content/assets/${relatedImage.assetId}` : undefined,
            imageAlt: relatedImage ? `Task ${t.order} visual` : undefined,
          };
        }) as [unknown, unknown] as any,
      };
    }
    if (speakingTest?.speaking) sections.speaking = speakingTest.speaking;

    if (Object.keys(sections).length === 0) continue; // hech narsa parse qilinmagan bo'lsa test yaratmaymiz

    // `ContentBook`da alohida "slug" maydoni yo'q — sarlavhadan hosil
    // qilamiz, kitob ID'ning oxiri bilan (bir xil sarlavhali ikkinchi kitob
    // yuklansa ham `ExamTest.slug` unique'ini buzmasin uchun).
    const titleSlug = String(book.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${titleSlug}-${String(book._id).slice(-6)}-test-${index}`;
    const title = `${book.title} — Test ${index}`;

    const existing = await ExamTestModel.findOne({ 'source.bookId': book._id, 'source.testIndex': index });
    const payload = {
      slug,
      title,
      module: examModule,
      difficulty: 'medium',
      sections,
      isPublished: false,
      createdBy: book.createdBy,
      source: { bookId: book._id, bookTitle: book.title, testIndex: index },
      availability: {
        practiceReading: !!sections.reading,
        practiceListening: !!sections.listening,
        practiceWriting: !!sections.writing,
        practiceSpeaking: !!sections.speaking,
        fullMock: !!(sections.reading && sections.listening && sections.writing),
      },
      rights: {
        sourceType: rightsSourceType,
        publisher: book.publisher || '',
        // `ContentBook`da ozod-matnli "licence" (masalan "CC-BY-4.0") maydoni
        // yo'q, faqat `licenceNote` — shuning uchun `ExamTest.rights.licence`
        // bo'sh qoladi. `sourceType:'licensed'`da bu LEGAL-01 gate'ning
        // "licensed + licence bo'sh = blocker" qoidasini ONGLI ishga
        // tushiradi (contentValidator.ts) — admin haqiqiy litsenziya matnini
        // `ExamTest`ni qo'lda tahrirlab to'ldirishi kerak, worker o'zi
        // to'qimaydi.
        licence: '',
        licenceNote: book.licenceNote || '',
        publishScope,
      },
      // `publishedBy`/`isPublished`/`autoPublishedAt` ATAYLAB bu yerda
      // O'RNATILMAYDI — assemble bosqichida hali HECH narsa nashr qilingani
      // yo'q (schema default: `isPublished:false`, `publishedBy:'admin'`).
      // Auto-publish qarori (LEGAL-01 gate + qa.score + policy) alohida,
      // `qa` bosqichidan KEYIN keladigan `worker/orchestrator/autoPublishGate.ts`
      // ishi — shu yerda oldindan taxmin qilib qo'yish noto'g'ri bo'lardi.
    };

    let testId: string;
    if (existing) {
      Object.assign(existing, payload);
      existing.markModified('sections');
      existing.markModified('rights');
      await existing.save();
      testId = String(existing._id);
    } else {
      const created = await ExamTestModel.create(payload);
      testId = String(created._id);
    }
    testIds.push(testId);

    // AI-04 — javob kalitida bor, lekin hech qaysi savolga bog'lanmagan
    // (parse qilingan kontentda topilmagan) raqamlar uchun review navbati.
    if (answerKeyTest && readingMatched) {
      await flagUnmatchedAnswerKeyEntries(ReviewItemModel, book._id, testId, 'reading', answerKeyTest.reading, readingMatched);
    }
    if (answerKeyTest && listeningMatched) {
      await flagUnmatchedAnswerKeyEntries(ReviewItemModel, book._id, testId, 'listening', answerKeyTest.listening, listeningMatched);
    }

    // Audio kontent bo'yicha tasdiqlanmagan (order-fallback) bo'lsa — admin
    // ko'rib chiqishi uchun ochiq `ReviewItem` ('warning', 'blocker' EMAS:
    // audio hali ham TO'G'RI bo'lishi mumkin, faqat TASDIQLANMAGAN).
    if (listeningTest?.parts.length && audioSource) {
      const match = processAudio.matching?.find((m) => m.testIndex === index);
      if (match?.method === 'order-fallback') {
        await ReviewItemModel.create({
          bookId: book._id,
          testId,
          target: { sectionKey: 'listening' },
          reason: 'low_confidence',
          severity: 'warning',
          confidence: match.matchScore,
          evidence: {
            rawText: `Audio manba (${match.sourceAssetId}) bu testga KONTENT bo'yicha emas, TARTIB (yuklash tartibi) bo'yicha bog'landi — Whisper transkripti audioscript bilan yetarlicha mos kelmadi. Qo'lda tekshiring.`,
          },
          status: 'open',
        });
      }
    }
  }

  await ContentBookModel.updateOne({ _id: book._id }, { $set: { 'detected.generatedTestIds': testIds, updatedAt: new Date() } });

  return { testIds, testCount: testIds.length };
}
