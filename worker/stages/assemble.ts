// AI-01 worker, S10 "assemble" — AI EMAS, deterministik birlashtirish:
// parse_reading/listening/writing/speaking/answerkey + extract_images +
// process_audio natijalarini BITTA `ExamTest`-shaklidagi `sections`ga
// yig'adi va har test uchun DRAFT `ExamTest` hujjati yaratadi/yangilaydi
// (`isPublished:false` — TZ §14 "AI hech qachon o'zi hal qilmasin: ...score
// override'ni examiner sifatida tasdiqlash" bilan bir xil ruhda, "publish"
// alohida, ongli qadam bo'lib qoladi — LEGAL-01 gate + admin/avtopilot
// tasdig'i, bu bosqich EMAS).
//
// ⚠️ BILINGAN CHEKLOV — `ListeningPart.audioUrl` (types.ts): bu bosqich
// process_audio'dan kelgan `ContentAsset`ni faqat MOS DEB TAXMIN QILADI
// (audio fayllar tartib bo'yicha testlarga bog'lanadi — kitobda audio
// fayllar test tartibida yuklangan deb faraz qilinadi, aniq bog'lash signali
// hozircha yo'q) VA `audioUrl`ni R2 KEY REFERENCE sifatida yozadi
// (`r2-asset://{assetId}`), HAQIQIY URL EMAS — buni playable URL'ga
// aylantiruvchi serving route (masalan `/api/content/audio/[assetId]`,
// presigned GET'ni proxy qiladigan) hali QURILMAGAN, bu worker ishi emas,
// Next.js API qatlami ishi. Test shu holatda ADMIN PREVIEW uchun yaroqli,
// lekin haqiqiy foydalanuvchi buni hali TOPSHIRA OLMAYDI (Listening audio
// ishlamaydi) — serving route qo'shilmaguncha.
import { ContentBook, ExamTest } from '@/lib/models';
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
 * sifatida ushlaydi — "Kamida 1 ta accepted javob bo'lishi kerak"). */
function mergeAnswerKey(passages: ParseReadingOutput['tests'][number]['passages'], answerKey: { number: number; accepted: string[] }[]): void {
  const byNumber = new Map(answerKey.map((a) => [a.number, a.accepted] as const));
  for (const passage of passages) {
    for (const group of passage.questionGroups) {
      for (const question of group.questions) {
        const accepted = byNumber.get(question.number);
        if (accepted?.length) question.answer = { accepted };
      }
    }
  }
}

function mergeListeningAnswerKey(parts: ParseListeningOutput['tests'][number]['parts'], answerKey: { number: number; accepted: string[] }[]): void {
  const byNumber = new Map(answerKey.map((a) => [a.number, a.accepted] as const));
  for (const part of parts) {
    for (const group of part.questionGroups) {
      for (const question of group.questions) {
        const accepted = byNumber.get(question.number);
        if (accepted?.length) question.answer = { accepted };
      }
    }
  }
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
  const processAudio = optional[1].status === 'fulfilled' ? (optional[1].value.process_audio as ProcessAudioOutput) : { sources: [] };

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

    if (readingTest && answerKeyTest) mergeAnswerKey(readingTest.passages, answerKeyTest.reading);
    if (listeningTest && answerKeyTest) mergeListeningAnswerKey(listeningTest.parts, answerKeyTest.listening);

    // Audio: tartib bo'yicha taxminiy bog'lash (yuqoridagi fayl izohiga q.).
    const audioSource = processAudio.sources[index - 1];

    const sections: Record<string, unknown> = {};
    if (readingTest?.passages.length) sections.reading = { durationSec: 3600, passages: readingTest.passages };
    if (listeningTest?.parts.length) {
      sections.listening = {
        durationSec: 1800,
        checkTimeSec: 120,
        parts: listeningTest.parts.map((p) => ({
          order: p.order,
          audioUrl: audioSource?.parts[p.order - 1] ? `r2-asset://${audioSource.parts[p.order - 1].assetId}` : '',
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
            imageUrl: relatedImage ? `r2-asset://${relatedImage.assetId}` : undefined,
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
      publishedBy: 'ai-agent',
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
  }

  await ContentBookModel.updateOne({ _id: book._id }, { $set: { 'detected.generatedTestIds': testIds, updatedAt: new Date() } });

  return { testIds, testCount: testIds.length };
}
