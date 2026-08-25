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
// ikkala tomon uchun ham `deletedFor`ga qo'shiladi (kim yozganidan qat'iy nazar).
// MUHIM: ataylab `deletedForEveryone` EMAS — o'sha bayroq GET /messages'da "Xabar
// o'chirildi" bo'sh pufakcha (tombstone) sifatida qaytariladi, ya'ni suhbat qayta
// ochilganda eski joylar bo'sh-o'chirilgan ko'rinishda qolib ketardi. Butun suhbatni
// tozalashda esa maqsad — chindan ham "yangidan boshlanish": eski xabarlar hech qanday
// iz qoldirmasdan butunlay yo'qolishi kerak (`deletedFor` GET so'rovda butunlay
// filtrlab tashlaydi, tombstone ko'rsatmaydi).
// Hujjatning o'zi (Conversation va Message'lar) hech qachon o'chirilmaydi — faqat
// yashiriladi/belgilanadi, shuning uchun keyinroq (qidiruv orqali qayta yozilsa yoki
// yangi xabar kelsa) hiddenFor'dan olib tashlanib, suhbat qaytadan ko'rinadi (admin
// panelda esa filtrlanmasdan, to'liq holda hamon ko'rinadi).
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
    const targets = forEveryone ? [user._id, otherId] : [user._id];

    await Message.updateMany(
      { conversationId: convo._id },
      { $addToSet: { deletedFor: { $each: targets } } }
    );

    const hidden = new Set((convo.hiddenFor || []).map((id) => String(id)));
    targets.forEach((id) => hidden.add(String(id)));
    convo.hiddenFor = Array.from(hidden);
    await convo.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id] DELETE');
  }
}
