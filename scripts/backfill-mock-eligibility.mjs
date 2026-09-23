// AUDIT EX-06/N-06 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — the new
// `ExamTest.isMockEligible` field is only computed going forward, at (re)publish
// time (`src/app/api/admin/exam-tests/route.js` POST and `[id]/route.js` PATCH,
// via `src/lib/exam/contentValidator.ts#checkMockEligibility`). Tests published
// BEFORE that code shipped never had this field computed, so this one-off
// backfill script computes and stores it for every currently-published test.
//
// This is a standalone .mjs script — it talks to MongoDB directly via the
// native `mongodb` driver (not Mongoose) and cannot import the TypeScript
// `contentValidator.ts` module, so the eligibility rules are reimplemented
// here in plain JS. Keep this in sync with
// `src/lib/exam/contentValidator.ts#checkMockEligibility` if that logic ever
// changes: Reading = exactly 3 passages, 40 questions total, 2150-2750 words
// total (inclusive); Listening = exactly 4 parts, each with exactly 10
// questions and a non-empty audioUrl; Writing = exactly 2 tasks.
//
// Read + write (only touches `isMockEligible`, nothing else). Ishlatish:
//   MONGODB_URI="mongodb+srv://..." node scripts/backfill-mock-eligibility.mjs
// yoki .env faylida MONGODB_URI to'g'ri qiymat bo'lsa:
//   node -r dotenv/config scripts/backfill-mock-eligibility.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<username>")) {
  console.error("Xato: MONGODB_URI topilmadi yoki hali namuna (placeholder) qiymat turibdi.");
  console.error('Masalan: MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sinonimlar" node scripts/backfill-mock-eligibility.mjs');
  process.exit(1);
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]+>/g, " ");
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countQuestions(questionGroups) {
  return (questionGroups || []).reduce((sum, g) => sum + (g.questions || []).length, 0);
}

/** Mirrors `contentValidator.ts#checkMockEligibility` — returns the list of
 * failed rule descriptions (empty array = eligible). */
function computeFailures(test) {
  const failures = [];
  const sections = test.sections || {};

  const reading = sections.reading;
  if (!reading) {
    failures.push("reading: bo'lim yo'q");
  } else {
    const passages = reading.passages || [];
    if (passages.length !== 3) failures.push(`reading: 3 ta passage kerak (${passages.length} ta topildi)`);

    const totalQuestions = passages.reduce((sum, p) => sum + countQuestions(p.questionGroups), 0);
    if (totalQuestions !== 40) failures.push(`reading: jami 40 ta savol kerak (${totalQuestions} ta topildi)`);

    const totalWords = passages.reduce(
      (sum, p) => sum + countWords((p.paragraphs || []).map((par) => stripHtml(par.html)).join(" ")),
      0
    );
    if (totalWords < 2150 || totalWords > 2750) {
      failures.push(`reading: so'z soni 2150-2750 oralig'ida bo'lishi kerak (${totalWords} ta topildi)`);
    }
  }

  const listening = sections.listening;
  if (!listening) {
    failures.push("listening: bo'lim yo'q");
  } else {
    const parts = listening.parts || [];
    if (parts.length !== 4) failures.push(`listening: 4 ta part kerak (${parts.length} ta topildi)`);
    for (const part of parts) {
      const count = countQuestions(part.questionGroups);
      if (count !== 10) failures.push(`listening.part[${part.order}]: 10 ta savol kerak (${count} ta topildi)`);
      if (!part.audioUrl || !String(part.audioUrl).trim()) failures.push(`listening.part[${part.order}]: audioUrl bo'sh`);
    }
  }

  const writing = sections.writing;
  if (!writing) {
    failures.push("writing: bo'lim yo'q");
  } else {
    const tasks = writing.tasks || [];
    if (tasks.length !== 2) failures.push(`writing: 2 ta task kerak (${tasks.length} ta topildi)`);
  }

  return failures;
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // .env URI ichidagi default database

  try {
    const collection = db.collection("examtests");
    const tests = await collection.find({ isPublished: true }).toArray();
    console.log(`Topildi: ${tests.length} ta nashr etilgan test.\n`);

    let eligibleCount = 0;
    let updatedCount = 0;
    for (const test of tests) {
      const failures = computeFailures(test);
      const eligible = failures.length === 0;
      if (eligible) eligibleCount++;

      if (test.isMockEligible !== eligible) {
        await collection.updateOne({ _id: test._id }, { $set: { isMockEligible: eligible } });
        updatedCount++;
      }

      console.log(`[${eligible ? "MOCK" : "mini practice"}] ${test.title} (${test._id})`);
      if (!eligible) {
        for (const reason of failures) console.log(`    - ${reason}`);
      }
    }

    console.log("\n--- Xulosa ---");
    console.log(`Jami tekshirildi: ${tests.length}`);
    console.log(`Mock uchun mos: ${eligibleCount}`);
    console.log(`Mini practice (mos emas): ${tests.length - eligibleCount}`);
    console.log(`Bazada yangilangan hujjatlar: ${updatedCount}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
