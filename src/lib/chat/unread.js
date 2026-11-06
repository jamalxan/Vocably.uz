// O'qilmagan xabarlar sonini hisoblash — GET /api/chat/conversations (har bir qator) va
// GET /api/chat/unread (nav belgisi, tab sarlavhasi; PARITY_PLAN WP1) bitta manbadan foydalanadi.
// Faqat BOSHQA tomon yuborgan, hali `readAt`siz, men uchun o'chirilmagan, jimgina o'chirilmagan va
// mening oxirgi "tozalash"imdan (clearedAt) keyin kelgan xabarlar hisoblanadi.
import { Conversation, Message } from '@/lib/models';
import { isConversationMuted } from '@/lib/chatConstants';

const clearedAtFor = (convo, uid) => {
  const raw = convo?.clearedAt?.get ? convo.clearedAt.get(uid) : convo?.clearedAt?.[uid];
  return raw ? new Date(raw) : null;
};

/** `convos` — Conversation hujjatlari (lean ham bo'ladi). Natija: Map(conversationId -> count). */
export async function unreadByConversation(userId, convos) {
  const list = convos || [];
  if (!list.length) return new Map();
  const uid = String(userId);
  const plain = [];
  const cleared = [];
  for (const c of list) {
    const at = clearedAtFor(c, uid);
    if (at) cleared.push({ conversationId: c._id, createdAt: { $gt: at } });
    else plain.push(c._id);
  }
  const scope = [...(plain.length ? [{ conversationId: { $in: plain } }] : []), ...cleared];
  const agg = await Message.aggregate([
    {
      $match: {
        $or: scope,
        senderId: { $ne: userId },
        readAt: null,
        deletedFor: { $ne: userId },
        deletedForEveryoneSilently: { $ne: true },
      },
    },
    { $group: { _id: '$conversationId', count: { $sum: 1 } } },
  ]);
  return new Map(agg.map((u) => [String(u._id), u.count]));
}

/**
 * Nav belgisi uchun umumiy son: yashirilgan va arxivdagi suhbatlar hisoblanmaydi; ovozsizlari
 * `mutedTotal`ga (raqamsiz nuqta), `chats` — o'qilmagani bor ovozsiz bo'lmagan suhbatlar soni.
 */
export async function countUnread(userId, now = Date.now()) {
  const convos = await Conversation.find({ participantIds: userId, hiddenFor: { $ne: userId }, archivedBy: { $ne: userId } })
    .select('_id mutedBy mutedUntil clearedAt')
    .lean();
  const byId = await unreadByConversation(userId, convos);
  let total = 0;
  let mutedTotal = 0;
  let chats = 0;
  for (const c of convos) {
    const n = byId.get(String(c._id)) || 0;
    if (!n) continue;
    if (isConversationMuted(c, userId, now)) mutedTotal += n;
    else {
      total += n;
      chats += 1;
    }
  }
  return { total, mutedTotal, chats };
}
