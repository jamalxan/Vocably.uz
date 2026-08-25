import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

// Do'stlar ro'yxatidan suhbatni o'chirish — Telegram uslubida ikki bosqichli:
// `forEveryone: false` (sukut) — faqat so'rovchining ro'yxatidan yashiriladi
// (hiddenFor) va uning barcha mavjud xabarlari unga ko'rinmay qoladi (deletedFor,
// xuddi bitta xabarni "faqat men uchun" o'chirishdagi kabi — src/app/api/chat/
// conversations/[id]/messages/[messageId]). Boshqa tomon hech narsani sezmaydi,
// o'z ro'yxatida va tarixida hammasi odatdagidek qoladi.
// `forEveryone: true` — ikkala tomon ro'yxatidan ham yashiriladi va BARCHA xabarlar
// (kim yozganidan qat'iy nazar) deletedForEveryone bo'ladi — bu alohida xabarni
// o'chirishdagi "faqat o'z xabaringizni" cheklovidan farqli, chunki bu butun suhbatni
// ikkala tomon roziligisiz emas, aynan shu userning ochiq tanlovi bilan tozalaydi.
// Hujjatning o'zi (Conversation va Message'lar) hech qachon o'chirilmaydi — faqat
// yashiriladi/belgilanadi, shuning uchun keyinroq (qidiruv orqali qayta yozilsa yoki
// yangi xabar kelsa) hiddenFor'dan olib tashlanib, suhbat qaytadan ko'rinadi.
export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const forEveryone = !!body.forEveryone;
    const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));

    if (forEveryone) {
      await Message.updateMany({ conversationId: convo._id }, { $set: { deletedForEveryone: true } });
      const hidden = new Set((convo.hiddenFor || []).map((id) => String(id)));
      hidden.add(String(user._id));
      hidden.add(String(otherId));
      convo.hiddenFor = Array.from(hidden);
    } else {
      await Message.updateMany(
        { conversationId: convo._id, deletedFor: { $ne: user._id } },
        { $push: { deletedFor: user._id } }
      );
      if (!(convo.hiddenFor || []).some((id) => String(id) === String(user._id))) {
        convo.hiddenFor = [...(convo.hiddenFor || []), user._id];
      }
    }
    await convo.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id] DELETE');
  }
}
