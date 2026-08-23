import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { normalizeRole } from '@/lib/chatRoles';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    // `chatSessions.$` — massivdan faqat SO'RALGAN sessiyani qaytaradi (foydalanuvchining
    // boshqa suhbatlarini, ularning xabarlari/rasmlarini o'qimasdan) — bir nechta uzun
    // suhbat + rasmli xabarlarga ega foydalanuvchida sezilarli farq qiladi.
    const user = await User.findOne({ _id: userId, 'chatSessions._id': params.id }, { 'chatSessions.$': 1 }).lean();
    const session = user?.chatSessions?.[0];
    if (!session) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    return NextResponse.json({
      session: {
        id: String(session._id),
        title: session.title,
        // Eski yozuvlarda roli 'function'/'assistant' bo'lishi mumkin — normallashtiramiz,
        // tanib bo'lmaganini esa ko'rsatmaymiz.
        messages: session.messages
          .map((m) => ({
            role: normalizeRole(m.role),
            parts: m.parts,
            imageUrl: m.imageUrl || null,
            imageUrls: m.imageUrls || [],
            timestamp: m.timestamp,
          }))
          .filter((m) => !!m.role),
      },
    });
  } catch (err) {
    return serverError(err, 'ai/sessions/[id]');
  }
}

export async function PATCH(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { title } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Nomi bo'sh bo'lmasin" }, { status: 400 });
    }

    const result = await User.updateOne(
      { _id: userId, 'chatSessions._id': params.id },
      { $set: { 'chatSessions.$.title': title.trim() } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'ai/sessions/[id]');
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const session = user.chatSessions.id(params.id);
    if (!session) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    user.chatSessions.pull(params.id);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'ai/sessions/[id]');
  }
}
