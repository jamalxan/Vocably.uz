import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { NextResponse } from 'next/server';

const MAX_NICKNAME_LEN = 60;

// Bu suhbatdagi boshqa foydalanuvchiga men (faqat men) uchun ko'rinadigan taxallus
// qo'yadi — boshqa tomon buni bilmaydi/ko'rmaydi (Conversation.nicknames — har bir
// tomon o'z kalitiga ega Map, src/lib/models.js). Bo'sh matn yuborilsa taxallus
// o'chiriladi va haqiqiy username'ga qaytadi.
export async function PATCH(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await Conversation.findById(params.id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    if (!convo.participantIds.some((id) => String(id) === String(user._id))) {
      return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    }

    const body = await req.json();
    const nickname = (body.nickname || '').trim().slice(0, MAX_NICKNAME_LEN);

    if (nickname) {
      convo.nicknames.set(String(user._id), nickname);
    } else {
      convo.nicknames.delete(String(user._id));
    }
    await convo.save();

    return NextResponse.json({ success: true, nickname });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/nickname PATCH');
  }
}
