import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    // Bu sessiyalar ro'yxati (sarlavha + xabarlar soni) har AI Chat ochilganda va har javobdan
    // keyin so'raladi — juda issiq yo'l. `User.findById().select('chatSessions')` har bir
    // suhbatning BARCHA xabarlarini (jumladan bazaviy64 rasmlarni) hujjatdan o'qib olardi,
    // faqat sarlavha/son ko'rsatish uchun. Aggregatsiya orqali faqat kerakli maydonlar
    // ($size — xabarlar sonini hujjatni to'liq o'qimasdan hisoblaydi) qaytariladi.
    const [result] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          sessions: {
            $map: {
              input: '$chatSessions',
              as: 's',
              in: {
                _id: '$$s._id',
                title: '$$s.title',
                updatedAt: '$$s.updatedAt',
                messageCount: { $size: '$$s.messages' },
              },
            },
          },
        },
      },
    ]);
    if (!result) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const sessions = result.sessions
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((s) => ({ id: String(s._id), title: s.title, updatedAt: s.updatedAt, messageCount: s.messageCount }));

    return NextResponse.json({ sessions });
  } catch (err) {
    return serverError(err, 'ai/sessions');
  }
}

// Barcha suhbatlarni o'chirish (foydalanuvchi interfeysida ikki bosqichli tasdiq bilan himoyalangan).
export async function DELETE(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const result = await User.updateOne({ _id: userId }, { $set: { chatSessions: [] } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'ai/sessions');
  }
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    user.chatSessions.push({ title: 'Yangi suhbat', messages: [] });
    await user.save();
    const created = user.chatSessions[user.chatSessions.length - 1];

    return NextResponse.json({
      session: { id: String(created._id), title: created.title, updatedAt: created.updatedAt, messageCount: 0 },
    });
  } catch (err) {
    return serverError(err, 'ai/sessions');
  }
}
