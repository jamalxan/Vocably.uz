import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { WORD_CAP_MESSAGE } from '@/lib/vocab/wordCap';
import { checkWordRoom } from '@/lib/vocab/server/wordCap';
import { cleanPhrase, MAX_UPGRADES, UPGRADES_DECK_NAME } from '@/lib/exam/vocabUpgrades';

// TZ 2.0 §6.6.1 — Writing "so'z yaxshilashlari" → SRS in one tap. The card's front is the
// stronger phrase, the back is the plain one the user actually wrote, so a review asks
// "which band-7 phrase replaces 'a lot of'?". Words land in one system deck, created on
// first use; phrases already anywhere in the user's vocabulary are skipped. No XP: the
// add is one tap, so paying XP for it would just be farmable.
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "So'rov noto'g'ri" }, { status: 400 });
    }
    const raw = Array.isArray(body?.items) ? body.items.slice(0, MAX_UPGRADES * 2) : [];
    const items = [];
    const seen = new Set();
    for (const it of raw) {
      const better = cleanPhrase(it?.better);
      const original = cleanPhrase(it?.original);
      if (!better || !original || seen.has(better.toLowerCase())) continue;
      seen.add(better.toLowerCase());
      items.push({ better, original });
    }
    if (items.length === 0) return NextResponse.json({ error: "Qo'shish uchun so'z topilmadi" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findById(userId).select('categories.name categories.words.word').lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const existing = new Set();
    for (const c of user.categories || []) for (const w of c.words || []) existing.add(String(w.word).trim().toLowerCase());
    const toAdd = items.filter((i) => !existing.has(i.better.toLowerCase()));
    if (toAdd.length === 0) return NextResponse.json({ added: 0, skipped: items.length, deck: UPGRADES_DECK_NAME });

    const cap = await checkWordRoom(userId, toAdd.length);
    if (!cap.fits) return NextResponse.json({ error: WORD_CAP_MESSAGE(), code: 'word_limit', room: cap.room }, { status: 409 });

    const docs = toAdd.map((i) => ({ word: i.better, syns: [i.original], enrichment: { ieltsSkillTag: 'writing' } }));
    // Push into the deck if it exists; otherwise create it — the `$ne` filter makes two
    // concurrent first adds create the deck once (the loser falls through to the push).
    let res = await User.updateOne(
      { _id: userId, 'categories.name': UPGRADES_DECK_NAME },
      { $push: { 'categories.$.words': { $each: docs } } }
    );
    if (!res.matchedCount) {
      res = await User.updateOne(
        { _id: userId, 'categories.name': { $ne: UPGRADES_DECK_NAME } },
        { $push: { categories: { name: UPGRADES_DECK_NAME, words: docs } } }
      );
      if (!res.matchedCount) {
        await User.updateOne(
          { _id: userId, 'categories.name': UPGRADES_DECK_NAME },
          { $push: { 'categories.$.words': { $each: docs } } }
        );
      }
    }
    return NextResponse.json({ added: toAdd.length, skipped: items.length - toAdd.length, deck: UPGRADES_DECK_NAME });
  } catch (err) {
    return serverError(err, 'words/upgrades');
  }
}
