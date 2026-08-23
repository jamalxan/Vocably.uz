import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message, Block, Notification } from '@/lib/models';
import { findSticker } from '@/lib/stickers';
import { objectExists } from '@/lib/s3';
import { pushNewMessage } from '@/lib/realtime';
import { sendPushToUser } from '@/lib/webPush';
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
    const query = { conversationId: convo._id };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ messages: messages.reverse() });
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

    // Bildirishnoma (qo'ng'iroq belgisi) + brauzer push — javobni bloklamaydi, xato
    // bo'lsa faqat log qilinadi (xabarning o'zi allaqachon saqlangan).
    const senderLabel = user.username ? `@${user.username}` : user.name || 'Foydalanuvchi';
    Notification.create({
      userId: otherId,
      type: 'chat_message',
      title: senderLabel,
      body: preview,
      link: String(convo._id),
    }).catch((err) => console.error('[notification] chat_message yozilmadi', err));
    sendPushToUser(otherId, { title: senderLabel, body: preview, url: '/dashboard' }).catch(() => {});

    return NextResponse.json({ message });
  } catch (err) {
    return serverError(err, 'chat/messages POST');
  }
}
