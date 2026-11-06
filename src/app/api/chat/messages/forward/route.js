import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message, Block, User } from '@/lib/models';
import { copyObject, buildObjectKey } from '@/lib/s3';
import { pushNewMessage, emitEvent } from '@/lib/realtime';
import { sendPushToUser } from '@/lib/webPush';
import { notifyRecipientViaTelegram } from '@/lib/chatNotify';
import { loadConversationForUser } from '@/lib/chat/conversationAccess';
import { isConversationMuted, previewForMessage } from '@/lib/chatConstants';
import { albumIdMapper, cleanBatchId, materializeCopies, partitionSources, planForwardCopies, validateForwardBody } from '@/lib/chat/forward';
import { after, NextResponse } from 'next/server';

// POST /api/chat/messages/forward — PARITY_PLAN WP5: tanlangan xabar(lar)ni bitta so'rovda 10 tagacha
// chatga yuborish. Har bir nishon mustaqil: biri bloklangan bo'lsa ham qolganlari yuboriladi,
// natija nishonma-nishon qaytadi. Rate limit butun paket uchun BIR marta (`chat-forward` 10/min).
// Takroriy so'rov (bir xil clientBatchId) dublikat yaratmaydi: har nusxaning clientMessageId'si
// `${batch}:${manba}:${nishon}` — avval saqlanganlari topilib qaytariladi.
const RATE_LIMIT = 10;

const serialize = (m) => ({
  id: m._id,
  _id: m._id,
  conversationId: m.conversationId,
  senderId: m.senderId,
  type: m.type,
  text: m.text,
  media: m.media || null,
  stickerId: m.stickerId || null,
  replyTo: null,
  albumId: m.albumId || null,
  forwardedFrom: m.forwardedFrom || null,
  clientMessageId: m.clientMessageId,
  readAt: m.readAt || null,
  createdAt: m.createdAt,
});

export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();

    const body = await req.json().catch(() => null);
    const v = validateForwardBody(body);
    if (v.error) return NextResponse.json({ error: v.error, code: v.code }, { status: 400 });

    const source = await loadConversationForUser(v.sourceConversationId, user._id);
    if (!source) return NextResponse.json({ error: 'Suhbat topilmadi', code: 'not_found' }, { status: 404 });

    if (!(await checkRateLimit(user._id, 'chat-forward', RATE_LIMIT))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting.", code: 'rate_limited' }, { status: 429 });
    }

    const found = await Message.find({ _id: { $in: v.messageIds }, conversationId: source._id }).lean();
    const { usable, skipped } = partitionSources(v.messageIds, found, user._id);
    if (!usable.length) {
      return NextResponse.json({ error: 'Xabar topilmadi', code: skipped.every((s) => s.reason === 'call') ? 'call' : 'not_found', skipped }, { status: 400 });
    }

    // Asl mualliflar bir marta (forward'ning forward'i — birinchi muallif).
    const authorIds = [...new Set(usable.map((m) => String(m.forwardedFrom?.userId || m.senderId)))];
    const authors = await User.find({ _id: { $in: authorIds } }).select('name username').lean();
    const authorsById = new Map(authors.map((a) => [String(a._id), a]));

    const clientBatchId = cleanBatchId(body?.clientBatchId);
    const senderLabel = user.username ? `@${user.username}` : user.name || 'Foydalanuvchi';
    const results = [];
    const deliveries = []; // { convo, otherId, payloads, preview, muted, liveMeta }

    // Nishonlar ketma-ket (har biri mustaqil): media nusxasi har nishonga bir marta.
    for (const targetId of v.targetIds) {
      const fail = (code, err) => results.push({ conversationId: targetId, ok: false, code, error: err });
      const convo = await loadConversationForUser(targetId, user._id);
      if (!convo) {
        fail('not_found', 'Suhbat topilmadi');
        continue;
      }
      const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
      const [blocked, other] = await Promise.all([
        Block.findOne({ $or: [{ blockerId: user._id, blockedId: otherId }, { blockerId: otherId, blockedId: user._id }] }).lean(),
        User.findById(otherId).select('chatAccess chatBanned').lean(),
      ]);
      if (blocked) {
        fail('blocked', "Bu chatga yuborib bo'lmaydi");
        continue;
      }
      if (!other || !other.chatAccess || other.chatBanned) {
        fail('unavailable', 'Foydalanuvchi mavjud emas');
        continue;
      }

      try {
        const now = new Date();
        const planned = planForwardCopies({
          sources: usable,
          targetConversationId: convo._id,
          senderId: user._id,
          authorsById,
          hideAuthor: v.hideAuthor,
          clientBatchId,
          now: new Date(now.getTime() + (v.comment ? 1 : 0)),
          newAlbumId: albumIdMapper(),
        });
        // Izoh (ixtiyoriy) — Telegram'dagidek nusxalardan OLDIN oddiy matnli xabar sifatida.
        if (v.comment) {
          planned.unshift({
            conversationId: convo._id,
            senderId: user._id,
            type: 'text',
            text: v.comment,
            clientMessageId: `${clientBatchId}:comment:${convo._id}`.slice(0, 100),
            createdAt: now,
          });
        }

        // Idempotentlik: shu paketdan avval saqlanganlar qayta yaratilmaydi (media ham qayta nusxalanmaydi).
        const existing = await Message.find({
          conversationId: convo._id,
          senderId: user._id,
          clientMessageId: { $in: planned.map((p) => p.clientMessageId) },
        }).lean();
        const have = new Set(existing.map((m) => m.clientMessageId));
        const missing = planned.filter((p) => !have.has(p.clientMessageId));
        const { docs, error: copyError } = await materializeCopies(missing, { copy: copyObject, keyFor: buildObjectKey });
        if (copyError) {
          fail('copy_failed', copyError);
          continue;
        }
        const inserted = docs.length ? await Message.insertMany(docs, { ordered: true }) : [];
        const all = [...existing, ...inserted.map((d) => d.toObject())].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id))
        );
        const last = all[all.length - 1];
        const preview = previewForMessage(last);

        if (inserted.length) {
          // Ro'yxat ko'rinishi oddiy yuborish bilan bir xil: oxirgi xabar, arxivdan qaytish, yashirilgandan chiqish.
          convo.lastMessageAt = last.createdAt;
          convo.lastMessagePreview = preview;
          if ((convo.archivedBy || []).length) convo.archivedBy = convo.archivedBy.filter((id) => String(id) !== String(otherId));
          if ((convo.hiddenFor || []).length) {
            convo.hiddenFor = convo.hiddenFor.filter((id) => String(id) !== String(user._id) && String(id) !== String(otherId));
          }
          await convo.save();
        }

        const payloads = all.map(serialize);
        results.push({ conversationId: targetId, ok: true, messages: payloads });
        if (inserted.length) {
          const recipientNick = convo.nicknames?.get ? convo.nicknames.get(String(otherId)) : convo.nicknames?.[String(otherId)];
          const muted = isConversationMuted(convo, otherId);
          const newIds = new Set(inserted.map((d) => String(d._id)));
          deliveries.push({
            convo,
            otherId,
            payloads: payloads.filter((p) => newIds.has(String(p.id))),
            preview,
            muted,
            liveMeta: { sender: { id: String(user._id), username: user.username || null, label: recipientNick || senderLabel }, silent: muted },
          });
        }
      } catch (err) {
        console.error('[chat] forward target failed', targetId, err?.message || err);
        fail('server_error', "Server xatoligi. Keyinroq qayta urinib ko'ring.");
      }
    }

    // Yetkazishlar javobdan keyin (PARITY_PLAN WP3 after() naqshi): har nishonda har bir nusxa
    // qabul qiluvchiga va yuboruvchining boshqa qurilmalariga jonli; push va Telegram esa nishonga BITTA.
    const pushUrl = user.username ? `/app/friends/${user.username}` : '/app/friends';
    if (deliveries.length) {
      after(async () => {
        const jobs = [];
        for (const d of deliveries) {
          const convId = String(d.convo._id);
          // Nusxalar tartibi saqlansin: bitta nishon ichida ketma-ket, nishonlar orasida parallel.
          jobs.push(async () => {
            for (const p of d.payloads) await pushNewMessage(d.otherId, convId, p, d.liveMeta);
          });
          jobs.push(async () => {
            for (const p of d.payloads) await emitEvent([user._id], 'message:new', { conversationId: convId, message: p, self: true });
          });
          if (!d.muted) jobs.push(() => sendPushToUser(d.otherId, { title: senderLabel, body: d.preview, url: pushUrl }));
          jobs.push(() =>
            notifyRecipientViaTelegram({ convo: d.convo, otherId: d.otherId, senderLabel, recipientMuted: d.muted, senderUsername: user.username })
          );
        }
        const settled = await Promise.allSettled(jobs.map((j) => j()));
        settled.filter((r) => r.status === 'rejected').forEach((r) => console.error('[chat] forward yetkazishda xatolik', r.reason));
      });
    }

    return NextResponse.json({ results, skipped });
  } catch (err) {
    return serverError(err, 'chat/messages/forward POST');
  }
}
