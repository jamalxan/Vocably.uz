// XP Transaction Ledger (TZ §13) va analytics hodisalari (TZ §35).
import { User, XpEvent, VocabEvent } from '@/lib/models';
import { buildEvent } from '@/lib/vocab/events';

/**
 * Idempotent XP berish: bir xil `idempotencyKey` ikkinchi marta XP bermaydi.
 * Avval ledger yoziladi (unique indeks himoyalaydi), keyin User.xp $inc — shunday qilib
 * parallel/takroriy so'rovda ham XP ikki marta qo'shilmaydi.
 * @param {any} userId
 * @param {number} amount
 * @param {{reason?:string, sourceType?:string, sourceId?:string, idempotencyKey?:string, metadata?:any}} [opts]
 * @returns {Promise<{awarded:boolean, duplicate:boolean, amount:number, totalXp:number|null}>}
 */
export async function awardXpOnce(userId, amount, opts = {}) {
  const { reason, sourceType = '', sourceId = '', idempotencyKey, metadata } = opts;
  const value = Math.floor(Number(amount) || 0);
  if (value <= 0) return { awarded: false, duplicate: false, amount: 0, totalXp: null };
  if (!idempotencyKey) throw new Error('awardXpOnce: idempotencyKey majburiy');
  try {
    await XpEvent.create({ userId, amount: value, reason: reason || sourceType || 'other', sourceType, sourceId, idempotencyKey, metadata });
  } catch (err) {
    if (err && err.code === 11000) return { awarded: false, duplicate: true, amount: 0, totalXp: null };
    throw err;
  }
  const updated = await User.findByIdAndUpdate(userId, { $inc: { xp: value } }, { new: true, projection: { xp: 1 } }).lean();
  return { awarded: true, duplicate: false, amount: value, totalXp: updated?.xp ?? null };
}

/** Bugun (berilgan vaqtdan beri) o'yinlardan olingan XP — kunlik chegara uchun. */
export async function gameXpSince(userId, since) {
  const rows = await XpEvent.aggregate([
    { $match: { userId, sourceType: 'game', createdAt: { $gte: since } } },
    { $group: { _id: null, xp: { $sum: '$amount' } } },
  ]);
  return rows[0]?.xp || 0;
}

/** Best-effort: analytics xatosi asosiy oqimni hech qachon to'xtatmasin. */
export async function trackVocabEvents(userId, events) {
  try {
    const docs = (events || [])
      .map((e) => buildEvent(e))
      .filter(Boolean)
      .map((e) => ({ userId, ...e, createdAt: new Date() }));
    if (docs.length) await VocabEvent.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('[vocab] analytics yozishda xatolik', err?.message || err);
  }
}
