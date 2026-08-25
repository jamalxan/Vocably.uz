import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message, Block, User } from '@/lib/models';
import { findSticker } from '@/lib/stickers';
import { objectExists } from '@/lib/s3';
import { pushNewMessage } from '@/lib/realtime';
import { sendPushToUser } from '@/lib/webPush';
import { markConversationRead } from '@/lib/chatRead';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { NextResponse } from 'next/server';

const MAX_TEXT_LEN = 4000;
const PREVIEW_BY_TYPE = { image: '📷 Rasm', video: '🎬 Video', voice: '🎤 Ovozli xabar', file: '📎 Fayl', sticker: '😊 Stiker' };

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

export async function GET(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const before = req.nextUrl.searchParams.get('before');
    // O'zi "faqat men uchun" o'chirgan xabarlarini butunlay ko'rmaydi (boshqa tomon
    // odatdagidek ko'raveradi) — shuning uchun query darajasida filtrlanadi.
    const query = { conversationId: convo._id, deletedFor: { $ne: user._id } };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(50).lean();

    // Suhbatni ochish/qayta yuklash = o'qish: boshqa tomon yozgan va hali `readAt`
    // belgilanmagan xabarlarni shu yerda "o'qildi" deb belgilaymiz (javobni bloklamaydi).
    // Faqat SHU (oddiy foydalanuvchi) endpointi shunday qiladi — admin panelning
    // suhbatni ko'rish endpointi buni chaqirmaydi (src/lib/chatRead.js izohiga qarang).
    const otherIdForRead = convo.participantIds.find((id) => String(id) !== String(user._id));
    if (otherIdForRead) {
      markConversationRead(convo._id, user._id, otherIdForRead).catch((err) =>
        console.error('[chat] o\'qilgan deb belgilanmadi', err)
      );
    }

    // Ikkala tomondan o'chirilgan xabar hujjati saqlanib qoladi (admin audit uchun),
    // lekin oddiy foydalanuvchiga haqiqiy matn/media o'rniga faqat belgisi ko'rsatiladi —
    // xabarning joylashuvi (vaqt tartibi) suhbatda saqlanib qoladi, Telegram'dagidek.
    const sanitized = messages.map((m) =>
      m.deletedForEveryone
        ? { ...m, text: '', media: null, stickerId: null, originalText: undefined }
        : { ...m, originalText: undefined }
    );

    return NextResponse.json({ messages: sanitized.reverse() });
  } catch (err) {
    return serverError(err, 'chat/messages GET');
  }
}

export async function POST(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
    const blocked = await Block.findOne({
      $or: [
        { blockerId: user._id, blockedId: otherId },
        { blockerId: otherId, blockedId: user._id },
      ],
    }).lean();
    if (blocked) return NextResponse.json({ error: "Xabar yuborib bo'lmadi" }, { status: 403 });

    if (!(await checkRateLimit(user._id, 'chat-send', 40))) {
      return NextResponse.json({ error: "Juda tez yozyapsiz. Biroz kuting." }, { status: 429 });
    }

    const body = await req.json();
    const { type } = body;

    let doc = { conversationId: convo._id, senderId: user._id, type };
    let preview;

    if (type === 'text') {
      const text = (body.text || '').trim();
      if (!text) return NextResponse.json({ error: "Bo'sh xabar yuborib bo'lmaydi" }, { status: 400 });
      if (text.length > MAX_TEXT_LEN) return NextResponse.json({ error: 'Xabar juda uzun' }, { status: 400 });
      doc.text = text;
      preview = text.slice(0, 80);
    } else if (type === 'sticker') {
      const sticker = findSticker(body.stickerId);
      if (!sticker) return NextResponse.json({ error: "Noto'g'ri stiker" }, { status: 400 });
      doc.stickerId = sticker.id;
      preview = PREVIEW_BY_TYPE.sticker;
    } else if (['image', 'video', 'voice', 'file'].includes(type)) {
      const media = body.media;
      if (!media?.key || !media?.mimeType || !media?.size) {
        return NextResponse.json({ error: "Noto'g'ri media ma'lumot" }, { status: 400 });
      }
      // Kalit haqiqatan ham shu suhbat papkasiga yuklangan bo'lishi shart — boshqa
      // suhbatning obyekt kalitini kiritib xabar "yasab" bo'lmasligi uchun.
      if (!media.key.startsWith(`conversations/${convo._id}/`)) {
        return NextResponse.json({ error: 'Media bu suhbatga tegishli emas' }, { status: 400 });
      }
      if (!(await objectExists(media.key))) {
        return NextResponse.json({ error: 'Fayl topilmadi. Avval yuklang.' }, { status: 400 });
      }
      doc.media = {
        key: media.key,
        mimeType: media.mimeType,
        size: media.size,
        width: media.width || null,
        height: media.height || null,
        durationSec: media.durationSec || null,
      };
      preview = PREVIEW_BY_TYPE[type];
    } else {
      return NextResponse.json({ error: "Noto'g'ri xabar turi" }, { status: 400 });
    }

    const message = await Message.create(doc);

    convo.lastMessageAt = message.createdAt;
    convo.lastMessagePreview = preview;
    // Yangi xabar kelsa — ikkala tomon uchun ham ro'yxatga qaytadi, agar avval
    // (bir yoki ikki taraflama) o'chirilgan/yashirilgan bo'lsa (docs/ conversations/[id] DELETE).
    if ((convo.hiddenFor || []).length) {
      convo.hiddenFor = convo.hiddenFor.filter(
        (id) => String(id) !== String(user._id) && String(id) !== String(otherId)
      );
    }
    await convo.save();

    pushNewMessage(otherId, String(convo._id), {
      id: message._id,
      conversationId: convo._id,
      senderId: user._id,
      type: message.type,
      text: message.text,
      media: message.media,
      stickerId: message.stickerId,
      createdAt: message.createdAt,
    });

    // Brauzer push — javobni bloklamaydi, xato bo'lsa faqat log qilinadi (xabarning
    // o'zi allaqachon saqlangan). Qabul qiluvchi shu suhbatni "ovozsiz" qilgan bo'lsa
    // (mutedBy) — hech qanday push yubormaymiz, lekin xabarning o'zi (realtime/poll
    // orqali) odatdagidek yetib boradi; yuboruvchi bu haqda hech narsa bilmaydi — API
    // javobi ikkala holatda ham bir xil. Ilova ichidagi qo'ng'iroq belgisida (Notification
    // hujjati) chat xabarlari uchun ATAYLAB endi bildirishnoma yaratilmaydi — buning
    // o'rniga adminga Telegram orqali xabar boradi (pastga qarang).
    const senderLabel = user.username ? `@${user.username}` : user.name || 'Foydalanuvchi';
    const recipientMuted = (convo.mutedBy || []).some((id) => String(id) === String(otherId));
    if (!recipientMuted) {
      sendPushToUser(otherId, { title: senderLabel, body: preview, url: '/dashboard' }).catch(() => {});
    }

    // Telegram xabari — FAQAT xabar aynan adminning o'ziga (qabul qiluvchi roli
    // 'admin' bo'lganda) yozilganda yuboriladi, boshqa har qanday ikki foydalanuvchi
    // suhbatlashganda EMAS (aks holda admin o'zi kimgadir yozganda ham unga bekorga
    // bildirishnoma kelaverardi). Foydalanuvchining shaxsiy "ovozsiz" sozlamasidan
    // qat'iy nazar yuboriladi. ATAYLAB butunlay umumiy: kim yozgani, xabar turi yoki
    // mazmuni (`preview`) hech qachon ko'rsatilmaydi — faqat "sizga xabar keldi" signali.
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminChatId) {
      const recipient = await User.findById(otherId).select('role').lean();
      if (recipient?.role === 'admin') {
        sendTelegramMessage(adminChatId, '💬 Sizga xabar keldi.').catch((err) =>
          console.error('[telegram] admin chat xabari yuborilmadi', err)
        );
      }
    }

    return NextResponse.json({ message });
  } catch (err) {
    return serverError(err, 'chat/messages POST');
  }
}
