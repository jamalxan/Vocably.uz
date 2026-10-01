// 3-qadam: build-manifest.mjs yozgan parts.json + synthesize.ps1 tomonidan
// yaratilgan satr-WAV'larni o'qib, har bir Listening part uchun BITTA yakuniy
// audio faylga birlashtiradi (spikerlar orasida qisqa jimlik bilan) va uni
// `public/audio/exam/`ga yozadi — shu yerdan Next.js statik fayl sifatida
// to'g'ridan-to'g'ri xizmat qiladi (GridFS shart emas, TZ §23 audio-provider
// savoliga bu loyihaning eng oddiy javobi: MongoDB tarmog'i mavjud bo'lmasa ham
// ishlaydi). Natijada har part uchun `{slug}-l{order}.mp3` + davomiyligi (sek).
//
// Yakuniy fayl MP3 (mono, 64 kbit/s) — 48 ta testdagi 192 ta part WAV'da ~2.5 GB
// bo'lardi, MP3'da ~10 baravar kichik. Kodlash uchun `ffmpeg` PATH'da bo'lishi
// kerak. Partning satr-fayllari o'zgarmagan bo'lsa (durations.json'dagi `key`
// bir xil), qayta kodlanmaydi.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { concatPartWav } from './wav-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const PUBLIC_AUDIO_DIR = path.join(__dirname, '..', '..', 'public', 'audio', 'exam');
mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });

const parts = JSON.parse(readFileSync(path.join(OUT_DIR, 'parts.json'), 'utf8'));
const DURATIONS_PATH = path.join(OUT_DIR, 'durations.json');
const KEYS_PATH = path.join(OUT_DIR, 'durations-keys.json');
const prevDurations = existsSync(DURATIONS_PATH) ? JSON.parse(readFileSync(DURATIONS_PATH, 'utf8')) : {};
const prevKeys = existsSync(KEYS_PATH) ? JSON.parse(readFileSync(KEYS_PATH, 'utf8')) : {};
const durations = {}; // { [slug]: { [order]: seconds } }
const keys = {};

for (const [slug, byOrder] of Object.entries(parts)) {
  durations[slug] = {};
  keys[slug] = {};
  for (const [order, info] of Object.entries(byOrder)) {
    const mp3 = path.join(PUBLIC_AUDIO_DIR, `${slug}-l${order}.mp3`);
    const key = createHash('sha1').update(info.lineFiles.map((f) => path.basename(f)).join('|')).digest('hex');
    keys[slug][order] = key;
    if (existsSync(mp3) && prevKeys[slug]?.[order] === key && prevDurations[slug]?.[order]) {
      durations[slug][order] = prevDurations[slug][order];
      continue;
    }
    const tmpWav = path.join(OUT_DIR, `${slug}-l${order}.full.wav`);
    const seconds = concatPartWav(info.lineFiles, tmpWav, { gapBetweenLinesSec: 0.45 });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmpWav, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', mp3]);
    rmSync(tmpWav);
    const oldWav = path.join(PUBLIC_AUDIO_DIR, `${slug}-l${order}.wav`);
    if (existsSync(oldWav)) rmSync(oldWav);
    durations[slug][order] = Math.ceil(seconds);
    console.log(`${slug} part ${order}: ${seconds.toFixed(1)}s -> ${path.relative(process.cwd(), mp3)}`);
  }
}

writeFileSync(DURATIONS_PATH, JSON.stringify(durations, null, 2));
writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2));
console.log('Barcha part audio fayllari public/audio/exam/ ga yozildi.');
