import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, User } from '@/lib/models';
import { NextResponse } from 'next/server';

// Admin nazorati uchun barcha suhbatlar ro'yxati. Bu route hujjatlarni
// o'qiydi, lekin xabar matnini o'zini emas — xabarlarni ko'rish alohida
// endpoint (chat/conversations/[id]/messages) orqali, har bir marta
// audit-log yozib amalga oshadi.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const before = req.nextUrl.searchParams.get('before');
    const query = before ? { lastMessageAt: { $lt: new Date(before) } } : {};
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = conversations.length > limit;
    const page = hasMore ? conversations.slice(0, limit) : conversations;
    const nextCursor = hasMore ? page[page.length - 1].lastMessageAt : null;

    const userIds = [...new Set(page.flatMap((c) => c.participantIds.map(String)))];
    const users = await User.find({ _id: { $in: userIds } }).select('username name phone').lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));

    const result = page.map((c) => {
      // `nicknames` — har bir ishtirokchi IKKINCHI tomonga qo'ygan taxallus, o'z
      // ID'si kaliti bilan (src/lib/models.js, PATCH .../nickname). Ya'ni "p0 ismini
      // qanday saqlagan" javobi nicknames[p1] (p1 bergan taxallus), va aksincha.
      const nicks = c.nicknames || {};
      const [id0, id1] = c.participantIds;
      const participants = c.participantIds.map((id, i) => ({
        ...(byId.get(String(id)) || { username: null, name: '?' }),
        // Boshqa ishtirokchi buni qanday nom bilan saqlagani (bo'sh bo'lsa — taxallus qo'yilmagan).
        savedAsByOther: nicks[String(i === 0 ? id1 : id0)] || null,
      }));
      return {
        id: c._id,
        participants,
        lastMessageAt: c.lastMessageAt,
        lastMessagePreview: c.lastMessagePreview || '',
        // Kim shu suhbatni o'z "Do'stlar" ro'yxatidan o'chirgan (docs/ src/app/api/chat/
        // conversations/[id] DELETE) — hujjatning o'zi hech qachon o'chmaydi, admin
        // barchasini har doim ko'ra oladi, faqat shaffoflik uchun shu ro'yxat ko'rsatiladi.
        hiddenFor: (c.hiddenFor || []).map((id) => byId.get(String(id))?.username).filter(Boolean),
      };
    });

    return NextResponse.json({ conversations: result, nextCursor });
  } catch (err) {
    return serverError(err, 'admin/chat/conversations GET');
  }
}
