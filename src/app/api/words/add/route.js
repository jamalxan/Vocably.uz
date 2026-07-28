import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

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

    const result = await User.updateOne(
      { _id: userId, 'categories._id': categoryId },
      { $push: { 'categories.$.words': { $each: cleanWords } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, added: cleanWords.length });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
