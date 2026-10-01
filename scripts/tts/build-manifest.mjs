// Step 1 of the offline TTS pipeline for the 4 Vocably Practice Tests. No network
// in this sandbox (see scripts/seed-practice-tests.mjs's header for the full
// pipeline explanation), so audio is synthesized entirely offline via Windows'
// built-in SAPI voices (System.Speech) instead of a cloud TTS API, and served as
// static files under public/audio/exam/ instead of GridFS (sidesteps needing any
// MongoDB network access just to store audio).
//
// Reads every listening part's `transcriptLines` out of
// scripts/content/practice-test-{1..4}.mjs and writes:
//   - out/manifest.json  — flat {voice, text, file} list, one per WAV line
//     (consumed by synth.ps1 / synthesize.ps1, one process for all lines).
//   - out/parts.json     — grouped by slug -> part order -> {lineFiles, ...}
//     (consumed by concat-parts.mjs to build one final WAV per part).
// A synthetic "Part N. <contextText>" announcer line is prepended per part
// (TZ-vocably-v2.md §C1 "Audio generatsiyasi": "rasmiy ohangdagi kirish").
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadAllTests } from '../content/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const VOICE_FOR_INTRO = 'zira';

// Fayl nomida matn+ovoz xeshi bor: synthesize.ps1 mavjud faylni qayta sintez
// qilmaydi, shuning uchun yangi test qo'shilganda faqat o'zgargan satrlar
// sintez qilinadi (48 ta testni har safar qaytadan o'qitish shart emas).
function lineFile(slug, order, idx, voice, text) {
  const h = createHash('sha1').update(`${voice}|${text}`).digest('hex').slice(0, 8);
  return path.join(OUT_DIR, `${slug}-l${order}-${idx}-${h}.wav`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = [];
  const parts = {};

  for (const { content } of await loadAllTests()) {
    parts[content.slug] = {};

    for (const part of content.listening.parts) {
      const lineFiles = [];
      const introText = `Part ${part.order}. ${part.contextText.replace(/\.$/, '')}.`;
      const introFile = lineFile(content.slug, part.order, 'intro', VOICE_FOR_INTRO, introText);
      manifest.push({ voice: VOICE_FOR_INTRO, text: introText, file: introFile });
      lineFiles.push(introFile);

      part.transcriptLines.forEach((line, i) => {
        const file = lineFile(content.slug, part.order, String(i).padStart(3, '0'), line.voice, line.text);
        manifest.push({ voice: line.voice, text: line.text, file });
        lineFiles.push(file);
      });

      parts[content.slug][String(part.order)] = {
        lineFiles,
        gapAfterSec: part.gapAfterSec,
        contextText: part.contextText,
        transcript: part.transcriptLines.map((l) => l.text).join(' '),
      };
    }
  }

  writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  writeFileSync(path.join(OUT_DIR, 'parts.json'), JSON.stringify(parts, null, 2), 'utf-8');
  console.log(`Manifest: ${manifest.length} lines across ${Object.keys(parts).length} tests.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
