import { NextResponse } from 'next/server';
import { VocabularyEntry } from '@/lib/models';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { lemmaCandidates } from '@/lib/vocab/wordForms';
import { serializeEntry } from '@/lib/vocab/server/libraryService';

// GET /api/vocabulary/lookup?word=abandoned — matndagi so'z uchun NASHR QILINGAN kutubxona yozuvi (TZ §22).
// Bepul va tez (AI chaqirilmaydi); topilmasa `entry: null` — klient AI taklifiga (suggest-translation) o'tadi.
export async function GET(req) {
  try {
    const { error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const word = (new URL(req.url).searchParams.get('word') || '').trim();
    if (!/^[A-Za-z][A-Za-z'’-]{0,39}$/.test(word)) return NextResponse.json({ error: "Noto'g'ri so'z" }, { status: 400 });
    const candidates = lemmaCandidates(word).slice(0, 8);
    const found = await VocabularyEntry.find({ status: 'PUBLISHED', normalizedWord: { $in: candidates } })
      .select('-versions -sourceType -reviewNote -createdBy -updatedBy -source')
      .lean();
    // Matndagi shaklning o'ziga yoki unga eng yaqin (ro'yxatda oldinroq turgan) asosga ustuvorlik.
    found.sort((a, b) => candidates.indexOf(a.normalizedWord) - candidates.indexOf(b.normalizedWord));
    return NextResponse.json({ entry: found[0] ? serializeEntry(found[0]) : null });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/lookup');
  }
}
