// Rebuilds out/durations.json + out/parts.json from the committed part WAVs in
// public/audio/exam/ and the content modules (no TTS/SAPI needed). The
// Windows-only synth pipeline was the only thing that ever produced these two
// small files, and out/ is gitignored (the per-line WAVs there are large), so
// on any other machine (CI, Linux dev, a fresh clone) seed-practice-tests.mjs
// and scripts/content/practiceTests.test.ts could not run. The final WAVs are
// the source of truth for duration, so reading their headers is exact.
//   node scripts/tts/rebuild-durations.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { readWavPcm } from './wav-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const AUDIO_DIR = path.join(__dirname, '..', '..', 'public', 'audio', 'exam');

/** Same shape build-manifest.mjs writes (minus per-line synth file paths). */
export function partsFromContent(contents) {
  const parts = {};
  for (const content of contents) {
    parts[content.slug] = {};
    for (const part of content.listening.parts) {
      parts[content.slug][String(part.order)] = {
        gapAfterSec: part.gapAfterSec,
        contextText: part.contextText,
        transcript: part.transcriptLines.map((l) => l.text).join(' '),
      };
    }
  }
  return parts;
}

export function wavSeconds(file) {
  const { fmt, pcm } = readWavPcm(file);
  return pcm.length / (fmt.sampleRate * fmt.numChannels * (fmt.bitsPerSample / 8));
}

export function durationsFromWavs(parts, audioDir = AUDIO_DIR) {
  const durations = {};
  for (const [slug, byOrder] of Object.entries(parts)) {
    durations[slug] = {};
    for (const order of Object.keys(byOrder)) {
      durations[slug][order] = Math.ceil(wavSeconds(path.join(audioDir, `${slug}-l${order}.wav`)));
    }
  }
  return durations;
}

async function main() {
  const contents = [];
  for (let t = 1; t <= 4; t++) contents.push((await import(`../content/practice-test-${t}.mjs`)).default);
  const parts = partsFromContent(contents);
  const durations = durationsFromWavs(parts);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, 'parts.json'), JSON.stringify(parts, null, 2));
  writeFileSync(path.join(OUT_DIR, 'durations.json'), JSON.stringify(durations, null, 2));
  console.log('durations.json:', JSON.stringify(durations));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
