// Offline takrorlash paketini (mijoz internet yo'qligida yig'gan javoblar) tekshiradi va tartiblaydi — sof funksiya (DB'siz, testlanadigan).
// Offline javoblar XP BERMAYDI (suiiste'mol yuzasi yo'q): faqat SRS holati va seriya yangilanadi. Vaqt belgisi (`clientTs`) cheklanadi:
// kelajakdagi rad etiladi, 48 soatdan eski rad etiladi — shu bilan seriyani "o'tmishga" yozib saqlab qolish mumkin emas.
export const MAX_OFFLINE_BATCH = 100;
export const MAX_OFFLINE_AGE_MS = 48 * 3600 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;
const OID_RE = /^[a-f0-9]{24}$/i;
const SEQ_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** @returns {{ items: object[], rejected: { clientSeq: string|null, reason: string }[] } | { error: string }} */
export function normalizeOfflineBatch(raw, now = new Date()) {
  if (!Array.isArray(raw) || raw.length === 0) return { error: "reviews bo'sh yoki massiv emas" };
  if (raw.length > MAX_OFFLINE_BATCH) return { error: `Bir paketda ko'pi bilan ${MAX_OFFLINE_BATCH} ta javob` };

  const nowMs = now.getTime();
  const items = [];
  const rejected = [];
  const seen = new Set();
  raw.forEach((r, order) => {
    const seq = typeof r?.clientSeq === 'string' ? r.clientSeq : null;
    const bad = (reason) => rejected.push({ clientSeq: seq, reason });
    if (!r || typeof r !== 'object') return bad('format');
    if (!seq || !SEQ_RE.test(seq)) return bad('clientSeq');
    if (seen.has(seq)) return bad('duplicate_in_batch');
    if (typeof r.categoryId !== 'string' || !OID_RE.test(r.categoryId) || typeof r.wordId !== 'string' || !OID_RE.test(r.wordId)) return bad('ids');
    if (typeof r.correct !== 'boolean') return bad('correct');
    const ts = Number(r.clientTs);
    if (!Number.isFinite(ts)) return bad('clientTs');
    if (ts > nowMs + FUTURE_SKEW_MS) return bad('future');
    if (ts < nowMs - MAX_OFFLINE_AGE_MS) return bad('too_old');
    seen.add(seq);
    const ms = Number(r.responseMs);
    items.push({
      clientSeq: seq,
      categoryId: r.categoryId,
      wordId: r.wordId,
      correct: r.correct,
      rating: [1, 2, 3, 4].includes(r.rating) ? r.rating : undefined,
      responseMs: Number.isFinite(ms) ? Math.max(0, Math.min(120_000, Math.round(ms))) : undefined,
      at: new Date(Math.min(ts, nowMs)),
      order,
    });
  });
  items.sort((a, b) => a.at.getTime() - b.at.getTime() || a.order - b.order);
  return { items, rejected };
}
