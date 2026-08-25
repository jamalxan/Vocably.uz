import { Message } from './models';
import { pushMessagesRead } from './realtime';

// Suhbat sahifasi ochilganda/qayta yuklanganda (yoki jonli xabar kelganda) chaqiriladi:
// boshqa tomon yozgan va hali `readAt` belgilanmagan xabarlarni "o'qildi" deb belgilaydi,
// so'ng ASL yuboruvchiga (otherId) realtime orqali xabar beradi — shu tufayli uning
// ekranida bitta ptichka darhol ikkitaga aylanadi (Telegram uslubi). Bir marta
// belgilangan xabar hech qachon orqaga (o'qilmagan holatga) qaytmaydi — faqat
// `readAt: null` bo'lganlar yangilanadi.
//
// MUHIM: bu funksiya faqat oddiy foydalanuvchi chat endpointlaridan (GET/PATCH
// .../read) chaqiriladi — admin panelning suhbatni ko'rish endpointi (src/app/api/
// admin/chat/conversations/[id]/messages) buni umuman chaqirmaydi, shuning uchun
// admin bir suhbatni ochib ko'rsa ham foydalanuvchilarning o'qilgan/o'qilmagan
// holatiga hech qanday ta'sir qilmaydi.
export async function markConversationRead(conversationId, readerId, otherId) {
  const readAt = new Date();
  const result = await Message.updateMany(
    { conversationId, senderId: otherId, readAt: null },
    { $set: { readAt } }
  );
  if (result.modifiedCount > 0) {
    pushMessagesRead(otherId, String(conversationId), readAt);
  }
  return readAt;
}
