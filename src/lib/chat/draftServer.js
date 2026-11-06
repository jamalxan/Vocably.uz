import { Message } from '@/lib/models';
import { DRAFT_MAX_CHARS } from '@/lib/chat/drafts';

// Server qoralamalari (PARITY_PLAN WP6): Conversation.drafts[userId] -> API shakli.
// `replyTo` bazada faqat id; klientga Composer'ning javob paneli uchun kichik "surat" beriladi
// ({ id, senderId, type, text, mediaKey }) — xabar o'chirilgan/ko'rinmas bo'lsa null.

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** Mongoose Map yoki .lean() obyektidan shu userning xom qoralamasi (yoki null). */
export function rawDraftOf(convo, userId) {
  const key = String(userId);
  const d = convo?.drafts?.get ? convo.drafts.get(key) : convo?.drafts?.[key];
  return d && d.updatedAt ? d : null;
}

/** Klientdan kelgan PUT body: { text, replyTo, deviceId }. */
export function cleanDraftInput(body) {
  const b = body && typeof body === 'object' ? body : {};
  if (b.text != null && typeof b.text !== 'string') return { error: "Noto'g'ri qiymat" };
  const text = typeof b.text === 'string' ? b.text : '';
  if (text.length > DRAFT_MAX_CHARS) return { error: 'Xabar juda uzun' };
  const replyTo = typeof b.replyTo === 'string' && OBJECT_ID.test(b.replyTo) ? b.replyTo : null;
  const deviceId = typeof b.deviceId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(b.deviceId) ? b.deviceId : null;
  return { text, replyTo, deviceId };
}

/** Tombstone: bo'sh matn va javobsiz (tozalangan qoralama). */
export const isTombstone = (d) => !String(d?.text || '').trim() && !d?.replyTo;

export function replySnapshot(m) {
  if (!m) return null;
  const gone = !!m.deletedForEveryone;
  return {
    id: String(m._id),
    senderId: String(m.senderId),
    type: m.type,
    text: !gone && m.type === 'text' ? String(m.text || '').slice(0, 120) : '',
    mediaKey: !gone && ['image', 'video'].includes(m.type) && !m.media?.round ? m.media?.key || null : null,
  };
}

/** Javob nishoni: shu suhbatdagi, menga ko'rinadigan, qo'ng'iroq bo'lmagan xabar — aks holda null. */
export async function resolveDraftReply(conversationId, userId, replyToId) {
  if (!replyToId) return null;
  const m = await Message.findOne({
    _id: replyToId,
    conversationId,
    deletedFor: { $ne: userId },
    deletedForEveryoneSilently: { $ne: true },
    type: { $ne: 'call' },
  })
    .select('senderId type text media deletedForEveryone')
    .lean();
  return m;
}

/** Bitta qoralama API shaklida (replyTo xabari oldindan topilgan bo'lsa `replyMsg`). */
export function serializeDraft(raw, replyMsg = null) {
  if (!raw) return null;
  return {
    text: String(raw.text || ''),
    replyTo: raw.replyTo && replyMsg ? replySnapshot(replyMsg) : null,
    updatedAt: new Date(raw.updatedAt).toISOString(),
  };
}

/** Ko'p suhbat uchun (GET /conversations): Map(conversationId -> draft|null), javob xabarlari bitta so'rovda. */
export async function draftsForConversations(convos, userId) {
  const raws = (convos || []).map((c) => [String(c._id), rawDraftOf(c, userId), c._id]);
  const replyIds = raws.filter(([, r]) => r?.replyTo).map(([, r]) => r.replyTo);
  const replies = replyIds.length
    ? await Message.find({ _id: { $in: replyIds }, deletedFor: { $ne: userId }, deletedForEveryoneSilently: { $ne: true }, type: { $ne: 'call' } })
        .select('conversationId senderId type text media deletedForEveryone')
        .lean()
    : [];
  const byId = new Map(replies.map((m) => [String(m._id), m]));
  const out = new Map();
  for (const [id, raw] of raws) {
    const reply = raw?.replyTo ? byId.get(String(raw.replyTo)) : null;
    out.set(id, serializeDraft(raw, reply && String(reply.conversationId) === id ? reply : null));
  }
  return out;
}
