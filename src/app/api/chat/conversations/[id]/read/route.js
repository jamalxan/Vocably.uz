import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { markConversationRead } from '@/lib/chatRead';
import { NextResponse } from 'next/server';

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

// GET /messages allaqachon suhbat ochilganda/qayta yuklanganda o'qilgan deb belgilaydi
// (src/lib/chatRead.js) — bu endpoint faqat socket ulangan holda (poll o'chiq bo'lganda,
// src/context/ChatContext.jsx) suhbat OCHIQ turgan paytda jonli xabar kelganini shu
// zahoti "o'qildi" deb belgilash uchun, to'liq GET so'rovini qaytadan yubormasdan.
export async function PATCH(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
    const readAt = otherId ? await markConversationRead(convo._id, user._id, otherId) : new Date();

    return NextResponse.json({ success: true, readAt });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/read PATCH');
  }
}
