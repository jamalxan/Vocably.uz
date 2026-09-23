import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { pushMessageEdited, pushMessageDeleted } from '@/lib/realtime';
import { PREVIEW_BY_TYPE } from '@/lib/chatConstants';
import { NextResponse } from 'next/server';

const MAX_TEXT_LEN = 4000;

// C-02 — xabar o'chirilgandan/tahrirlangandan keyin, agar u suhbatning ENG OXIRGI
// xabari bo'lsa, ro'yxatdagi preview/vaqtni qayta hisoblaydi (aks holda hech narsa
// qilmaydi — performance uchun har bir o'chirish/tahrirda butun suhbatni qayta
// skanerlash shart emas). `deletedForEveryoneSilently` yoki `deletedForEveryone`
// bo'lgan xabarlar "eng so'nggi ko'rinadigan xabar" sifatida hisobga olinmaydi —
// ulardan oldingi haqiqiy (hali o'chirilmagan) xabar preview manbai bo'ladi.
async function recomputeLastMessageIfNeeded(convo, changedMessageId) {
  const latestOverall = await Message.findOne({ conversationId: convo._id }).sort({ createdAt: -1 }).select('_id').lean();
  if (!latestOverall || String(latestOverall._id) !== String(changedMessageId)) return; // O'zgargan xabar hozir ham oxirgisi bo'lmasa — hech narsa o'zgarmagan.

  const newLatest = await Message.findOne({
    conversationId: convo._id,
    deletedForEveryone: { $ne: true },
    deletedForEveryoneSilently: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!newLatest) {
    convo.lastMessageAt = null;
    convo.lastMessagePreview = '';
  } else {
    convo.lastMessageAt = newLatest.createdAt;
    convo.lastMessagePreview =
      newLatest.type === 'text' ? (newLatest.text || '').slice(0, 80) : PREVIEW_BY_TYPE[newLatest.type] || '';
  }
  await convo.save();
}

async function loadOwnMessage(conversationId, messageId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.participantIds.some((id) => String(id) === String(userId))) return {};

  const message = await Message.findOne({ _id: messageId, conversationId: convo._id });
  return { convo, message };
}

// Faqat o'zining matnli xabarini tahrirlaydi. `originalText` faqat BIRINCHI tahrirda
// yoziladi — shu tufayli admin panel qancha marta qayta tahrirlansa ham asl matnni
// ko'ra oladi (Telegram foydalanuvchi tarafida ko'rsatmaydi, faqat "tahrirlangan" belgisi).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { convo, message } = await loadOwnMessage(params.id, params.messageId, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    if (!message) return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });
    if (String(message.senderId) !== String(user._id)) {
      return NextResponse.json({ error: "Faqat o'z xabaringizni tahrirlay olasiz" }, { status: 403 });
    }
    if (message.type !== 'text') return NextResponse.json({ error: "Bu turdagi xabarni tahrirlab bo'lmaydi" }, { status: 400 });
    if (message.deletedForEveryone) return NextResponse.json({ error: "O'chirilgan xabarni tahrirlab bo'lmaydi" }, { status: 400 });

    const { text } = await req.json();
    const cleanText = (text || '').trim();
    if (!cleanText) return NextResponse.json({ error: "Bo'sh xabar bo'lishi mumkin emas" }, { status: 400 });
    if (cleanText.length > MAX_TEXT_LEN) return NextResponse.json({ error: 'Xabar juda uzun' }, { status: 400 });
    if (cleanText === message.text) return NextResponse.json({ message });

    if (!message.edited) message.originalText = message.text;
    message.text = cleanText;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // C-02 — suhbat ro'yxatidagi oxirgi xabar shu bo'lsa, preview'ni ham yangilaymiz.
    await recomputeLastMessageIfNeeded(convo, message._id);

    // C-11 — boshqa tomonga real-vaqtda yetkazadi (avval bu event yo'q edi, u faqat
    // sahifani qayta yuklaganda yangi matnni ko'rardi).
    const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
    if (otherId) {
      pushMessageEdited(otherId, String(convo._id), {
        id: message._id,
        conversationId: convo._id,
        text: message.text,
        edited: true,
        editedAt: message.editedAt,
      });
    }

    return NextResponse.json({ message });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId] PATCH');
  }
}

// `forEveryone: true` — faqat xabar egasi tanlashi mumkin, ikkala tomondan ham
// yashiradi (hujjat o'chirilmaydi, `deletedForEveryone` bilan belgilanadi). Aks holda
// (yoki forEveryone berilmasa) — faqat so'rovchi uchun (`deletedFor`ga qo'shiladi),
// boshqa tomon xabarni odatdagidek ko'raveradi.
export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { convo, message } = await loadOwnMessage(params.id, params.messageId, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    if (!message) return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const forEveryone = !!body.forEveryone;
    const isMine = String(message.senderId) === String(user._id);

    let silently = false;
    if (forEveryone) {
      if (!isMine) return NextResponse.json({ error: "Faqat o'z xabaringizni ikkala tomondan ham o'chira olasiz" }, { status: 403 });
      message.deletedForEveryone = true;
      // Admin o'z xabarini o'chirsa — "xabar o'chirildi" tombstone'i ikkala tomonda
      // ham ko'rinmasin (GET query'si shu bayroqni butunlay chiqarib tashlaydi),
      // oddiy foydalanuvchida esa Telegram uslubidagi belgi qoladi.
      if (user.role === 'admin') {
        message.deletedForEveryoneSilently = true;
        silently = true;
      }
    } else if (!message.deletedFor.some((id) => String(id) === String(user._id))) {
      message.deletedFor.push(user._id);
    }
    await message.save();

    // C-02/C-11 — faqat `forEveryone` bo'lganda: bu shared (ikkala tomon uchun umumiy)
    // lastMessagePreview/lastMessageAt'ga ta'sir qiladigan va boshqa tomonga ham
    // tegishli bo'lgan yagona holat. Oddiy "faqat men uchun" o'chirish (deletedFor)
    // boshqa tomonga hech qanday ta'sir qilmaydi — ular hali ham xabarni ko'raveradi,
    // shuning uchun preview qayta hisoblanmaydi va socket eventi yuborilmaydi.
    if (forEveryone) {
      await recomputeLastMessageIfNeeded(convo, message._id);
      const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
      if (otherId) {
        pushMessageDeleted(otherId, String(convo._id), message._id, silently);
      }
    }

    return NextResponse.json({ success: true, silently });
  } catch (err) {
    return serverError(err, 'chat/messages/[messageId] DELETE');
  }
}
