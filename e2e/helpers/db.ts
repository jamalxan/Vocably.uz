// E2E bazasiga to'g'ridan-to'g'ri murojaat (chat-media.spec.ts'dagi withDb andozasi): holatni
// tozalash va server yozgan natijani (qo'ng'iroq yozuvlari, qoralamalar, forward nusxalari) tekshirish.
import mongoose from 'mongoose';

export async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

export const oid = (id: string) => new mongoose.Types.ObjectId(id);

/** Telefon raqamlari bo'yicha foydalanuvchi _id'lari (global-setup har yugurishda qayta yaratadi). */
export async function userIds(...phones: string[]): Promise<mongoose.Types.ObjectId[]> {
  return withDb(async (db) => {
    const docs = await db.collection('users').find({ phone: { $in: phones } }).toArray();
    return phones.map((p) => {
      const d = docs.find((x) => x.phone === p);
      if (!d) throw new Error(`E2E user ${p} topilmadi (global-setup)`);
      return d._id as mongoose.Types.ObjectId;
    });
  });
}

/**
 * Ketma-ket testlar bir-birining holatiga bog'lanmasin: suhbatlarni ko'rinadigan/ovozli qiladi,
 * bloklarni va (ixtiyoriy) qo'ng'iroq yozuvlarini o'chiradi, tezlik cheklovlarini (call-invite 10/min,
 * socket-ticket, xabar yuborish va h.k. — RateLimitHit) shu foydalanuvchilar uchun tiklaydi.
 */
export async function resetChatState(phones: string[], conversationIds: string[], { dropCalls = false } = {}) {
  await withDb(async (db) => {
    const users = await db.collection('users').find({ phone: { $in: phones } }).toArray();
    const ids = users.map((u) => u._id);
    const convIds = conversationIds.map(oid);
    await db.collection('conversations').updateMany(
      { _id: { $in: convIds } },
      { $set: { archivedBy: [], pinnedBy: [], hiddenFor: [], mutedBy: [], mutedUntil: {} } }
    );
    await db.collection('blocks').deleteMany({ $or: [{ blockerId: { $in: ids } }, { blockedId: { $in: ids } }] });
    if (ids.length) await db.collection('ratelimithits').deleteMany({ key: { $regex: `^(${ids.map(String).join('|')}):` } });
    if (dropCalls) await db.collection('messages').deleteMany({ conversationId: { $in: convIds }, type: 'call' });
  });
}

/** Suhbatdagi barcha kiruvchi xabarlarni o'qilgan qiladi (o'qilmaganlar hisoblagichi 0 dan boshlansin). */
export async function markAllRead(conversationIds: string[]) {
  await withDb((db) => db.collection('messages').updateMany({ conversationId: { $in: conversationIds.map(oid) }, readAt: null }, { $set: { readAt: new Date() } }));
}

export type CallRow = {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  readAt: Date | null;
  call: { callId: string; kind: 'audio' | 'video'; outcome: string; durationSec: number | null };
};

/** `since` dan keyin shu suhbatga yozilgan eng oxirgi qo'ng'iroq yozuvi (yoki null). */
export async function latestCallRow(conversationId: string, since: Date): Promise<CallRow | null> {
  return withDb(async (db) => {
    const rows = await db
      .collection('messages')
      .find({ conversationId: oid(conversationId), type: 'call', 'call.endedAt': { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    return (rows[0] as unknown as CallRow) || null;
  });
}

export async function conversationDoc(conversationId: string) {
  return withDb((db) => db.collection('conversations').findOne({ _id: oid(conversationId) }));
}
