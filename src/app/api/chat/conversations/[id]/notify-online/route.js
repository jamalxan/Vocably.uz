import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { NextResponse } from 'next/server';

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

// Faqat so'rovchi userga tegishli — boshqa tomon buni bilmaydi. Yoqilsa, shu
// suhbatning ikkinchi tomoni keyingi safar onlaynga o'tganda so'rovchiga
// Telegram bot orqali "onlayn bo'ldi" xabari boradi (realtime-server ->
// src/app/api/internal/presence-online).
export async function POST(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    if (!convo.onlineNotifyBy.some((id) => String(id) === String(user._id))) {
      convo.onlineNotifyBy.push(user._id);
      await convo.save();
    }

    return NextResponse.json({ success: true, notifyOnline: true });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/notify-online POST');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    convo.onlineNotifyBy = convo.onlineNotifyBy.filter((id) => String(id) !== String(user._id));
    await convo.save();

    return NextResponse.json({ success: true, notifyOnline: false });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/notify-online DELETE');
  }
}
