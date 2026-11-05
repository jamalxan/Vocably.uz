import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { checkWordRoom } from './wordCap';

/**
 * Adds word docs to a named system deck (created on first use). Words already anywhere in the
 * user's vocabulary are skipped (case-insensitive). Returns { added, skipped } or
 * { error: 'not_found' | 'word_limit', room? }.
 */
export async function addToSystemDeck(userId, deckName, docs) {
  await connectToDatabase();
  const user = await User.findById(userId).select('categories.name categories.words.word').lean();
  if (!user) return { error: 'not_found' };

  const existing = new Set();
  for (const c of user.categories || []) for (const w of c.words || []) existing.add(String(w.word).trim().toLowerCase());
  const toAdd = [];
  for (const d of docs) {
    const k = String(d.word).trim().toLowerCase();
    if (existing.has(k)) continue;
    existing.add(k);
    toAdd.push(d);
  }
  if (toAdd.length === 0) return { added: 0, skipped: docs.length };

  const cap = await checkWordRoom(userId, toAdd.length);
  if (!cap.fits) return { error: 'word_limit', room: cap.room };

  // Push into the deck if it exists; otherwise create it — the `$ne` filter makes two concurrent
  // first adds create the deck once (the loser falls through to the push).
  const push = () => User.updateOne({ _id: userId, 'categories.name': deckName }, { $push: { 'categories.$.words': { $each: toAdd } } });
  let res = await push();
  if (!res.matchedCount) {
    res = await User.updateOne({ _id: userId, 'categories.name': { $ne: deckName } }, { $push: { categories: { name: deckName, words: toAdd } } });
    if (!res.matchedCount) await push();
  }
  return { added: toAdd.length, skipped: docs.length - toAdd.length };
}
