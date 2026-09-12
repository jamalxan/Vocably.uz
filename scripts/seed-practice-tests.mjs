// Seeds the 4 full-length "Vocably Practice Test" ExamTests (Reading + Listening
// + Writing, 40+40 questions each, 2 Writing tasks) — replaces the single tiny
// demo test from scripts/seed-exam-test.mjs with real, complete content so
// Mock/Reading/Listening/Writing can actually be used end to end.
//
// Content is 100% ORIGINAL, written for this app (scripts/content/practice-test-
// {1..4}.mjs) — NOT copied or paraphrased from any real Cambridge/IELTS book.
// TZ-vocably-v2.md's own old-TZ BUG-021 flags reusing real Cambridge material
// under a name like "Cambridge IELTS 15" as a copyright risk and recommends
// "original content + generic names" instead — that is exactly what this does.
// (The actual Cambridge 15 Academic PDF the user placed in memory/ turned out to
// be a scanned image book with no text layer anyway — no OCR tool or network is
// available in this sandbox to extract it, which independently forced the same
// original-content approach.)
//
// Audio pipeline (TZ §23 open question #1, answered differently here than the
// GridFS-based Listening AudioEngine built in Faza 2 item 10): this sandbox has
// no outbound network at all, so neither a cloud TTS API nor even a MongoDB
// connection to store audio in GridFS is reachable. Audio is instead synthesized
// fully offline via Windows' built-in SAPI voices (scripts/tts/*, System.Speech —
// no ffmpeg needed, WAV chunks are hand-concatenated) and served as plain static
// files under public/audio/exam/, which needs no database connection at all to
// work once deployed. Run the TTS pipeline first if you've changed any listening
// transcriptLines:
//   node scripts/tts/build-manifest.mjs
//   powershell -ExecutionPolicy Bypass -File scripts/tts/synthesize.ps1
//   node scripts/tts/concat-parts.mjs
//
// Then seed (needs MONGODB_URI + a real network — this sandbox has neither, so
// this script is written to be run by the user in their own shell):
//   node --env-file=.env.local scripts/seed-practice-tests.mjs
import { MongoClient } from 'mongodb';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { renderChartSvg } from '../src/lib/chartSvg.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DURATIONS_PATH = path.join(__dirname, 'tts', 'out', 'durations.json');
const PARTS_PATH = path.join(__dirname, 'tts', 'out', 'parts.json');

export function chartToImage(chart) {
  const svg = renderChartSvg(chart);
  if (!svg || !svg.trim().startsWith('<svg')) {
    throw new Error(`Task 1 chart type '${chart.chartType}' did not render to an <svg> (only bar/line/pie do) — cannot use as imageUrl.`);
  }
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
  return {
    imageUrl: dataUri,
    imageAlt: `${chart.title} — a ${chart.chartType} chart. ${chart.categories.join(', ')} (${chart.series.map((s) => s.name).join(' vs ')}).`,
  };
}

export function buildListeningSection(content, durations, parts) {
  const testDurations = durations[content.slug];
  const testParts = parts[content.slug];
  if (!testDurations || !testParts) {
    throw new Error(`No synthesized audio found for '${content.slug}' — run the TTS pipeline first (see this file's header comment).`);
  }

  const audioParts = content.listening.parts.map((part) => {
    const order = String(part.order);
    const durationSec = testDurations[order];
    const transcript = testParts[order].transcript;
    if (!durationSec) throw new Error(`Missing duration for ${content.slug} listening part ${part.order}`);
    return {
      order: part.order,
      audioUrl: `/audio/exam/${content.slug}-l${part.order}.wav`,
      durationSec,
      transcript,
      contextText: part.contextText,
      gapAfterSec: part.gapAfterSec,
      questionGroups: part.questionGroups,
    };
  });

  const totalAudioSec = audioParts.reduce((s, p) => s + p.durationSec, 0);
  return {
    // §3.3: durationSec = audio davomiyligi + 2 daq (checkTimeSec) tekshiruv vaqti,
    // shuningdek har part oldidan 30s ko'rish vaqti (F-L3, klient tomonda hisoblanadi).
    durationSec: totalAudioSec + content.listening.checkTimeSec,
    checkTimeSec: content.listening.checkTimeSec,
    parts: audioParts,
  };
}

export function buildWritingSection(content) {
  const { imageUrl, imageAlt } = chartToImage(content.writing.task1.chart);
  const { chart, ...task1Rest } = content.writing.task1;
  return {
    durationSec: content.writing.durationSec,
    tasks: [
      { ...task1Rest, imageUrl, imageAlt },
      content.writing.task2,
    ],
  };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI sozlanmagan (.env.local).');
  if (!existsSync(DURATIONS_PATH) || !existsSync(PARTS_PATH)) {
    throw new Error('TTS pipeline output topilmadi — avval scripts/tts/{build-manifest.mjs,synthesize.ps1,concat-parts.mjs} ni ishga tushiring.');
  }
  const durations = JSON.parse(readFileSync(DURATIONS_PATH, 'utf-8'));
  const parts = JSON.parse(readFileSync(PARTS_PATH, 'utf-8'));

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  try {
    const user = await db.collection('users').findOne({}, { projection: { _id: 1 } });
    if (!user) throw new Error("'users' kolleksiyasida hech kim topilmadi — avval hisob yarating.");

    const results = [];
    for (let t = 1; t <= 4; t++) {
      const mod = await import(`./content/practice-test-${t}.mjs`);
      const content = mod.default;

      const doc = {
        slug: content.slug,
        title: content.title,
        module: 'academic',
        difficulty: content.difficulty,
        sections: {
          reading: content.reading,
          listening: buildListeningSection(content, durations, parts),
          writing: buildWritingSection(content),
        },
        bandTable: null,
        isPublished: true,
        createdBy: user._id,
        createdAt: new Date(),
      };

      const result = await db.collection('examtests').replaceOne({ slug: content.slug }, doc, { upsert: true });
      const testId = result.upsertedId ?? (await db.collection('examtests').findOne({ slug: content.slug }, { projection: { _id: 1 } }))._id;
      results.push({ slug: content.slug, testId: String(testId) });
      console.log(`Seeded: ${content.title} -> ${testId}`);
    }

    console.log('\nBarcha 4 ta test tayyor. Mock endi shulardan tasodifiy birini avtomatik tanlaydi.');
    return results;
  } finally {
    await client.close();
  }
}

// Only run as a CLI script — not when imported purely for its exported helpers
// (chartToImage/buildListeningSection/buildWritingSection), e.g. from
// scripts/content/practiceTests.test.ts, which must not require a live MongoDB.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error('Seed qilishda xatolik:', err);
    process.exit(1);
  });
}
