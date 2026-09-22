// AI-01 worker, S9 "process_audio" — ffprobe (metadata) + ffmpeg
// (silencedetect + kesish + WebM/Opus derivativ) uchun ingichka wrapper.
// TZ §16 "Audio pipeline": Master WAV, Delivery derivatives WebM/Opus.
//
// Bu dev mashinada `ffmpeg`/`ffprobe` winget orqali o'rnatilgan va PATH'da
// TOPILDI (qo'lda tekshirildi, 2026-09-22) — shuning uchun bu modul (Poppler
// kerak bo'lgan `worker/lib/pdf.ts`dagi rasm-render qismidan farqli, u yerda
// Poppler shart emas edi chunki pdf-parse o'zi ichida render qiladi) haqiqiy
// audio fayl bilan bevosita sinaladi (`ffmpeg.test.ts`, `ffmpeg -f lavfi`
// bilan sintetik sinusoida generatsiya qilib). Production konteynerida
// (node:20-slim) ffmpeg alohida o'rnatilishi SHART (`apt-get install
// ffmpeg`) — bu npm paket emas, tizim darajasidagi binary.
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class FfmpegNotFoundError extends Error {
  constructor(binary: string) {
    super(`'${binary}' topilmadi (PATH'da yo'q) — worker konteynerida ffmpeg o'rnatilganini tekshiring.`);
    this.name = 'FfmpegNotFoundError';
  }
}

function isEnoent(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as NodeJS.ErrnoException).code === 'ENOENT';
}

export interface AudioProbeResult {
  durationMs: number;
  sampleRate: number | null;
  channels: number | null;
  bitrateKbps: number | null;
  formatName: string | null;
}

/** `ffprobe -show_format -show_streams` — audio metadata (davomiylik,
 * sample rate, kanal soni, bitrate). Birinchi audio stream'ni ishlatadi. */
export async function probeAudio(filePath: string): Promise<AudioProbeResult> {
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath]));
  } catch (err) {
    if (isEnoent(err)) throw new FfmpegNotFoundError('ffprobe');
    throw err;
  }

  const parsed = JSON.parse(stdout);
  const audioStream = (parsed.streams || []).find((s: any) => s.codec_type === 'audio');
  const durationSec = Number(parsed.format?.duration ?? audioStream?.duration ?? 0);

  return {
    durationMs: Math.round(durationSec * 1000),
    sampleRate: audioStream?.sample_rate ? Number(audioStream.sample_rate) : null,
    channels: audioStream?.channels ?? null,
    bitrateKbps: parsed.format?.bit_rate ? Math.round(Number(parsed.format.bit_rate) / 1000) : null,
    formatName: parsed.format?.format_name ?? null,
  };
}

export interface SilenceInterval {
  startSec: number;
  endSec: number | null; // audio oxirigacha davom etsa null (silence_end log satri chiqmagan bo'lishi mumkin)
}

/** `ffmpeg -af silencedetect` — jimlik oraliqlarini topadi (TZ §16 "audio
 * matching": part orasidagi tabiiy pauzalarni aniqlash uchun). ffmpeg
 * natijani STDERR'ga yozadi (bu uning normal xatti-harakati, xato emas). */
export async function detectSilences(filePath: string, opts: { noiseDb?: number; minDurationSec?: number } = {}): Promise<SilenceInterval[]> {
  const noiseDb = opts.noiseDb ?? -30;
  const minDurationSec = opts.minDurationSec ?? 0.5;

  // ffmpeg `silencedetect` natijani (boshqa barcha log kabi) STDERR'ga yozadi —
  // muvaffaqiyatli (0) chiqish kodida ham. `execFileAsync` muvaffaqiyat holida
  // ham `{stdout, stderr}` bilan resolve bo'ladi, shuning uchun asosiy o'qish
  // shu yerda; faqat ffmpeg nolga teng bo'lmagan kod bilan chiqqanda (input
  // formatiga bog'liq holatlar bo'lishi mumkin) `catch`dagi `err.stderr`dan
  // o'qiymiz — ikkalasida ham xabar bir xil joyda.
  let stderr = '';
  try {
    const result = await execFileAsync('ffmpeg', ['-i', filePath, '-af', `silencedetect=noise=${noiseDb}dB:d=${minDurationSec}`, '-f', 'null', '-']);
    stderr = result.stderr || '';
  } catch (err: any) {
    if (isEnoent(err)) throw new FfmpegNotFoundError('ffmpeg');
    stderr = err.stderr || '';
    if (!stderr.includes('silence_start') && !stderr.includes('silencedetect')) throw err;
  }

  const intervals: SilenceInterval[] = [];
  const startMatches = [...stderr.matchAll(/silence_start:\s*([\d.]+)/g)];
  const endMatches = [...stderr.matchAll(/silence_end:\s*([\d.]+)/g)];
  for (let i = 0; i < startMatches.length; i++) {
    intervals.push({ startSec: Number(startMatches[i][1]), endSec: endMatches[i] ? Number(endMatches[i][1]) : null });
  }
  return intervals;
}

/** Aniq [startSec, endSec) oralig'ini kesib, YANGI faylga yozadi. Re-encode
 * qilinadi (`-c copy` EMAS) — audio format/kodekdan qat'i nazar aniq
 * chegarada kesish uchun (stream-copy ba'zi kodeklarda faqat keyframe'da
 * kesa oladi, IELTS Listening part chegaralari uchun bu YETARLICHA ANIQ
 * emas). */
export async function cutAudio(inputPath: string, outputPath: string, startSec: number, endSec: number): Promise<void> {
  try {
    await execFileAsync('ffmpeg', ['-y', '-i', inputPath, '-ss', String(startSec), '-to', String(endSec), '-ar', '44100', '-ac', '1', outputPath]);
  } catch (err) {
    if (isEnoent(err)) throw new FfmpegNotFoundError('ffmpeg');
    throw err;
  }
}

/** TZ §16 — "Delivery derivatives: WebM/Opus" (asosiy) — master WAV/original'dan
 * kichikroq, brauzerda universal qo'llab-quvvatlanadigan formatga o'giradi. */
export async function transcodeToOpus(inputPath: string, outputPath: string, bitrateKbps = 48): Promise<void> {
  try {
    await execFileAsync('ffmpeg', ['-y', '-i', inputPath, '-c:a', 'libopus', '-b:a', `${bitrateKbps}k`, outputPath]);
  } catch (err) {
    if (isEnoent(err)) throw new FfmpegNotFoundError('ffmpeg');
    throw err;
  }
}
