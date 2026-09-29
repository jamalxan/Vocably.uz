// Adds the Speaking section (Part 1 / Part 2 cue card / Part 3) to the 4
// published Vocably Practice Tests that were seeded without one (audit N-04:
// "/app/gapirish — Hozircha testlar yo'q"). Non-destructive: only sets
// `sections.speaking` where it is missing, never replaces the test document,
// so admin-edited fields (rights metadata, availability, mock flags) survive.
//   node --env-file=.env.local scripts/backfill-speaking-sections.mjs
import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const speaking = JSON.parse(readFileSync(path.join(__dirname, 'speaking-content-seed.json'), 'utf-8'));

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
try {
  const tests = client.db().collection('examtests');
  for (const [slug, section] of Object.entries(speaking)) {
    const res = await tests.updateOne(
      { slug, 'sections.speaking': { $exists: false } },
      { $set: { 'sections.speaking': section, updatedAt: new Date() } }
    );
    console.log(`${slug}: ${res.modifiedCount ? 'speaking qo‘shildi' : 'o‘zgarmadi (topilmadi yoki allaqachon bor)'}`);
  }
} finally {
  await client.close();
}
