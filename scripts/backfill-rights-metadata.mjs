// AUDIT N-12 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md, Sprint 1) — `ExamTest.rights`
// (`sourceType`, `publishScope`, `licence`, `licenceNote`, `publisher`,
// `rightsVerifiedBy`, `rightsVerifiedAt`) has Mongoose schema `default` values,
// but the admin API response for the 4 pre-existing tests was missing these
// fields entirely. Cause: those documents were created BEFORE the `rights`
// field existed in the schema, and Mongoose schema `default`s are NOT applied
// when a query uses `.lean()` on a document that predates the field — `.lean()`
// bypasses the Mongoose document/default-application layer entirely and
// returns the raw stored Mongo doc (which simply has no `rights` key).
//
// This script materializes the schema defaults into real stored data for any
// `examtests` document that's missing `rights` (or `rights.sourceType`) — a
// pure "make the defaults actually stored" operation, not a behavior change:
// the values written here (`sourceType:'own', publishScope:'public'`, etc.)
// are EXACTLY what the schema's `default:` already implies for these docs.
//
// Read + write (only touches the `rights` field, nothing else). Ishlatish:
//   MONGODB_URI="mongodb+srv://..." node scripts/backfill-rights-metadata.mjs
// yoki .env faylida MONGODB_URI to'g'ri qiymat bo'lsa:
//   node -r dotenv/config scripts/backfill-rights-metadata.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<username>")) {
  console.error("Xato: MONGODB_URI topilmadi yoki hali namuna (placeholder) qiymat turibdi.");
  console.error('Masalan: MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sinonimlar" node scripts/backfill-rights-metadata.mjs');
  process.exit(1);
}

// Must match `ExamTestSchema.rights` defaults exactly (src/lib/models.js).
const DEFAULT_RIGHTS = {
  sourceType: "own",
  publisher: "",
  licence: "",
  licenceNote: "",
  rightsVerifiedBy: null,
  rightsVerifiedAt: null,
  publishScope: "public",
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // .env URI ichidagi default database

  try {
    const collection = db.collection("examtests");
    const missing = await collection
      .find({ $or: [{ rights: { $exists: false } }, { "rights.sourceType": { $exists: false } }] })
      .toArray();

    console.log(`Topildi: ${missing.length} ta test, 'rights' maydoni to'liq emas.\n`);

    let updatedCount = 0;
    for (const test of missing) {
      console.log(`- ${test.title} (${test._id})`);
      await collection.updateOne({ _id: test._id }, { $set: { rights: DEFAULT_RIGHTS } });
      updatedCount++;
    }

    console.log("\n--- Xulosa ---");
    console.log(`Yangilangan hujjatlar: ${updatedCount}`);
    if (updatedCount === 0) console.log("Yangilash uchun hech narsa yo'q — barcha testlarda 'rights' allaqachon to'liq.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
