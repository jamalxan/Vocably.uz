import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { WORD_CAP_MESSAGE } from '@/lib/vocab/wordCap';
import { addToSystemDeck } from '@/lib/vocab/server/systemDeck';
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

    const docs = items.map((i) => ({ word: i.better, syns: [i.original], enrichment: { ieltsSkillTag: 'writing' } }));
    const out = await addToSystemDeck(userId, UPGRADES_DECK_NAME, docs);
    if (out.error === 'not_found') return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    if (out.error === 'word_limit') return NextResponse.json({ error: WORD_CAP_MESSAGE(), code: 'word_limit', room: out.room }, { status: 409 });
    return NextResponse.json({ added: out.added, skipped: items.length - out.added, deck: UPGRADES_DECK_NAME });
  } catch (err) {
    return serverError(err, 'words/upgrades');
  }
}
