// Forward (Telegram parity, PARITY_PLAN WP5): xabarni boshqa suhbat(lar)ga nusxalash.
// Bitta xabarni yuborish (messages POST `forwardOf`) va ko'p chatga paketli yuborish
// (POST /api/chat/messages/forward) shu yerdagi bir xil qoidalardan foydalanadi:
// asl muallif saqlanadi (forward'ning forward'i ham birinchi muallifni ko'rsatadi), media bucket
// ichida server tomonda nusxalanadi, albom har bir nishonda yangi albumId bilan birga qoladi.
// Sof qismlar (id sxemasi, albom qayta guruhlash, forwardedFrom) forward.test.js'da tekshiriladi.

export const FORWARD_MAX_MESSAGES = 50;
export const FORWARD_MAX_TARGETS = 10;
// messageIds x targetIds ko'paytmasi (rejadagi "100 ta nusxa" chegarasi) — bitta so'rov
// serverda 100 tadan ortiq hujjat va media nusxasini yaratmasin.
export const FORWARD_MAX_COPIES = 100;
export const FORWARD_MEDIA_TYPES = ['image', 'video', 'voice', 'file'];
const OBJECT_ID = /^[a-f0-9]{24}$/i;

export const isObjectIdString = (v) => typeof v === 'string' && OBJECT_ID.test(v);

/** Takroriy so'rov (bir xil clientBatchId) dublikat yaratmasligi uchun barqaror id. */
export function forwardClientMessageId(clientBatchId, sourceId, targetId) {
  return `${clientBatchId}:${sourceId}:${targetId}`.slice(0, 100);
}

/** Paket id: klient yuborgan UUID (tozalangan) yoki yangi id. */
export function cleanBatchId(raw, fallback = () => globalThis.crypto.randomUUID()) {
  const s = String(raw ?? '').trim();
  return /^[A-Za-z0-9_-]{8,40}$/.test(s) ? s : fallback();
}

/**
 * Body validatsiyasi: { sourceConversationId, messageIds[], targetConversationIds[], hideAuthor, comment }.
 * Xato bo'lsa { error, code }, aks holda tozalangan qiymatlar (takrorlar olib tashlangan, tartib saqlangan).
 */
export function validateForwardBody(body, { maxCommentLen = 4000 } = {}) {
  const b = body && typeof body === 'object' ? body : {};
  const uniq = (arr) => [...new Set(arr.map(String))];
  if (!isObjectIdString(String(b.sourceConversationId || ''))) return { error: "Noto'g'ri so'rov", code: 'bad_request' };
  if (!Array.isArray(b.messageIds) || !Array.isArray(b.targetConversationIds)) return { error: "Noto'g'ri so'rov", code: 'bad_request' };
  const messageIds = uniq(b.messageIds);
  const targetIds = uniq(b.targetConversationIds);
  if (!messageIds.length || !targetIds.length) return { error: "Noto'g'ri so'rov", code: 'bad_request' };
  if (!messageIds.every(isObjectIdString) || !targetIds.every(isObjectIdString)) return { error: "Noto'g'ri so'rov", code: 'bad_request' };
  if (messageIds.length > FORWARD_MAX_MESSAGES || targetIds.length > FORWARD_MAX_TARGETS || messageIds.length * targetIds.length > FORWARD_MAX_COPIES) {
    return { error: "Juda ko'p xabar tanlandi", code: 'too_many' };
  }
  const comment = typeof b.comment === 'string' ? b.comment.trim() : '';
  if (comment.length > maxCommentLen) return { error: 'Xabar juda uzun', code: 'bad_request' };
  return {
    sourceConversationId: String(b.sourceConversationId),
    messageIds,
    targetIds,
    hideAuthor: b.hideAuthor === true,
    comment,
  };
}

/** Manba xabarlar suhbatdagi tartibda (createdAt, keyin _id) — tanlash tartibidan qat'iy nazar. */
export function sortSources(list) {
  return [...(list || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id)));
}

/**
 * Manba xabarlarni ajratadi: yuboriladiganlar va o'tkazib yuboriladiganlar
 * (`call` — qo'ng'iroq yozuvi xabar emas; `not_found` — yo'q, menga o'chirilgan yoki hamma uchun o'chirilgan).
 */
export function partitionSources(requestedIds, found, userId) {
  const byId = new Map((found || []).map((m) => [String(m._id), m]));
  const usable = [];
  const skipped = [];
  for (const id of requestedIds) {
    const m = byId.get(String(id));
    const gone =
      !m || m.deletedForEveryone || m.deletedForEveryoneSilently || (m.deletedFor || []).some((d) => String(d) === String(userId));
    if (gone) skipped.push({ id: String(id), reason: 'not_found' });
    else if (m.type === 'call') skipped.push({ id: String(id), reason: 'call' });
    else usable.push(m);
  }
  return { usable: sortSources(usable), skipped };
}

/**
 * "… dan yuborilgan" yorlig'i: forward'ning forward'i birinchi muallifni saqlaydi.
 * `authorsById` — Map(userId -> { _id, name, username }); `hidden` — "yuboruvchi nomini yashirish".
 */
/** Tashqariga (API/socket) beriladigan forwardedFrom: muallif yashirilgan bo'lsa faqat `{ hidden: true }`. */
export function publicForwardedFrom(ff) {
  if (!ff) return null;
  if (ff.hidden) return { hidden: true };
  const { userId, name, messageId } = ff;
  return { userId: userId ?? null, name: name ?? null, ...(messageId ? { messageId } : {}), hidden: false };
}

export function forwardedFromFor(original, authorsById, hideAuthor = false) {
  const prev = original.forwardedFrom || null;
  const authorId = prev?.userId || original.senderId;
  const author = authorsById?.get?.(String(authorId)) || null;
  const name = (prev?.name || author?.name || (author?.username ? `@${author.username}` : '') || '').slice(0, 80);
  return {
    userId: author?._id || authorId,
    name,
    messageId: prev?.messageId || original._id,
    hidden: hideAuthor === true || prev?.hidden === true,
  };
}

/** Albomlar har bir nishonda yangi id oladi (bir xil manba albomi — bir xil yangi id). */
export function albumIdMapper(makeId = () => globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 24)) {
  const map = new Map();
  return (oldId) => {
    if (!oldId) return null;
    if (!map.has(oldId)) map.set(oldId, makeId());
    return map.get(oldId);
  };
}

/**
 * Bitta nishon uchun nusxa hujjatlari (media kaliti hali nusxalanmagan — `copyFrom` belgilanadi).
 * createdAt ketma-ket millisekundlar bilan beriladi, shunda insertMany'dan keyin ham tartib aniq.
 */
export function planForwardCopies({ sources, targetConversationId, senderId, authorsById, hideAuthor = false, clientBatchId, now = new Date(), newAlbumId = albumIdMapper() }) {
  const base = new Date(now).getTime();
  return sortSources(sources).map((original, i) => {
    const doc = {
      conversationId: targetConversationId,
      senderId,
      type: original.type,
      text: original.text || '',
      forwardedFrom: forwardedFromFor(original, authorsById, hideAuthor),
      albumId: ['image', 'video'].includes(original.type) ? newAlbumId(original.albumId || null) : null,
      clientMessageId: clientBatchId ? forwardClientMessageId(clientBatchId, String(original._id), String(targetConversationId)) : null,
      createdAt: new Date(base + i),
    };
    if (original.type === 'sticker') doc.stickerId = original.stickerId;
    if (FORWARD_MEDIA_TYPES.includes(original.type) && original.media?.key) {
      doc.media = { ...original.media };
      doc.copyFrom = original.media.key;
    }
    return doc;
  });
}

/**
 * Media'ni nishon suhbat papkasiga nusxalaydi (bucket ichida, brauzer yuklab olmaydi).
 * `copy(src, dst)` va `keyFor(convId, type, mime)` — s3.js'dan (testda soxta).
 * Xato bo'lsa { error }, aks holda { docs } (copyFrom olib tashlangan).
 */
export async function materializeCopies(planned, { copy, keyFor }) {
  const docs = [];
  for (const p of planned) {
    const { copyFrom, ...doc } = p;
    if (copyFrom) {
      const dstKey = keyFor(String(doc.conversationId), doc.type, doc.media.mimeType || 'application/octet-stream');
      try {
        await copy(copyFrom, dstKey);
      } catch (err) {
        console.error('[chat] forward copy failed', err?.message);
        return { error: "Faylni yuborib bo'lmadi" };
      }
      doc.media = { ...doc.media, key: dstKey };
    }
    docs.push(doc);
  }
  return { docs };
}
