import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { migrateChatHistoryIfNeeded } from '@/lib/chatMigration';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Sessiya muddati tugagan, qayta kiring" }, { status: 401 });

    const user = await User.findById(userId).select('-password');
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    await migrateChatHistoryIfNeeded(user);

    return NextResponse.json({
      categories: user.categories,
      chatHistory: user.chatHistory || [],
      chatSessions: user.chatSessions || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server xatoligi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const { categories } = await req.json();
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    await User.findByIdAndUpdate(userId, { categories });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Server xatoligi" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

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
    return NextResponse.json({ error: err.message || "Server xatoligi" }, { status: 500 });
  }
}
