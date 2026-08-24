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

// Faqat so'rovchi userga tegishli — boshqa tomon bu holatni ko'rmaydi va undan
// hech qanday bildirishnoma/belgi olmaydi (jimgina bildirishnomani o'chirish).
export async function POST(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    if (!convo.mutedBy.some((id) => String(id) === String(user._id))) {
      convo.mutedBy.push(user._id);
      await convo.save();
    }

    return NextResponse.json({ success: true, muted: true });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/mute POST');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    convo.mutedBy = convo.mutedBy.filter((id) => String(id) !== String(user._id));
    await convo.save();

    return NextResponse.json({ success: true, muted: false });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/mute DELETE');
  }
}
