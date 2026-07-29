import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId, words } = await req.json();
    if (!categoryId || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const category = user.categories.id(categoryId);
    if (!category) return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });

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

    category.words.push(...cleanWords);

    const confirmMessage = `✅ ${cleanWords.length} ta so'z "${category.name}" kategoriyasiga qo'shildi`;

    const session = params.id ? user.chatSessions.id(params.id) : null;
    if (session) {
      session.messages.push({ role: 'model', parts: [{ text: confirmMessage }] });
      session.updatedAt = new Date();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      added: cleanWords.length,
      categoryName: category.name,
      message: confirmMessage,
    });
  } catch (err) {
    return serverError(err, 'ai/sessions/[id]/confirm-add');
  }
}
