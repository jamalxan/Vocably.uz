import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { NextResponse } from 'next/server';

// Faqat so'rovchi userga tegishli — boshqa tomon buni bilmaydi. Shu suhbatga yangi
// xabar kelganda so'rovchiga Telegram bot orqali xabar borishini yoqadi (POST) yoki
// o'chiradi (DELETE). Bu tanlov admin userga bergan umumiy sozlamadan
// (User.tgMessageNotify) ustun turadi — admin "hammasi uchun" yoqib qo'ygan bo'lsa ham
// user alohida suhbatni o'chira oladi va aksincha (src/lib/chatConstants.js#isTgMessageNotifyOn).
// Haqiqiy yuborish: src/app/api/chat/conversations/[id]/messages POST.
async function setTgMessageNotify(req, params, enabled) {
  const { error, status, user } = await requireChatUser(req);
  if (error) return NextResponse.json({ error }, { status });

  await connectToDatabase();

  const convo = await Conversation.findOne({ _id: params.id, participantIds: user._id }).select('_id').lean();
  if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

  // Botga hech qachon ulanmagan user (telegramChatId yo'q) uchun yoqishning ma'nosi
  // yo'q — xabar baribir yetib bormaydi, shuning uchun aniq xato qaytaramiz.
  if (enabled && !user.telegramChatId) {
    return NextResponse.json(
      { error: "Telegram bot hisobingizga ulanmagan — bildirishnoma yuborib bo'lmaydi" },
      { status: 400 }
    );
  }

  await Conversation.updateOne(
    { _id: convo._id },
    enabled
      ? { $addToSet: { tgMessageNotifyOn: user._id }, $pull: { tgMessageNotifyOff: user._id } }
      : { $addToSet: { tgMessageNotifyOff: user._id }, $pull: { tgMessageNotifyOn: user._id } }
  );

  return NextResponse.json({ success: true, tgMessageNotify: enabled });
}

export async function POST(req, { params }) {
  try {
    return await setTgMessageNotify(req, params, true);
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/message-notify POST');
  }
}

export async function DELETE(req, { params }) {
  try {
    return await setTgMessageNotify(req, params, false);
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/message-notify DELETE');
  }
}
