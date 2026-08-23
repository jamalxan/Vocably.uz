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

    const conversations = await Conversation.find({})
      .sort({ lastMessageAt: -1 })
      .limit(300)
      .lean();

    const userIds = [...new Set(conversations.flatMap((c) => c.participantIds.map(String)))];
    const users = await User.find({ _id: { $in: userIds } }).select('username name phone').lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));

    const result = conversations.map((c) => ({
      id: c._id,
      participants: c.participantIds.map((id) => byId.get(String(id)) || { username: null, name: '?' }),
      lastMessageAt: c.lastMessageAt,
      lastMessagePreview: c.lastMessagePreview || '',
    }));

    return NextResponse.json({ conversations: result });
  } catch (err) {
    return serverError(err, 'admin/chat/conversations GET');
  }
}
