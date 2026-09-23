import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { migrateChatHistoryIfNeeded } from '@/lib/chatMigration';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Sessiya muddati tugagan, qayta kiring" }, { status: 401 });

    await connectToDatabase();

    // N-15 (VOCABLY_TZ_V2_LIVE_AUDIT §4) — AppContext.fetchUserData bu route'ni
    // HAR bir /app sahifasida (mock, do'stlar chati, reyting...) sessiya
    // haqiqiyligini tekshirish uchun ham chaqiradi, garchi o'sha sahifalar
    // lug'atdan foydalanmasa ham. `?light=1` — o'sha holatlar uchun: to'liq
    // `categories` (ba'zi userlarda bir necha MB) DB'dan o'qilmaydi va
    // javobga qo'shilmaydi, faqat sessiya + reviewStreak tekshiriladi.
    if (req.nextUrl.searchParams.get('light') === '1') {
      const light = await User.findById(userId).select('reviewStreak lastReviewDate').lean();
      if (!light) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
      return NextResponse.json({ reviewStreak: light.reviewStreak || 0, lastReviewDate: light.lastReviewDate || null });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    // `chatHistory`/`chatSessions` bu yerda hujjatning o'zida (migratsiya tekshiruvi/`.save()`
    // uchun) o'qiladi, lekin frontend (AppContext.fetchUserData) javobdan faqat `categories`
    // va `reviewStreak`ni ishlatadi — shuning uchun javobga qo'shilmaydi (AI suhbatlar
    // `/api/ai/sessions` orqali alohida yuklanadi). Katta chatSessions (base64 rasmlar bilan)
    // uchun bu har bir sahifa yuklanishidagi javob hajmini sezilarli kamaytiradi.
    await migrateChatHistoryIfNeeded(user);

    return NextResponse.json({
      categories: user.categories,
      reviewStreak: user.reviewStreak || 0,
      lastReviewDate: user.lastReviewDate || null,
    });
  } catch (err) {
    return serverError(err, 'words');
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categories } = await req.json();
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    await User.findByIdAndUpdate(userId, { categories });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'words');
  }
}

export async function DELETE(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId, wordIds } = await req.json();
    if (!categoryId || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const result = await User.updateOne(
      { _id: userId, 'categories._id': categoryId },
      { $pull: { 'categories.$.words': { _id: { $in: wordIds } } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'words');
  }
}
