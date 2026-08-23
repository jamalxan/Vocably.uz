import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

// Foydalanuvchi shikoyat qilganda yoki nazorat uchun admin bitta suhbatning
// to'liq xabar tarixini ko'radi. Bu — jiddiy maxfiylik chegarasi, shuning uchun
// har bir ko'rish AdminAuditLog'ga yoziladi ("kim, qachon, qaysi suhbatni ko'rdi").
export async function GET(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await Conversation.findById(params.id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const messages = await Message.find({ conversationId: convo._id }).sort({ createdAt: 1 }).lean();

    await writeAuditLog(req, admin._id, 'chat.conversation.view', 'Conversation', convo._id, {
      messageCount: messages.length,
    });

    return NextResponse.json({ messages });
  } catch (err) {
    return serverError(err, 'admin/chat/conversations/[id]/messages');
  }
}
