import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

const MAX_TEXT_LEN = 4000;

async function loadOwnMessage(conversationId, messageId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.participantIds.some((id) => String(id) === String(userId))) return {};

  const message = await Message.findOne({ _id: messageId, conversationId: convo._id });
  return { convo, message };
}

// Faqat o'zining matnli xabarini tahrirlaydi. `originalText` faqat BIRINCHI tahrirda
// yoziladi — shu tufayli admin panel qancha marta qayta tahrirlansa ham asl matnni
// ko'ra oladi (Telegram foydalanuvchi tarafida ko'rsatmaydi, faqat "tahrirlangan" belgisi).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { convo, message } = await loadOwnMessage(params.id, params.messageId, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    if (!message) return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });
    if (String(message.senderId) !== String(user._id)) {
      return NextResponse.json({ error: "Faqat o'z xabaringizni tahrirlay olasiz" }, { status: 403 });
    }
    if (message.type !== 'text') return NextResponse.json({ error: "Bu turdagi xabarni tahrirlab bo'lmaydi" }, { status: 400 });
    if (message.deletedForEveryone) return NextResponse.json({ error: "O'chirilgan xabarni tahrirlab bo'lmaydi" }, { status: 400 });

    const { text } = await req.json();
    const cleanText = (text || '').trim();
    if (!cleanText) return NextResponse.json({ error: "Bo'sh xabar bo'lishi mumkin emas" }, { status: 400 });
    if (cleanText.length > MAX_TEXT_LEN) return NextResponse.json({ error: 'Xabar juda uzun' }, { status: 400 });
    if (cleanText === message.text) return NextResponse.json({ message });

    if (!message.edited) message.originalText = message.text;
    message.text = cleanText;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Suhbat ro'yxatidagi oxirgi xabar shu bo'lsa, preview'ni ham yangilaymiz.
    if (convo.lastMessagePreview && String(convo._id) && message.type === 'text') {
      const latest = await Message.findOne({ conversationId: convo._id }).sort({ createdAt: -1 }).select('_id');
      if (latest && String(latest._id) === String(message._id)) {
        convo.lastMessagePreview = cleanText.slice(0, 80);
        await convo.save();
      }
    }

    return NextResponse.json({ message });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId] PATCH');
  }
}

// `forEveryone: true` — faqat xabar egasi tanlashi mumkin, ikkala tomondan ham
// yashiradi (hujjat o'chirilmaydi, `deletedForEveryone` bilan belgilanadi). Aks holda
// (yoki forEveryone berilmasa) — faqat so'rovchi uchun (`deletedFor`ga qo'shiladi),
// boshqa tomon xabarni odatdagidek ko'raveradi.
export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { convo, message } = await loadOwnMessage(params.id, params.messageId, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    if (!message) return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const forEveryone = !!body.forEveryone;
    const isMine = String(message.senderId) === String(user._id);

    if (forEveryone) {
      if (!isMine) return NextResponse.json({ error: "Faqat o'z xabaringizni ikkala tomondan ham o'chira olasiz" }, { status: 403 });
      message.deletedForEveryone = true;
    } else if (!message.deletedFor.some((id) => String(id) === String(user._id))) {
      message.deletedFor.push(user._id);
    }
    await message.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId] DELETE');
  }
}
