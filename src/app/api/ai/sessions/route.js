import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const user = await User.findById(userId).select('chatSessions');
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const sessions = [...user.chatSessions]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((s) => ({
        id: String(s._id),
        title: s.title,
        updatedAt: s.updatedAt,
        messageCount: s.messages.length,
      }));

    return NextResponse.json({ sessions });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}

// Barcha suhbatlarni o'chirish (foydalanuvchi interfeysida ikki bosqichli tasdiq bilan himoyalangan).
export async function DELETE(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const result = await User.updateOne({ _id: userId }, { $set: { chatSessions: [] } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    user.chatSessions.push({ title: 'Yangi suhbat', messages: [] });
    await user.save();
    const created = user.chatSessions[user.chatSessions.length - 1];

    return NextResponse.json({
      session: { id: String(created._id), title: created.title, updatedAt: created.updatedAt, messageCount: 0 },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
