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
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const VOICE_FOR_INTRO = 'zira';

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = [];
  const parts = {};

  for (let t = 1; t <= 4; t++) {
    const mod = await import(`../content/practice-test-${t}.mjs`);
    const content = mod.default;
    parts[content.slug] = {};

    for (const part of content.listening.parts) {
      const lineFiles = [];
      const introText = `Part ${part.order}. ${part.contextText.replace(/\.$/, '')}.`;
      const introFile = path.join(OUT_DIR, `${content.slug}-l${part.order}-intro.wav`);
      manifest.push({ voice: VOICE_FOR_INTRO, text: introText, file: introFile });
      lineFiles.push(introFile);

      part.transcriptLines.forEach((line, i) => {
        const file = path.join(OUT_DIR, `${content.slug}-l${part.order}-${String(i).padStart(3, '0')}.wav`);
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
