import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

// C-10 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 C) — "Pin" katta,
// tanlash mumkin bo'lgan TZ "5 tagacha" chegarasi (Conversation.pinnedMessageIds,
// src/lib/models.js). Ikkala ishtirokchi uchun ham UMUMIY: kim qadagan bo'lishidan
// qat'iy nazar, ikkalasi ham ko'radi/yecha oladi (mute/nickname kabi faqat-o'zimga
// tegishli emas).
const MAX_PINNED = 5;

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

export async function POST(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const message = await Message.findOne({ _id: params.messageId, conversationId: convo._id }).lean();
    if (!message || message.deletedForEveryone) {
      return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });
    }

    const already = (convo.pinnedMessageIds || []).some((id) => String(id) === String(params.messageId));
    if (!already) {
      if ((convo.pinnedMessageIds || []).length >= MAX_PINNED) {
        return NextResponse.json({ error: `Ko'pi bilan ${MAX_PINNED} ta xabar qadash mumkin` }, { status: 400 });
      }
      convo.pinnedMessageIds = [...(convo.pinnedMessageIds || []), message._id];
      await convo.save();
    }

    return NextResponse.json({ success: true, pinnedMessageIds: (convo.pinnedMessageIds || []).map(String) });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId]/pin POST');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    convo.pinnedMessageIds = (convo.pinnedMessageIds || []).filter((id) => String(id) !== String(params.messageId));
    await convo.save();

    return NextResponse.json({ success: true, pinnedMessageIds: (convo.pinnedMessageIds || []).map(String) });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId]/pin DELETE');
  }
}
