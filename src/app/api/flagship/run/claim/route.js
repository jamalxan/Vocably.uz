import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { WORD_CAP_MESSAGE } from '@/lib/vocab/wordCap';
import { addToSystemDeck } from '@/lib/vocab/server/systemDeck';
import { bankEntry, RUN_DECK_NAME } from '@/lib/flagship/runBank';

const MAX_CLAIM = 30;

// POST /api/flagship/run/claim — { words: string[] }
// A guest's Vocably Run round is graded on the device; after sign-up the missed words are saved
// here so they enter SRS (TZ 2.0 §7: "results go into SRS"). Only words from the public bank are
// accepted, so this can't be used to inject arbitrary content. New cards — no XP.
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
    const raw = Array.isArray(body?.words) ? body.words.slice(0, MAX_CLAIM) : [];
    const entries = [...new Map(raw.map(bankEntry).filter(Boolean).map((e) => [e.word, e])).values()];
    if (!entries.length) return NextResponse.json({ error: "Saqlash uchun so'z topilmadi" }, { status: 400 });

    const docs = entries.map((e) => ({ word: e.word, syns: [e.uz], ...(e.ru ? { synsRu: [e.ru] } : {}), enrichment: { cefr: e.cefr, definitionEn: e.definition } }));
    const out = await addToSystemDeck(userId, RUN_DECK_NAME, docs);
    if (out.error === 'not_found') return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    if (out.error === 'word_limit') return NextResponse.json({ error: WORD_CAP_MESSAGE(), code: 'word_limit', room: out.room }, { status: 409 });
    return NextResponse.json({ added: out.added, skipped: entries.length - out.added, deck: RUN_DECK_NAME });
  } catch (err) {
    return serverError(err, 'flagship/run/claim');
  }
}
