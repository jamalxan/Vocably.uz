import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Block, Message } from '@/lib/models';
import { loadConversationForUser } from '@/lib/chat/conversationAccess';
import { normalizeEmoji, serializeReactions } from '@/lib/chat/reactions';
import { emitEvent } from '@/lib/realtime';
import { after, NextResponse } from 'next/server';

// Xabar reaksiyalari (docs/chat/PARITY_PLAN.md WP7). Bir foydalanuvchi — bitta reaksiya:
//   POST { emoji } — qo'yadi; boshqa emoji bo'lsa almashtiradi; AYNAN shu emoji allaqachon
//                    meniki bo'lsa — olib tashlaydi (toggle, tezkor qatordagi bosilgan tugma kabi).
//   DELETE         — menikini olib tashlaydi (idempotent).
// Ikkalasi ham to'liq massivni qaytaradi va ikkala ishtirokchiga (o'zimning boshqa qurilma/tablarim
// uchun ham) `message:reacted` yuboradi — klientlar delta qo'llamaydi, massivni almashtiradi.
// Reaksiya lastMessagePreview, o'qilmaganlar soni va push/Telegram'ga ta'sir qilmaydi (wave 2).

const isObjectId = (v) => /^[a-f0-9]{24}$/i.test(String(v || ''));
const json = (body, status = 200) => NextResponse.json(body, { status });

// Umumiy tekshiruvlar: a'zolik, xabar shu suhbatda, men uchun o'chirilmagan, hamma uchun
// o'chirilmagan, qo'ng'iroq yozuvi emas. `{ error }` (tayyor javob) yoki `{ convo, otherId, message }`.
async function loadReactable(params, user) {
  const convo = await loadConversationForUser(params.id, user._id);
  if (!convo) return { error: json({ error: 'Suhbat topilmadi', code: 'not_found' }, 404) };
  if (!isObjectId(params.messageId)) return { error: json({ error: 'Xabar topilmadi', code: 'not_found' }, 404) };

  const message = await Message.findOne({
    _id: params.messageId,
    conversationId: convo._id,
    deletedFor: { $ne: user._id },
    deletedForEveryoneSilently: { $ne: true },
  })
    .select('type deletedForEveryone')
    .lean();
  if (!message) return { error: json({ error: 'Xabar topilmadi', code: 'not_found' }, 404) };
  if (message.deletedForEveryone || message.type === 'call') {
    return { error: json({ error: "Bu xabarga reaksiya qo'yib bo'lmaydi", code: 'not_reactable' }, 400) };
  }
  const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
  return { convo, otherId, message };
}

function deliver(user, otherId, conversationId, messageId, reactions) {
  // Javobdan keyin (PARITY_PLAN WP3 after() naqshi): yuboruvchi realtime xostini kutmaydi.
  after(async () => {
    const results = await Promise.allSettled([
      emitEvent([user._id, otherId].filter(Boolean), 'message:reacted', { conversationId, messageId, reactions }),
    ]);
    results.filter((r) => r.status === 'rejected').forEach((r) => console.error('[chat] reaksiya yetkazilmadi', r.reason));
  });
}

async function respond(user, otherId, convo, messageId) {
  const fresh = await Message.findById(messageId).select('reactions').lean();
  const reactions = serializeReactions(fresh?.reactions);
  deliver(user, otherId, String(convo._id), String(messageId), reactions);
  return json({ reactions });
}

export async function POST(req, props) {
  const params = await props.params;
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return json({ error }, status);

    await connectToDatabase();

    const loaded = await loadReactable(params, user);
    if (loaded.error) return loaded.error;
    const { convo, otherId, message } = loaded;

    const blocked = await Block.findOne({
      $or: [
        { blockerId: user._id, blockedId: otherId },
        { blockerId: otherId, blockedId: user._id },
      ],
    }).lean();
    if (blocked) return json({ error: "Reaksiya qo'yib bo'lmadi", code: 'blocked' }, 403);

    const body = await req.json().catch(() => ({}));
    const emoji = normalizeEmoji(body?.emoji);
    if (!emoji) return json({ error: "Noto'g'ri emoji", code: 'bad_emoji' }, 400);

    if (!(await checkRateLimit(user._id, 'chat-react', 60))) {
      return json({ error: "Juda ko'p so'rov. Biroz kuting.", code: 'rate_limited' }, 429);
    }

    // Atomik toggle/almashtirish (bitta pipeline update — ikkala tomon bir vaqtda bossa ham
    // ikkala yozuv saqlanadi, o'qish-o'zgartirish-yozish poygasi yo'q):
    //   others = mening yozuvimsiz massiv; agar menda aynan shu emoji bo'lsa -> others,
    //   aks holda others + [yangi yozuv].
    const me = new mongoose.Types.ObjectId(String(user._id));
    const current = { $ifNull: ['$reactions', []] };
    const others = { $filter: { input: current, cond: { $ne: ['$$this.userId', me] } } };
    const hadSame = {
      $gt: [
        { $size: { $filter: { input: current, cond: { $and: [{ $eq: ['$$this.userId', me] }, { $eq: ['$$this.emoji', { $literal: emoji }] }] } } } },
        0,
      ],
    };
    await Message.updateOne({ _id: message._id }, [
      {
        $set: {
          reactions: { $cond: [hadSame, others, { $concatArrays: [others, [{ emoji: { $literal: emoji }, userId: me, at: '$$NOW' }]] }] },
        },
      },
    ]);

    return respond(user, otherId, convo, message._id);
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId]/reactions POST');
  }
}

export async function DELETE(req, props) {
  const params = await props.params;
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return json({ error }, status);

    await connectToDatabase();

    const loaded = await loadReactable(params, user);
    if (loaded.error) return loaded.error;
    const { convo, otherId, message } = loaded;

    if (!(await checkRateLimit(user._id, 'chat-react', 60))) {
      return json({ error: "Juda ko'p so'rov. Biroz kuting.", code: 'rate_limited' }, 429);
    }

    await Message.updateOne({ _id: message._id }, { $pull: { reactions: { userId: user._id } } });

    return respond(user, otherId, convo, message._id);
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId]/reactions DELETE');
  }
}
