// Xabar Mongo'ga yozilgandan keyin realtime-server'ga ichki push yuboradi, u esa
// qabul qiluvchining ochiq socket'iga real-vaqtda yetkazadi. Bu xizmat ixtiyoriy —
// REALTIME_INTERNAL_URL sozlanmagan yoki server javob bermasa, faqat log qilinadi;
// chat REST orqali (suhbatni qayta yuklash) baribir to'liq ishlaydi (docs/ chat
// plani, "Arxitektura qarorlari" §2 — graceful degradation).
// `recipientId` — xabarni ko'rishi kerak bo'lgan foydalanuvchi. realtime-server
// bu userId asosidagi shaxsiy socket "xona"siga (`user:{id}`) push qiladi — shu
// tufayli server suhbat a'zoligini bilishi shart emas, faqat kimga yuborishni biladi.
export async function pushNewMessage(recipientId, conversationId, message) {
  const url = process.env.REALTIME_INTERNAL_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;
  if (!url || !secret) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${url.replace(/\/$/, '')}/internal/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': secret },
      body: JSON.stringify({ recipientId: String(recipientId), conversationId, message }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error('[realtime] push yuborilmadi', err?.message || err);
  }
}

// Xabar(lar) o'qilgan deb belgilangandan keyin ASL yuboruvchiga chaqiriladi — uning
// ochiq socket'iga real-vaqtda "o'qildi" hodisasini yetkazadi (bitta ptichka -> ikkita).
// pushNewMessage kabi ixtiyoriy: xizmat o'chiq bo'lsa jimgina o'tkazib yuboriladi,
// keyingi safar suhbat qayta yuklanganda (`readAt` allaqachon Mongo'da) baribir to'g'ri ko'rinadi.
export async function pushMessagesRead(userId, conversationId, readAt) {
  const url = process.env.REALTIME_INTERNAL_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;
  if (!url || !secret) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${url.replace(/\/$/, '')}/internal/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': secret },
      body: JSON.stringify({ userId: String(userId), conversationId, readAt }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error('[realtime] read push yuborilmadi', err?.message || err);
  }
}

// C-11 — xabar tahrirlangandan keyin BOSHQA tomonning ochiq socket'iga real-vaqtda
// yetkazadi (o'zi tahrirlagan kishi buni allaqachon o'zining optimistik UI
// yangilanishidan ko'radi — shuning uchun faqat qabul qiluvchiga yuboriladi,
// pushNewMessage bilan bir xil naqsh).
export async function pushMessageEdited(recipientId, conversationId, message) {
  const url = process.env.REALTIME_INTERNAL_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;
  if (!url || !secret) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${url.replace(/\/$/, '')}/internal/emit-edited`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': secret },
      body: JSON.stringify({ recipientId: String(recipientId), conversationId, message }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error('[realtime] tahrirlash push yuborilmadi', err?.message || err);
  }
}

// C-11 — xabar o'chirilgandan keyin (faqat `forEveryone` — ikkala tomonga tegishli
// bo'lganda, oddiy "faqat men uchun" o'chirish boshqa tomonga hech qanday ta'sir
// qilmaydi va bu yerga umuman chaqirilmaydi) BOSHQA tomonga real-vaqtda yetkazadi.
// `silently: true` bo'lsa (admin o'z xabarini o'chirgan) — client xabarni ro'yxatdan
// butunlay olib tashlaydi, aks holda "xabar o'chirildi" tombstone'iga aylantiradi.
export async function pushMessageDeleted(recipientId, conversationId, messageId, silently) {
  const url = process.env.REALTIME_INTERNAL_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;
  if (!url || !secret) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${url.replace(/\/$/, '')}/internal/emit-deleted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': secret },
      body: JSON.stringify({ recipientId: String(recipientId), conversationId, messageId: String(messageId), silently: !!silently }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error('[realtime] o\'chirish push yuborilmadi', err?.message || err);
  }
}

export async function isUserOnline(userId) {
  const url = process.env.REALTIME_INTERNAL_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;
  if (!url || !secret) return null; // noma'lum — client bu holatni "offline" deb ko'rsatmasligi kerak

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url.replace(/\/$/, '')}/internal/presence/${userId}`, {
      headers: { 'X-Internal-Secret': secret },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return !!data.online;
  } catch {
    return null;
  }
}
