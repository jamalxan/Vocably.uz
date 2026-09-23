// AUDIT N-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — the admin
// "Tekshiruv navbati" (review queue) is now populated for manually-created
// `ExamTest` docs too, via `src/lib/exam/reviewSync.ts#syncValidationIssuesToReviewQueue`,
// wired into `POST /api/admin/exam-tests`, `PATCH /api/admin/exam-tests/:id`
// (publish) and `POST /api/admin/exam-tests/:id/validate`. But that sync only
// RUNS when one of those endpoints runs — it never retroactively backfills the
// 4 tests that were already published before this shipped.
//
// This script is deliberately a FINDER/REMINDER, not a full backfill: fully
// reimplementing `src/lib/exam/contentValidator.ts#validateTest` (the general
// warnings/errors validator, much bigger than the mock-eligibility rules) in
// plain JS here would be a lot of duplication and a real drift risk — the two
// copies would silently diverge over time. Since the admin panel already has
// a one-click "Validatsiya" button per test that calls the real TS validator
// AND persists the results (via the wiring above), the correct fix here is
// just: find the already-published tests and tell the admin which ones to
// click. Read-only — writes nothing.
//
// Ishlatish:
//   MONGODB_URI="mongodb+srv://..." node scripts/backfill-review-queue.mjs
// yoki .env faylida MONGODB_URI to'g'ri qiymat bo'lsa:
//   node -r dotenv/config scripts/backfill-review-queue.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<username>")) {
  console.error("Xato: MONGODB_URI topilmadi yoki hali namuna (placeholder) qiymat turibdi.");
  console.error('Masalan: MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sinonimlar" node scripts/backfill-review-queue.mjs');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // .env URI ichidagi default database

  try {
    const tests = await db
      .collection("examtests")
      .find({ isPublished: true })
      .project({ title: 1, slug: 1 })
      .toArray();

    console.log(`Topildi: ${tests.length} ta nashr etilgan test.\n`);
    console.log("Bu skript hech narsa YOZMAYDI — faqat qaysi testlarni admin panelda qo'lda");
    console.log("validatsiya qilish kerakligini eslatadi (natijalar 'Tekshiruv navbati'ga yoziladi).\n");

    for (const test of tests) {
      console.log(`- ${test.title} (${test.slug || test._id})`);
      console.log(`    -> ishga tushiring: POST /api/admin/exam-tests/${test._id}/validate`);
      console.log(`       (yoki admin panelda shu test qatoridagi "Validatsiya" tugmasi)`);
    }

    console.log("\nTayyor. Yuqoridagi har bir testni deploy qilingandan keyin bir marta validatsiya qiling —");
    console.log("shundan so'ng 'Tekshiruv navbati' ularning content_validator_warning topilmalari bilan to'ladi.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
