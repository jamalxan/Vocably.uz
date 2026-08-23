import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, Block } from '@/lib/models';
import { NextResponse } from 'next/server';

// Username orqali aniq qidiruv (Telegram uslubidagi "@username orqali topish").
// Faqat chatAccess=true bo'lgan userlar ko'rinadi — boshqa hamma app-foydalanuvchisi
// bu qidiruvda umuman ko'rinmasligi kerak (bo'lim yashirinligi shu bilan ta'minlanadi).
export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    if (!(await checkRateLimit(user._id, 'chat-search', 30))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }

    const q = (req.nextUrl.searchParams.get('username') || '').trim().toLowerCase();
    if (!q) return NextResponse.json({ error: 'username kerak' }, { status: 400 });

    const found = await User.findOne({
      username: q,
      chatAccess: true,
      chatBanned: { $ne: true },
    })
      .select('username name')
      .lean();

    if (!found || String(found._id) === String(user._id)) {
      return NextResponse.json({ result: null });
    }

    const blocked = await Block.findOne({
      $or: [
        { blockerId: user._id, blockedId: found._id },
        { blockerId: found._id, blockedId: user._id },
      ],
    }).lean();
    if (blocked) return NextResponse.json({ result: null });

    return NextResponse.json({ result: { id: found._id, username: found.username, name: found.name || '' } });
  } catch (err) {
    return serverError(err, 'chat/search');
  }
}
