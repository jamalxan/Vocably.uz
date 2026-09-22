// AI-01 worker, S9 "process_audio" — xom audio(lar)ni tekshiradi, 4 ta
// Listening part'ga bo'lib kesadi va WebM/Opus derivativ sifatida R2'ga
// yuklaydi. To'liq Whisper-asosli "fuzzy-align" (TZ §13 S9 tavsifi) O'RNIGA
// — vaqt/murakkablik sababli bu MVP versiyada — ODDIYROQ, lekin HAQIQIY
// ikki qatlamli yondashuv:
//   1. `ffmpeg silencedetect` bilan eng uzun 3 ta jimlik oralig'ini topib,
//      shular bo'yicha audio'ni 4 ta taxminiy teng bo'lakka bo'ladi
//      (part orasidagi "javoblaringizni tekshiring" pauzalari odatda eng
//      uzun jimliklar bo'ladi — TZ §7.4 izohi bilan mos).
//   2. Har bo'lakni Whisper bilan transkripsiya qilib (`@/lib/transcribe.js`,
//      ALLAQACHON production'da ishlatilayotgan, Speaking yozuvlari uchun),
//      audioscript matni bilan oddiy so'z-ustma-ust tushish foizini
//      hisoblaydi — past foiz past ishonch (`confidence`) sifatida
//      belgilanadi, TO'LIQ moslashtirish emas.
// Bu ikkalasi ham HAQIQIY ishlaydi (ffmpeg shu mashinada sinaldi), lekin
// aniqroq DTW-asosli moslashtirish keyingi yaxshilanish sifatida qoldiriladi.
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { ContentAsset } from '@/lib/models';
import { getObjectBuffer, putObject } from '@/lib/storage/r2';
import { probeAudio, detectSilences, cutAudio, transcodeToOpus } from '../lib/ffmpeg';
import { transcribeAudio } from '@/lib/transcribe';
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
  assetId: string;
  durationMs: number;
  transcriptMatchRatio: number;
}

export interface ProcessedAudioSource {
  sourceAssetId: string;
  parts: AudioPartOutput[];
}

export interface ProcessAudioOutput {
  sources: ProcessedAudioSource[];
}

/** Kitobning HAMMA xom audio fayllari (odatda har Listening test uchun bitta)
 * ustida ishlaydi — `parse_reading`/`parse_listening` kabi qolgan bosqichlar
 * bilan bir xil naqsh (bitta job = bitta bookId, ichkarida bir nechta
 * elementga sikllaydi), chunki `IngestJob` sxemasida "qaysi audio" degan
 * alohida maydon yo'q (audit izohiga q., models.js). */
export async function runProcessAudio(ctx: StageContext): Promise<ProcessAudioOutput> {
  const audioAssets = await ContentAssetModel.find({ bookId: ctx.job.bookId, kind: 'audio' }).lean();
  if (audioAssets.length === 0) return { sources: [] };

  let audioscriptText = '';
  try {
    const split = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;
    audioscriptText = split.audioscriptText || '';
  } catch {
    // audioscript hali tayyor bo'lmasa ham davom etamiz — moslik tekshiruvi
    // shunchaki past ishonch bilan belgilanadi, bloklovchi emas.
  }

  const sources: ProcessedAudioSource[] = [];
  for (const sourceAsset of audioAssets) {
    sources.push(await processOneSource(ctx.job.bookId, sourceAsset, audioscriptText));
  }
  return { sources };
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
      const key = `audio/parts/${bookId}/${sourceAsset._id}/${i + 1}.webm`;
      await putObject(key, opusBuffer, 'audio/webm');

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
      const asset = await ContentAssetModel.create({
        bookId,
        kind: 'audio',
        storage: { bucket: process.env.R2_BUCKET, key, bytes: opusBuffer.length, contentType: 'audio/webm' },
        audio: {
          durationMs: partProbe.durationMs,
          sampleRate: partProbe.sampleRate,
          channels: partProbe.channels,
          parentAssetId: sourceAsset._id,
          cutFrom: { startMs: Math.round(startSec * 1000), endMs: Math.round(endSec * 1000) },
        },
      });

      parts.push({ order: i + 1, assetId: String(asset._id), durationMs: partProbe.durationMs, transcriptMatchRatio });
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
