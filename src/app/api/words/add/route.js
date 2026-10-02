import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { User, XpEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { XP } from '@/lib/gamification';
import { serverError } from '@/lib/apiError';
import { WORD_CAP_MESSAGE } from '@/lib/vocab/wordCap';
import { checkWordRoom } from '@/lib/vocab/server/wordCap';
import { NextResponse } from 'next/server';

const NEW_WORD_XP_DAILY_CAP = 250; // ≈ 50 so'z/kun

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId, words } = await req.json();
    if (!categoryId || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const cleanWords = words
      .filter((w) => w && typeof w.word === 'string' && w.word.trim())
      .map((w) => ({
        word: w.word.trim(),
        syns: Array.isArray(w.syns) ? w.syns.map((s) => String(s).trim()).filter(Boolean) : [],
      }))
      .filter((w) => w.syns.length > 0);

    if (cleanWords.length === 0) {
      return NextResponse.json({ error: "Qo'shish uchun so'z topilmadi" }, { status: 400 });
    }

    const cap = await checkWordRoom(userId, cleanWords.length);
    if (!cap.fits) return NextResponse.json({ error: WORD_CAP_MESSAGE(), code: 'word_limit', room: cap.room }, { status: 409 });

    const result = await User.updateOne(
      { _id: userId, 'categories._id': categoryId },
      { $push: { 'categories.$.words': { $each: cleanWords } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    // FAZA 5 — gamifikatsiya (VOCABLY-TZ.md §13: "yangi so'z 5"). To'liq User hujjatini
    // qayta yuklamaslik uchun (yuqoridagi updateOne allaqachon yengil) to'g'ridan-to'g'ri
    // $inc + XpEvent — src/lib/gamification.js:awardXp shu ikkalasini bitta hujjat
    // ustida qiladi, bu yerda esa hujjat umuman yuklanmaydi.
    // XP suiiste'moliga qarshi: so'zni qo'shib-o'chirib qayta qo'shish bilan cheksiz XP olinmasin — 24 soatda new_word XP chegarasi.
    const [used] = await XpEvent.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(String(userId)), reason: 'new_word', createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const xpAmount = Math.min(cleanWords.length * XP.NEW_WORD, Math.max(0, NEW_WORD_XP_DAILY_CAP - (used?.total || 0)));
    if (xpAmount > 0) {
      await Promise.all([
        User.updateOne({ _id: userId }, { $inc: { xp: xpAmount } }),
        XpEvent.create({ userId, amount: xpAmount, reason: 'new_word' }),
      ]);
    }

    return NextResponse.json({ success: true, added: cleanWords.length });
  } catch (err) {
    return serverError(err, 'words/add');
  }
}
