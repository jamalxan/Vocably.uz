// One-off repair script for src/app/api/chat/conversations — see the "fix(chat): correct
// broken unique index on Conversation.participantIds" commit (e819235). That commit added a
// scalar `pairKey` field with a unique index to replace a broken multikey-array unique index,
// but any Conversation document created BEFORE that commit has no `pairKey` field at all.
// A standard (non-sparse) unique index on `pairKey` cannot be built while more than one
// existing document is missing the field (Mongo treats a missing field as null, and a unique
// index allows at most one null) — and this app never runs a manual index-creation step for
// it (scripts/create-indexes.mjs's INDEX_PLAN doesn't include it either), so in practice the
// unique constraint on `pairKey` has likely never actually existed in this database. Result:
// `POST /api/chat/conversations` has had no real protection against creating a second
// Conversation document for a pair that already has one — every old conversation missing
// `pairKey` gets silently duplicated the next time either user opens that chat, and nothing
// has stopped fresh races from creating duplicates either. Symptom reported by a user: the
// same friend appearing twice in the Do'stlar list with two different last-message previews.
//
// This script finds every group of Conversation documents that share the same (sorted)
// participant pair, keeps the one with the most messages as the "primary", re-parents the
// other group members' Messages onto the primary, merges their mutedBy/hiddenFor/nicknames,
// and deletes the redundant documents. It also backfills `pairKey` on every surviving
// document (including ones that were never part of a duplicate group).
//
// SAFE BY DEFAULT: dry-run — prints the plan, writes nothing. Pass --apply to actually commit.
// Take a database backup/snapshot before running with --apply; this deletes documents.
//
// Run:
//   node --env-file=.env.local scripts/fix-duplicate-conversations.mjs          # dry run
//   node --env-file=.env.local scripts/fix-duplicate-conversations.mjs --apply  # commit
//
// After a successful --apply run, (re-)run scripts/create-indexes.mjs (now updated to include
// the pairKey unique index) so the constraint is actually enforced going forward.
//
// Self-contained on purpose — talks to collections directly via the `mongodb` driver, matching
// scripts/create-indexes.mjs and scripts/broadcast-telegram.mjs's convention (this app's own
// source files use extensionless relative imports that only Next.js's bundler resolves).

import { MongoClient } from 'mongodb';

const APPLY = process.argv.includes('--apply');

function pairKeyOf(participantIds) {
  return participantIds
    .map((id) => String(id))
    .sort()
    .join('_');
}

function mergeIdArrays(a, b) {
  const seen = new Set((a || []).map((id) => String(id)));
  const merged = [...(a || [])];
  for (const id of b || []) {
    if (!seen.has(String(id))) {
      seen.add(String(id));
      merged.push(id);
    }
  }
  return merged;
}

// `nicknames` is a Mongo `object` (Mongoose Map serialized as a plain doc) keyed by userId
// string. Primary's own choices win; the redundant doc only fills in keys primary lacks.
function mergeNicknames(primary, other) {
  const merged = { ...(other || {}), ...(primary || {}) };
  return merged;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI sozlanmagan.');

  console.log(APPLY ? '*** APPLY MODE — o\'zgarishlar yoziladi ***' : 'Dry run — hech narsa yozilmaydi (--apply bilan qayta ishga tushiring)');

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();
  const conversations = db.collection('conversations');
  const messages = db.collection('messages');

  try {
    const all = await conversations.find({}).toArray();
    console.log(`Jami ${all.length} ta suhbat topildi.`);

    const groups = new Map(); // pairKey -> docs[]
    for (const doc of all) {
      const key = pairKeyOf(doc.participantIds);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(doc);
    }

    let backfillOnly = 0;
    let duplicateGroups = 0;
    let deletedDocs = 0;
    let reassignedMessages = 0;

    for (const [key, docs] of groups) {
      if (docs.length === 1) {
        const doc = docs[0];
        if (doc.pairKey !== key) {
          backfillOnly++;
          console.log(`[backfill] ${doc._id} -> pairKey="${key}"`);
          if (APPLY) await conversations.updateOne({ _id: doc._id }, { $set: { pairKey: key } });
        }
        continue;
      }

      duplicateGroups++;
      // Har bir hujjat uchun xabarlar sonini sanaydi — eng ko'p tarixga ega bo'lgani
      // "asosiy" hisoblanadi (bo'sh/yangi yaratilgan nusxa emas, eski suhbat saqlanadi).
      const counts = await Promise.all(
        docs.map((d) => messages.countDocuments({ conversationId: d._id }))
      );
      let primaryIdx = 0;
      for (let i = 1; i < docs.length; i++) {
        if (counts[i] > counts[primaryIdx]) primaryIdx = i;
        else if (counts[i] === counts[primaryIdx] && docs[i].createdAt < docs[primaryIdx].createdAt) primaryIdx = i;
      }
      const primary = docs[primaryIdx];
      const others = docs.filter((_, i) => i !== primaryIdx);

      console.log(
        `[duplicate] pairKey="${key}" — ${docs.length} ta hujjat, asosiy=${primary._id} (${counts[primaryIdx]} xabar), ` +
          `o'chiriladiganlar=${others.map((d) => String(d._id)).join(', ')}`
      );

      let mergedMuted = primary.mutedBy || [];
      let mergedHidden = primary.hiddenFor || [];
      let mergedNicknames = primary.nicknames || {};
      let mergedLastMessageAt = primary.lastMessageAt;
      let mergedLastMessagePreview = primary.lastMessagePreview;

      for (const other of others) {
        const otherCount = await messages.countDocuments({ conversationId: other._id });
        console.log(`  - ${other._id}: ${otherCount} ta xabar qayta ${primary._id}ga ko'chiriladi`);
        reassignedMessages += otherCount;
        if (APPLY) {
          await messages.updateMany({ conversationId: other._id }, { $set: { conversationId: primary._id } });
        }
        mergedMuted = mergeIdArrays(mergedMuted, other.mutedBy);
        mergedHidden = mergeIdArrays(mergedHidden, other.hiddenFor);
        mergedNicknames = mergeNicknames(mergedNicknames, other.nicknames);
        if (other.lastMessageAt && (!mergedLastMessageAt || other.lastMessageAt > mergedLastMessageAt)) {
          mergedLastMessageAt = other.lastMessageAt;
          mergedLastMessagePreview = other.lastMessagePreview;
        }
      }

      if (APPLY) {
        await conversations.updateOne(
          { _id: primary._id },
          {
            $set: {
              pairKey: key,
              mutedBy: mergedMuted,
              hiddenFor: mergedHidden,
              nicknames: mergedNicknames,
              lastMessageAt: mergedLastMessageAt,
              lastMessagePreview: mergedLastMessagePreview,
            },
          }
        );
        await conversations.deleteMany({ _id: { $in: others.map((d) => d._id) } });
      }
      deletedDocs += others.length;
    }

    console.log('\n--- Xulosa ---');
    console.log(`Faqat pairKey to'ldirilgan (dublikatsiz): ${backfillOnly}`);
    console.log(`Dublikat guruhlar: ${duplicateGroups}`);
    console.log(`O'chiriladigan (birlashtiriladigan) hujjatlar: ${deletedDocs}`);
    console.log(`Ko'chiriladigan xabarlar: ${reassignedMessages}`);
    if (!APPLY) {
      console.log('\nBu DRY RUN edi — hech narsa yozilmadi. Yuqoridagi rejani ko\'rib chiqib, rozi bo\'lsangiz --apply bilan qayta ishga tushiring.');
    } else {
      console.log('\nTayyor. Endi scripts/create-indexes.mjs ni qayta ishga tushiring (pairKey unique indeksini o\'rnatish uchun).');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Xatolik:', err);
  process.exit(1);
});
