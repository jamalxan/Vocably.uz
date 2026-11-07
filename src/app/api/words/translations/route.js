import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { requestTranslationLang, synsField, wordTranslations } from '@/lib/vocab/translationLang';
import { LANG_NAME, RESPONSE_SCHEMA, buildPrompt, cleanResults } from '@/lib/vocab/translationFill';
import { NextResponse } from 'next/server';

// Foydalanuvchi tilida tarjimasi yo'q so'zlarga AI tarjima qo'shadi (2026-11-07, "eski so'zlar — AI kerak bo'lganda").
// Mijoz (AppContext) /api/words javobida `tlMissing` so'zlar bo'lsa shu yerni chaqiradi; bir chaqiruv — BATCH tagacha
// so'z va bitta AI kvotasi. Til so'rov cookie'sidan (ru -> synsRu, uz -> syns).
const BATCH = 40;

export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const lang = requestTranslationLang(req);
    const field = synsField(lang);
    const otherLang = lang === 'ru' ? 'uz' : 'ru';

    await connectToDatabase();
    const user = await User.findById(userId).select('categories._id categories.words._id categories.words.word categories.words.syns categories.words.synsRu').lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const items = [];
    let remaining = 0;
    for (const c of user.categories || []) {
      for (const w of c.words || []) {
        if (wordTranslations(w, lang).length) continue;
        remaining += 1;
        if (items.length < BATCH) {
          items.push({ id: String(w._id), cId: c._id, wId: w._id, word: w.word, hint: wordTranslations(w, otherLang).slice(0, 3), hintLang: LANG_NAME[otherLang] });
        }
      }
    }
    if (!items.length) return NextResponse.json({ updated: 0, remaining: 0, translations: {} });

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });

    let data;
    try {
      data = await generateJson(buildPrompt(items, lang), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'words/translations', userId });
    }

    const got = cleanResults(items, data?.results);
    const ops = items
      .filter((it) => got.has(it.id))
      .map((it) => ({
        updateOne: {
          filter: { _id: userId },
          update: { $set: { [`categories.$[c].words.$[w].${field}`]: got.get(it.id) } },
          arrayFilters: [{ 'c._id': it.cId }, { 'w._id': it.wId }],
        },
      }));
    if (ops.length) await User.bulkWrite(ops, { ordered: false });

    return NextResponse.json({ updated: ops.length, remaining: Math.max(0, remaining - ops.length), translations: Object.fromEntries(got) });
  } catch (err) {
    return serverError(err, 'words/translations');
  }
}
