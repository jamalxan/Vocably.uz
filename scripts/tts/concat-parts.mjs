// 3-qadam: build-manifest.mjs yozgan parts.json + synthesize.ps1 tomonidan
// yaratilgan satr-WAV'larni o'qib, har bir Listening part uchun BITTA yakuniy
// audio faylga birlashtiradi (spikerlar orasida qisqa jimlik bilan) va uni
// `public/audio/exam/`ga yozadi — shu yerdan Next.js statik fayl sifatida
// to'g'ridan-to'g'ri xizmat qiladi (GridFS shart emas, TZ §23 audio-provider
// savoliga bu loyihaning eng oddiy javobi: MongoDB tarmog'i mavjud bo'lmasa ham
// ishlaydi). Natijada har part uchun `{slug}-l{order}.wav` + davomiyligi (sek).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { concatPartWav } from './wav-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const PUBLIC_AUDIO_DIR = path.join(__dirname, '..', '..', 'public', 'audio', 'exam');
mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });

const parts = JSON.parse(readFileSync(path.join(OUT_DIR, 'parts.json'), 'utf8'));
const durations = {}; // { [slug]: { [order]: seconds } }

for (const [slug, byOrder] of Object.entries(parts)) {
  durations[slug] = {};
  for (const [order, info] of Object.entries(byOrder)) {
    const outFile = path.join(PUBLIC_AUDIO_DIR, `${slug}-l${order}.wav`);
    const seconds = concatPartWav(info.lineFiles, outFile, { gapBetweenLinesSec: 0.45 });
    durations[slug][order] = Math.ceil(seconds);
    console.log(`${slug} part ${order}: ${seconds.toFixed(1)}s -> ${path.relative(process.cwd(), outFile)}`);
  }
}

writeFileSync(path.join(OUT_DIR, 'durations.json'), JSON.stringify(durations, null, 2));
console.log('Barcha part audio fayllari public/audio/exam/ ga yozildi.');
