// AI chat kirishi va saqlanadigan tarix chegaralari. Sabab: chat sessiyalari `User` hujjati ichida (chatSessions[].messages[]), rasmlar
// esa base64 matn sifatida shu yerda — chegarasiz o'sish MongoDB 16 MB hujjat chegarasiga yetkazadi va shundan keyin foydalanuvchining
// HAR BIR `user.save()` chaqiruvi (so'z qo'shish, kategoriya, profil…) xato beradi — butun hisob ishlamay qoladi. (Uzoq muddatli
// yechim — rasmlarni ob'ekt omboriga ko'chirish; docs/AUDIT_FINDINGS.md B6.)

export const CHAT_LIMITS = {
  maxMessageChars: 8000,
  maxImagesPerMessage: 10,
  /** Bitta rasmning base64 data-URL uzunligi (~0.9 MB asl rasm). */
  maxImageChars: 1_250_000,
  /** Bir xabardagi barcha rasmlar jami. */
  maxImagesTotalChars: 4_000_000,
  /** Sessiyada saqlanadigan oxirgi xabarlar soni (AI konteksti ham shuncha bilan cheklangan: ~12 foydalanuvchi xabari). */
  maxMessagesPerSession: 80,
  /** Rasmlar faqat oxirgi shuncha xabarda saqlanadi (eskilaridan olib tashlanadi — hujjat hajmini asosan shu belgilaydi). */
  keepImagesInLastMessages: 6,
  maxSessions: 50,
};

const IMAGE_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * @param {unknown} message
 * @param {unknown} imagesBase64
 * @returns {{ ok: true, message: string, images: string[] } | { ok: false, error: string, status: number }}
 */
export function validateChatInput(message, imagesBase64) {
  if (message !== undefined && message !== null && typeof message !== 'string') return { ok: false, error: "Xabar matn bo'lishi kerak", status: 400 };
  const text = message || '';
  if (text.length > CHAT_LIMITS.maxMessageChars) {
    return { ok: false, error: `Xabar juda uzun (maks ${CHAT_LIMITS.maxMessageChars} belgi)`, status: 413 };
  }
  const raw = Array.isArray(imagesBase64) ? imagesBase64.slice(0, CHAT_LIMITS.maxImagesPerMessage) : [];
  let total = 0;
  const images = [];
  for (const img of raw) {
    if (typeof img !== 'string' || !IMAGE_DATA_URL_RE.test(img)) return { ok: false, error: "Rasm formati noto'g'ri (PNG, JPEG, WEBP yoki GIF)", status: 415 };
    if (img.length > CHAT_LIMITS.maxImageChars) return { ok: false, error: "Rasm juda katta (maks ~900 KB)", status: 413 };
    total += img.length;
    if (total > CHAT_LIMITS.maxImagesTotalChars) return { ok: false, error: 'Rasmlar jami hajmi juda katta', status: 413 };
    images.push(img);
  }
  return { ok: true, message: text, images };
}

/** Sessiya tarixini chegaralaydi: eng eski xabarlar tashlanadi, eski xabarlardagi rasmlar olib tashlanadi. Mongoose massiviga ham, oddiy massivga ham ishlaydi. */
export function trimSessionHistory(session, limits = CHAT_LIMITS) {
  const msgs = session.messages;
  const excess = msgs.length - limits.maxMessagesPerSession;
  if (excess > 0) msgs.splice(0, excess);
  const imageCutoff = msgs.length - limits.keepImagesInLastMessages;
  for (let i = 0; i < imageCutoff; i++) {
    const m = msgs[i];
    if (m.imageUrls?.length || m.imageUrl) {
      m.imageUrls = [];
      m.imageUrl = null;
    }
  }
}

/** Yangi sessiya qo'shishdan oldin eng eski sessiyalarni olib tashlaydi (`maxSessions - 1` ta qoladi). */
export function pruneOldSessions(user, limits = CHAT_LIMITS) {
  const sessions = user.chatSessions;
  const excess = sessions.length - (limits.maxSessions - 1);
  if (excess <= 0) return 0;
  const byAge = sessions
    .map((s, i) => ({ i, t: new Date(s.updatedAt || s.createdAt || 0).getTime() }))
    .sort((a, b) => a.t - b.t)
    .slice(0, excess)
    .map((x) => x.i)
    .sort((a, b) => b - a);
  for (const i of byAge) sessions.splice(i, 1);
  return excess;
}
