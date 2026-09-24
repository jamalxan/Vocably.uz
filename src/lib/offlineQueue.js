// F (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 F — "internet uzilsa xabar local'da
// turadi, ulanganda yuboriladi... clientMessageId bilan idempotent") — offline xabar
// navbati uchun SOF (side-effect'siz) yordamchi funksiyalar. localStorage'ga
// yozish/o'qish, `fetch` va socket bilan bog'liq qism src/context/ChatContext.jsx'da
// qoladi (bu fayl u yerdan chaqiriladi) — bu yerda faqat testda tekshiriladigan,
// holatsiz mantiq: navbatga qo'shish/olib tashlash (dublikatsiz, `clientMessageId`
// bo'yicha) va xabarlar ro'yxati bilan tartibni saqlab birlashtirish.

// Navbatga `clientMessageId` bo'yicha DUBLIKATSIZ qo'shadi — bir xil xabar (masalan
// foydalanuvchi composer'da Enter'ni tez-tez bossa yoki "Qayta yuborish" ikkinchi marta
// bosilsa) ikki marta navbatga tushib qolmasin, C-16'dagi server-tarafdagi
// idempotentlik bilan bir xil kalitga tayanadi.
export function enqueueOffline(queue, item) {
  if (!item?.clientMessageId) return queue;
  if (queue.some((q) => q.clientMessageId === item.clientMessageId)) return queue;
  return [...queue, item];
}

// Muvaffaqiyatli (yoki chindan ham xato — "failed" — bo'lib navbatda qolishi
// ma'nosiz bo'lgan) yozuvni navbatdan olib tashlaydi.
export function dequeueOffline(queue, clientMessageId) {
  return queue.filter((q) => q.clientMessageId !== clientMessageId);
}

// Berilgan suhbat uchun hali navbatda turgan (serverga hali yetib bormagan) xabarlarni
// joriy xabarlar ro'yxatiga (server javobi yoki kesh) qo'shadi — sahifa qayta
// yuklanganda yoki suhbat almashtirilganda "yuborilmoqda" pufakchasi yo'qolib
// qolmasligi uchun. Navbatga qo'shilgan tartib saqlanadi, ro'yxatda ALLAQACHON bor
// (`clientMessageId` bo'yicha — masalan server javobi navbat bo'shatilishidan oldin
// keluvchi poll/socket orqali allaqachon yetib kelgan bo'lsa) yozuvlar qayta
// qo'shilmaydi (dublikat bo'lmasin).
export function mergeQueuedIntoMessages(messages, queue, conversationId) {
  const existingIds = new Set(messages.map((m) => m.clientMessageId).filter(Boolean));
  const pending = queue
    .filter((q) => String(q.conversationId) === String(conversationId) && !existingIds.has(q.clientMessageId))
    .map((q) => q.message)
    .filter(Boolean);
  return pending.length ? [...messages, ...pending] : messages;
}
