// AI-01 worker, S9 "process_audio" — xom audio(lar)ni tekshiradi, 4 ta
// Listening part'ga bo'lib kesadi va WebM/Opus derivativ sifatida SAQLAYDI.
//
// ⚠️ TUZATISH (dastlabki versiyada bu yerga R2'ga yuklanardi, lekin
// `ListeningPart.audioUrl`ni R2'dan playable URL'ga aylantiradigan HECH
// QANDAY serving route yo'q edi — sinov paytida ANIQLANDI). Kesilgan/
// transkodlangan PARTLAR endi `src/lib/exam/audioStorage.ts` orqali GridFS'ga
// yoziladi — bu Speaking yozuvlari uchun ALLAQACHON production'da ishlatilib
// turgan, Range-so'rov qo'llab-quvvatlaydigan, auth-gated serving route'ga
// (`/api/exam/audio/[fileId]`) ega mexanizm. Xom (manba) audio hamon R2'dan
// o'qiladi (`getObjectBuffer`) — faqat YAKUNIY, foydalanuvchiga YUBORILADIGAN
// hosila GridFS'ga ko'chdi, R2 esa "manba material ombori" bo'lib qoladi
// (worker/lib/pdf.ts va boshqa joylardagi R2 ishlatilishi bilan bir xil rol).
//
// To'liq Whisper-asosli "fuzzy-align" (TZ §13 S9 tavsifi) O'RNIGA
// — vaqt/murakkablik sababli bu MVP versiyada — ODDIYROQ, lekin HAQIQIY
// ko'p qatlamli yondashuv:
//   1. AUDIO FAYL <-> TEST moslashtirish: har xom audio manbadan ~90s
//      namuna Whisper bilan transkripsiya qilinadi, so'ng HAR TESTning
//      `split_sections`dan kelgan (endi TEST-DARAJASIDA, `segment.ts` v2
//      izohiga q.) audioscript matni bilan solishtiriladi — eng yaxshi
//      moslikdan boshlab OCHKO'ZLIK bilan (greedy) juftlashtiriladi, bir xil
//      fayl/test ikki marta ishlatilmaydi. AVVAL bu yerda faqat YUKLASH
//      TARTIBI (upload order = test order) ishlatilardi — AI-01 worker
//      commitida "bilingan cheklov" sifatida ATAYLAB qayd etilgan edi.
//      Moslik aniqlanmasa (GROQ_API_KEY yo'q, transkripsiya muvaffaqiyatsiz,
//      yoki hech qanday ball chegaradan yuqori chiqmasa) — TARTIB bo'yicha
//      ZAXIRA moslashtirishga tushadi, hech qachon ish TO'XTAMAYDI.
//   2. `ffmpeg silencedetect` bilan eng uzun 3 ta jimlik oralig'ini topib,
//      shular bo'yicha audio'ni 4 ta taxminiy teng bo'lakka bo'ladi
//      (part orasidagi "javoblaringizni tekshiring" pauzalari odatda eng
//      uzun jimliklar bo'ladi — TZ §7.4 izohi bilan mos).
//   3. Har bo'lakni Whisper bilan transkripsiya qilib, TO'G'RI MOSLANGAN
//      testning audioscript matni bilan oddiy so'z-ustma-ust tushish
//      foizini hisoblaydi — past foiz past ishonch (`transcriptMatchRatio`)
//      sifatida belgilanadi, TO'LIQ moslashtirish emas.
// Bu barchasi HAQIQIY ishlaydi (ffmpeg shu mashinada sinaldi), lekin
// aniqroq DTW-asosli PART chegara moslashtirish keyingi yaxshilanish
// sifatida qoldiriladi.
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { ContentAsset } from '@/lib/models';
import { getObjectBuffer } from '@/lib/storage/r2';
import { probeAudio, detectSilences, cutAudio, transcodeToOpus } from '../lib/ffmpeg';
import { transcribeAudio } from '@/lib/transcribe';
import { uploadAudioBuffer } from '@/lib/exam/audioStorage';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

const ContentAssetModel: any = ContentAsset;

export function wordOverlapRatio(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().match(/[a-z']+/g) || []);
  const setB = new Set(b.toLowerCase().match(/[a-z']+/g) || []);
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap / Math.min(setA.size, setB.size);
}

/** Eng uzun `count-1` ta jimlikni tanlab, `count` ta [start,end) oralig'iga bo'ladi. */
export function splitByLongestSilences(totalDurationSec: number, silences: { startSec: number; endSec: number | null }[], count: number): { startSec: number; endSec: number }[] {
  const usable = silences.filter((s) => s.endSec != null && s.startSec > 5 && s.startSec < totalDurationSec - 5);
  const sorted = [...usable].sort((a, b) => (b.endSec! - b.startSec) - (a.endSec! - a.startSec));
  const boundaries = sorted
    .slice(0, count - 1)
    .map((s) => (s.startSec + s.endSec!) / 2)
    .sort((a, b) => a - b);

  const points = [0, ...boundaries, totalDurationSec];
  const ranges: { startSec: number; endSec: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) ranges.push({ startSec: points[i], endSec: points[i + 1] });
  // Agar yetarli jimlik topilmasa (masalan uzluksiz audio) — qolgan
  // bo'laklarni TENG bo'lib to'ldiramiz, natija hech bo'lmasa `count` ta bo'lak beradi.
  while (ranges.length < count) {
    const last = ranges.pop()!;
    const mid = (last.startSec + last.endSec) / 2;
    ranges.push({ startSec: last.startSec, endSec: mid }, { startSec: mid, endSec: last.endSec });
  }
  return ranges.slice(0, count);
}

export interface AudioPartOutput {
  order: number;
  assetId: string; // ContentAsset — inventar/audit uchun (admin panel)
  gridFsFileId: string; // HAQIQIY playable manzil: /api/exam/audio/{gridFsFileId}
  durationMs: number;
  transcriptMatchRatio: number;
}

export interface ProcessedAudioSource {
  sourceAssetId: string;
  parts: AudioPartOutput[];
}

export interface AudioTestMatch {
  sourceAssetId: string;
  testIndex: number;
  matchScore: number; // 0 bo'lsa order-fallback (kontent tekshirilmagan)
  method: 'content' | 'order-fallback';
}

export interface ProcessAudioOutput {
  sources: ProcessedAudioSource[];
  // `assemble.ts` shundan foydalanadi — TARTIB bo'yicha `sources[index-1]`
  // O'RNIGA, testIndex bo'yicha to'g'ridan-to'g'ri qidiradi.
  byTestIndex: Record<number, ProcessedAudioSource>;
  matching: AudioTestMatch[];
}

const MIN_CONFIDENT_MATCH_SCORE = 0.15; // shundan past ball "moslik" deb hisoblanmaydi — order-fallback'ga qoldiriladi
const MATCH_SAMPLE_SEC = 90;

/** Har xom audio manbadan qisqa namuna oladi, Whisper bilan transkripsiya
 * qiladi va HAR testning audioscript matni bilan so'z-ustma-ust tushish
 * ballini hisoblaydi. `GROQ_API_KEY` yo'q yoki biror sababdan
 * transkripsiya muvaffaqiyatsiz bo'lsa — shu manba uchun bo'sh xarita
 * qaytaradi (chaqiruvchi buni "kontent bo'yicha aniqlab bo'lmadi" deb
 * talqin qiladi, xato TASHLAMAYDI). */
async function computeMatchScores(
  audioAssets: any[],
  tests: { index: number; audioscriptText: string }[]
): Promise<Map<string, Map<number, number>>> {
  const result = new Map<string, Map<number, number>>();
  if (!process.env.GROQ_API_KEY || tests.every((t) => !t.audioscriptText.trim())) return result;

  const dir = await fs.mkdtemp(path.join(tmpdir(), 'vocably-audio-match-'));
  try {
    for (const asset of audioAssets) {
      try {
        const buffer = await getObjectBuffer(asset.storage.key);
        const srcPath = path.join(dir, `src-${asset._id}${path.extname(asset.storage.key) || '.mp3'}`);
        await fs.writeFile(srcPath, buffer);
        const samplePath = path.join(dir, `sample-${asset._id}.wav`);
        await cutAudio(srcPath, samplePath, 0, MATCH_SAMPLE_SEC);
        const sampleBuffer = await fs.readFile(samplePath);
        const transcript = await transcribeAudio(sampleBuffer, `sample-${asset._id}.wav`, 'audio/wav');

        const scores = new Map<number, number>();
        for (const t of tests) {
          if (t.audioscriptText.trim()) scores.set(t.index, wordOverlapRatio(transcript, t.audioscriptText));
        }
        result.set(String(asset._id), scores);
      } catch {
        // shu BITTA manba uchun namuna/transkripsiya muvaffaqiyatsiz —
        // qolgan manbalar uchun davom etamiz, shu biri order-fallback'ga tushadi.
      }
    }
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  return result;
}

/** Ochko'zlik bilan (greedy) eng yuqori balldan boshlab juftlashtiradi —
 * bitta fayl/test faqat BIR MARTA ishlatiladi. Kontent bo'yicha aniqlab
 * bo'lmagan (yoki chegaradan past) qolganlar TARTIB bo'yicha to'ldiriladi. */
export function assignSourcesToTests(
  audioAssets: any[],
  tests: { index: number }[],
  scoresByAsset: Map<string, Map<number, number>>
): AudioTestMatch[] {
  const assignment: AudioTestMatch[] = [];
  const claimedTests = new Set<number>();
  const claimedAssets = new Set<string>();

  const allPairs: { assetId: string; testIndex: number; score: number }[] = [];
  for (const [assetId, scores] of scoresByAsset) {
    for (const [testIndex, score] of scores) allPairs.push({ assetId, testIndex, score });
  }
  allPairs.sort((a, b) => b.score - a.score);

  for (const pair of allPairs) {
    if (pair.score < MIN_CONFIDENT_MATCH_SCORE) break; // saralangan, qolganlari ham past
    if (claimedAssets.has(pair.assetId) || claimedTests.has(pair.testIndex)) continue;
    assignment.push({ sourceAssetId: pair.assetId, testIndex: pair.testIndex, matchScore: pair.score, method: 'content' });
    claimedAssets.add(pair.assetId);
    claimedTests.add(pair.testIndex);
  }

  const remainingAssets = audioAssets.filter((a) => !claimedAssets.has(String(a._id)));
  const remainingTests = tests.filter((t) => !claimedTests.has(t.index)).sort((a, b) => a.index - b.index);
  for (let i = 0; i < Math.min(remainingAssets.length, remainingTests.length); i++) {
    assignment.push({ sourceAssetId: String(remainingAssets[i]._id), testIndex: remainingTests[i].index, matchScore: 0, method: 'order-fallback' });
  }

  return assignment;
}

/** Kitobning HAMMA xom audio fayllari (odatda har Listening test uchun bitta)
 * ustida ishlaydi — `parse_reading`/`parse_listening` kabi qolgan bosqichlar
 * bilan bir xil naqsh (bitta job = bitta bookId, ichkarida bir nechta
 * elementga sikllaydi), chunki `IngestJob` sxemasida "qaysi audio" degan
 * alohida maydon yo'q (audit izohiga q., models.js). */
export async function runProcessAudio(ctx: StageContext): Promise<ProcessAudioOutput> {
  const audioAssets = await ContentAssetModel.find({ bookId: ctx.job.bookId, kind: 'audio' }).lean();
  if (audioAssets.length === 0) return { sources: [], byTestIndex: {}, matching: [] };

  let tests: { index: number; audioscriptText: string }[] = [];
  try {
    const split = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;
    tests = split.tests.map((t) => ({ index: t.index, audioscriptText: t.audioscriptText || '' }));
  } catch {
    // split_sections hali tayyor emas — moslashtirish TO'LIQ order-fallback'ga
    // tushadi (pastda: `tests` bo'sh bo'lsa `assignSourcesToTests` hech
    // qanday kontent-ball topmaydi, faqat tartib bilan ishlaydi).
  }

  const scoresByAsset = await computeMatchScores(audioAssets, tests);
  const matching = assignSourcesToTests(audioAssets, tests, scoresByAsset);
  const testIndexByAssetId = new Map(matching.map((m) => [m.sourceAssetId, m.testIndex] as const));
  const audioscriptByTestIndex = new Map(tests.map((t) => [t.index, t.audioscriptText] as const));

  const sources: ProcessedAudioSource[] = [];
  const byTestIndex: Record<number, ProcessedAudioSource> = {};
  for (const sourceAsset of audioAssets) {
    const assetId = String(sourceAsset._id);
    const matchedTestIndex = testIndexByAssetId.get(assetId);
    const audioscriptText = matchedTestIndex != null ? audioscriptByTestIndex.get(matchedTestIndex) || '' : '';

    const processed = await processOneSource(ctx.job.bookId, sourceAsset, audioscriptText);
    sources.push(processed);
    if (matchedTestIndex != null) byTestIndex[matchedTestIndex] = processed;
  }

  return { sources, byTestIndex, matching };
}

async function processOneSource(bookId: string, sourceAsset: any, audioscriptText: string): Promise<ProcessedAudioSource> {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'vocably-audio-'));
  try {
    const sourceBuffer = await getObjectBuffer(sourceAsset.storage.key);
    const sourcePath = path.join(dir, `source${path.extname(sourceAsset.storage.key) || '.mp3'}`);
    await fs.writeFile(sourcePath, sourceBuffer);

    const probe = await probeAudio(sourcePath);
    const totalDurationSec = probe.durationMs / 1000;
    const silences = await detectSilences(sourcePath, { noiseDb: -30, minDurationSec: 0.4 });
    const ranges = splitByLongestSilences(totalDurationSec, silences, 4);

    const audioscriptChunks = audioscriptText ? splitTextIntoChunks(audioscriptText, ranges.length) : [];
    const parts: AudioPartOutput[] = [];

    for (let i = 0; i < ranges.length; i++) {
      const { startSec, endSec } = ranges[i];
      const cutPath = path.join(dir, `part${i + 1}.wav`);
      await cutAudio(sourcePath, cutPath, startSec, endSec);
      const opusPath = path.join(dir, `part${i + 1}.webm`);
      await transcodeToOpus(cutPath, opusPath);

      const opusBuffer = await fs.readFile(opusPath);
      const filename = `${bookId}-${sourceAsset._id}-part${i + 1}.webm`;
      const gridFsFileId = await uploadAudioBuffer(opusBuffer, filename, 'audio/webm');

      let transcriptMatchRatio = 0;
      if (process.env.GROQ_API_KEY) {
        try {
          const cutBuffer = await fs.readFile(cutPath);
          const transcript = await transcribeAudio(cutBuffer, `part${i + 1}.wav`, 'audio/wav');
          transcriptMatchRatio = audioscriptChunks[i] ? wordOverlapRatio(transcript, audioscriptChunks[i]) : 0;
        } catch {
          transcriptMatchRatio = 0; // transkripsiya muvaffaqiyatsiz bo'lsa ham bosqichni to'xtatmaymiz
        }
      }

      const partProbe = await probeAudio(opusPath);
      // `storage.bucket/key` R2-shaped maydonlar (schema talabi bo'yicha
      // required) — GridFS uchun ham to'ldiriladi (admin inventar/audit
      // uchun), lekin HAQIQIY playable manzil `gridFsFileId`dan quriladi
      // (`assemble.ts`), bu maydonlardan EMAS.
      const asset = await ContentAssetModel.create({
        bookId,
        kind: 'audio',
        storage: { bucket: 'gridfs:examAudio', key: gridFsFileId, bytes: opusBuffer.length, contentType: 'audio/webm' },
        audio: {
          durationMs: partProbe.durationMs,
          sampleRate: partProbe.sampleRate,
          channels: partProbe.channels,
          parentAssetId: sourceAsset._id,
          cutFrom: { startMs: Math.round(startSec * 1000), endMs: Math.round(endSec * 1000) },
        },
      });

      parts.push({ order: i + 1, assetId: String(asset._id), gridFsFileId, durationMs: partProbe.durationMs, transcriptMatchRatio });
    }

    return { sourceAssetId: String(sourceAsset._id), parts };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Audioscript matnini `count` ta taxminan teng bo'lakka bo'ladi (so'z soni
 * bo'yicha) — audio kesilgan bo'laklar bilan TAXMINIY moslashtirish uchun.
 * Aniq bo'lim chegaralarini bilmaymiz (ular odatda "PART 2" kabi sarlavha
 * bilan belgilanadi, lekin buni ishonchli aniqlash alohida ish) — shuning
 * uchun bu FAQAT sanity-check ratio uchun, aniq moslashtirish emas. */
export function splitTextIntoChunks(text: string, count: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const perChunk = Math.ceil(words.length / count);
  const chunks: string[] = [];
  for (let i = 0; i < count; i++) chunks.push(words.slice(i * perChunk, (i + 1) * perChunk).join(' '));
  return chunks;
}
