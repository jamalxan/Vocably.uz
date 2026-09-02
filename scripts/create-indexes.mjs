// One-off script: create every index declared in src/lib/models.js directly against the
// live database, without waiting for the app to connect (Mongoose's own `autoIndex` can be
// slow/disabled in production). Safe to run any time, including against a database that
// already has some or all of these indexes — `createIndexes` is idempotent (an index with
// the same name+spec is a no-op; MongoDB errors only if the same *name* already exists with
// a *different* spec, which won't happen here since these names are new).
//
// Run manually:
//   node --env-file=.env.local scripts/create-indexes.mjs
//
// Point --env-file at whichever file has the REAL MONGODB_URI (production values live in
// Vercel's dashboard, not in this repo's committed .env). Requires Node 20.6+.
//
// Self-contained on purpose (talks to collections directly via the `mongodb` driver instead
// of importing src/lib/models.js) — matches scripts/broadcast-telegram.mjs's convention,
// since the app's own source files use extensionless relative imports that only Next.js's
// bundler resolves, not plain `node`.
//
// `background: true` is passed for clarity/compatibility with pre-4.2 MongoDB semantics;
// on MongoDB 4.2+ (what this app targets) all index builds already use the non-blocking
// hybrid build algorithm by default, so this flag is a no-op there but harmless to include.

import { MongoClient } from 'mongodb';

const INDEX_PLAN = [
  {
    collection: 'users',
    indexes: [
      { key: { role: 1 }, options: { name: 'role_1', background: true } },
      { key: { chatAccess: 1, chatBanned: 1 }, options: { name: 'chatAccess_1_chatBanned_1', background: true } },
      { key: { createdAt: -1 }, options: { name: 'createdAt_-1', background: true } },
      { key: { telegramChatId: 1 }, options: { name: 'telegramChatId_1', background: true } },
    ],
  },
  {
    collection: 'otpsessions',
    indexes: [
      {
        key: { telegramChatId: 1, status: 1, createdAt: -1 },
        options: { name: 'telegramChatId_1_status_1_createdAt_-1', background: true },
      },
    ],
  },
  {
    collection: 'conversations',
    indexes: [
      {
        key: { participantIds: 1, lastMessageAt: -1 },
        options: { name: 'participantIds_1_lastMessageAt_-1', background: true },
      },
      { key: { lastMessageAt: -1 }, options: { name: 'lastMessageAt_-1', background: true } },
      // src/lib/models.js declares this `unique: true` on the schema, but Mongoose's
      // autoIndex never actually built it here (this manual list was the only thing
      // creating indexes in practice) — meaning duplicate conversations for the same
      // pair of users were never actually blocked. Run scripts/fix-duplicate-conversations.mjs
      // FIRST if this is the first time adding this index to an existing database —
      // MongoDB refuses to build a unique index while duplicate/missing values exist.
      { key: { pairKey: 1 }, options: { name: 'pairKey_1', unique: true, background: true } },
    ],
  },
  {
    collection: 'messages',
    indexes: [{ key: { type: 1 }, options: { name: 'type_1', background: true } }],
  },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI sozlanmagan.');

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  try {
    for (const { collection, indexes } of INDEX_PLAN) {
      const coll = db.collection(collection);
      for (const { key, options } of indexes) {
        const start = Date.now();
        const name = await coll.createIndex(key, options);
        console.log(`[${collection}] ${name} — ${Date.now() - start}ms`);
      }
    }
    console.log('\nHammasi tayyor.');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Indeks yaratishda xatolik:', err);
  process.exit(1);
});
