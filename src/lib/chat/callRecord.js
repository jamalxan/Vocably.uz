// Qo'ng'iroq yozuvi (Message.type === 'call') — yaratish, tekshirish, bildirishnoma.
// Ikki chaqiruvchi: POST /api/internal/call-event (realtime-server qo'ng'iroq tugaganda)
// va POST /api/chat/conversations/[id]/calls (qo'ng'iroq qilinayotgan foydalanuvchi
// oflayn/band bo'lsa — grant berilmaydi, lekin javobsiz qo'ng'iroq baribir yoziladi).
// Yozuv callId bo'yicha idempotent (partial unique indeks, src/lib/models.js).
import { Conversation, Message, User } from '@/lib/models';
import { previewForMessage, CALL_OUTCOMES } from '@/lib/chatConstants';
import { callNotifications } from '@/lib/chatNotify';

export const CALL_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const CALL_KINDS = ['audio', 'video'];

const parseDate = (v) => {
  if (typeof v !== 'string' || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// CallEventBody (docs/chat/CALLS_SPEC.md §5.3) tekshiruvi. Xato bo'lsa `{ field }`
// (qaysi maydon noto'g'ri), aks holda `{ value }` — sanalar Date'ga aylantirilgan.
export function validateCallEventBody(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { field: 'body' };
  if (typeof b.callId !== 'string' || !CALL_UUID_RE.test(b.callId)) return { field: 'callId' };
  for (const f of ['conversationId', 'callerId', 'calleeId']) {
    if (typeof b[f] !== 'string' || !OBJECT_ID_RE.test(b[f])) return { field: f };
  }
  if (b.callerId === b.calleeId) return { field: 'calleeId' };
  if (!CALL_KINDS.includes(b.kind)) return { field: 'kind' };
  if (!CALL_OUTCOMES.includes(b.outcome)) return { field: 'outcome' };
  const ended = b.outcome === 'ended';
  if (ended) {
    if (!Number.isInteger(b.durationSec) || b.durationSec < 0) return { field: 'durationSec' };
  } else if (b.durationSec !== null && b.durationSec !== undefined) {
    return { field: 'durationSec' };
  }
  const startedAt = parseDate(b.startedAt);
  if (!startedAt) return { field: 'startedAt' };
  const endedAt = parseDate(b.endedAt);
  if (!endedAt || endedAt < startedAt) return { field: 'endedAt' };
  let acceptedAt = null;
  if (ended) {
    acceptedAt = parseDate(b.acceptedAt);
    if (!acceptedAt) return { field: 'acceptedAt' };
  } else if (b.acceptedAt !== null && b.acceptedAt !== undefined) {
    return { field: 'acceptedAt' };
  }
  if (typeof b.answered !== 'boolean') return { field: 'answered' };
  return {
    value: {
      callId: b.callId.toLowerCase(),
      conversationId: b.conversationId,
      callerId: b.callerId,
      calleeId: b.calleeId,
      kind: b.kind,
      outcome: b.outcome,
      durationSec: ended ? b.durationSec : null,
      startedAt,
      acceptedAt,
      endedAt,
      answered: b.answered,
    },
  };
}

// Socket payload konvensiyasi (§7.3): `_id` yonida `id`, reaksiyalar bo'sh.
export function normaliseCallMessage(doc) {
  const m = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    id: String(m._id),
    _id: m._id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    type: 'call',
    text: '',
    media: null,
    stickerId: null,
    replyTo: null,
    albumId: null,
    forwardedFrom: null,
    call: m.call,
    reactions: [],
    readAt: m.readAt || null,
    createdAt: m.createdAt,
  };
}

// Qo'ng'iroq qilingan tomon javob bermagan (missed/busy/cancelled) yozuvlar o'qilmagan
// bo'lib qoladi — mavjud unread hisobi ularni qo'ng'iroq qilinganga badge qiladi.
export function callReadAt(value) {
  return ['ended', 'declined', 'failed'].includes(value.outcome) || value.answered ? value.endedAt : null;
}

// -> { notFound: true } | { message, created, convo }
export async function recordCall(value) {
  const convo = await Conversation.findOne({
    _id: value.conversationId,
    participantIds: { $all: [value.callerId, value.calleeId] },
  });
  if (!convo) return { notFound: true };

  const existing = await Message.findOne({ 'call.callId': value.callId }).lean();
  if (existing) return { message: normaliseCallMessage(existing), created: false, convo };

  const call = {
    callId: value.callId,
    kind: value.kind,
    outcome: value.outcome,
    durationSec: value.durationSec,
    startedAt: value.startedAt,
    acceptedAt: value.acceptedAt,
    endedAt: value.endedAt,
  };
  let doc;
  try {
    doc = await Message.create({
      conversationId: convo._id,
      senderId: value.callerId,
      type: 'call',
      text: '',
      media: null,
      call,
      readAt: callReadAt(value),
      createdAt: value.endedAt,
    });
  } catch (err) {
    // Parallel ikkinchi so'rov (retry) unique indeksga urildi — birinchisining yozuvi qaytadi.
    if (err?.code === 11000) {
      const again = await Message.findOne({ 'call.callId': value.callId }).lean();
      if (again) return { message: normaliseCallMessage(again), created: false, convo };
    }
    throw err;
  }

  // Ro'yxatdagi oxirgi xabar — faqat bu yozuv haqiqatan eng yangisi bo'lsa (kechikkan
  // retry yangiroq matn xabarining preview'ini eskisi bilan almashtirib yubormasin).
  const set = {};
  if (!convo.lastMessageAt || value.endedAt >= convo.lastMessageAt) {
    set.lastMessageAt = value.endedAt;
    set.lastMessagePreview = previewForMessage(doc);
  }
  await Conversation.updateOne(
    { _id: convo._id },
    {
      ...(Object.keys(set).length ? { $set: set } : {}),
      // Yangi xabar kabi: qo'ng'iroq qilingan tomonda arxivdan chiqadi, ikkala tomonda yashirilgan bo'lsa qaytadi.
      $pull: { archivedBy: value.calleeId, hiddenFor: { $in: [value.callerId, value.calleeId] } },
    }
  );

  return { message: normaliseCallMessage(doc), created: true, convo };
}

// Bildirishnomalar (web push + Telegram, §7.4). Chaqiruvchi after() ichida kutadi.
export async function notifyRecordedCall({ convo, value }) {
  const [caller, callee] = await Promise.all([
    User.findById(value.callerId).select('username name').lean(),
    User.findById(value.calleeId).select('username name').lean(),
  ]);
  await Promise.allSettled(callNotifications({ convo, call: value, caller, callee }));
}
