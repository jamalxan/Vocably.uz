import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, User, Block, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

function sortedPair(a, b) {
  return [String(a), String(b)].sort();
}

function pairKey(a, b) {
  return sortedPair(a, b).join('_');
}

export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    // `hiddenFor` — shu user "Do'stlar" ro'yxatidan o'chirgan suhbatlar (docs/ hujjat
    // o'zi saqlanadi, faqat ro'yxatdan yashiriladi — src/app/api/chat/conversations/[id]).
    const conversations = await Conversation.find({ participantIds: user._id, hiddenFor: { $ne: user._id } })
      .sort({ lastMessageAt: -1 })
      .limit(200)
      .lean();

    const otherIds = conversations.map(
      (c) => c.participantIds.find((id) => String(id) !== String(user._id))
    );
    const others = await User.find({ _id: { $in: otherIds } }).select('username name lastActiveAt').lean();
    const byId = new Map(others.map((u) => [String(u._id), u]));

    // "Do'stlar" ro'yxatida kimdan o'qilmagan xabar borligini ko'rsatish uchun —
    // bitta aggregatsiya bilan HAMMA suhbat uchun birdek hisoblanadi (har biri uchun
    // alohida so'rov o'rniga). Faqat BOSHQA tomon yuborgan va hali `readAt`siz
        // xabarlar hisoblanadi (o'zim yozganlarim "o'qilmagan" emas).
    const convoIds = conversations.map((c) => c._id);
    const unreadAgg = convoIds.length
      ? await Message.aggregate([
          {
            $match: {
              conversationId: { $in: convoIds },
              senderId: { $ne: user._id },
              readAt: null,
              deletedFor: { $ne: user._id },
              deletedForEveryoneSilently: { $ne: true },
            },
          },
          { $group: { _id: '$conversationId', count: { $sum: 1 } } },
        ])
      : [];
    const unreadById = new Map(unreadAgg.map((u) => [String(u._id), u.count]));

    const result = conversations.map((c) => {
      const otherId = c.participantIds.find((id) => String(id) !== String(user._id));
      const other = byId.get(String(otherId));
      // Men shu boshqa foydalanuvchiga qo'ygan taxallus (faqat menda ko'rinadi) —
      // src/app/api/chat/conversations/[id]/nickname PATCH orqali o'rnatiladi.
      const nickname = c.nicknames?.[String(user._id)] || '';
      return {
        id: c._id,
        otherUser: other
          ? { id: other._id, username: other.username, name: other.name || '', lastActiveAt: other.lastActiveAt || null, nickname }
          : null,
        lastMessageAt: c.lastMessageAt,
        lastMessagePreview: c.lastMessagePreview || '',
        muted: (c.mutedBy || []).some((id) => String(id) === String(user._id)),
        notifyOnline: (c.onlineNotifyBy || []).some((id) => String(id) === String(user._id)),
        unreadCount: unreadById.get(String(c._id)) || 0,
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (err) {
    return serverError(err, 'chat/conversations GET');
  }
}

// Berilgan username bilan suhbatni topadi, yo'q bo'lsa yaratadi (Telegram'dagi
// "yozishni boshlash" kabi — alohida do'st-so'rovi bosqichi yo'q, docs/ chat plani §3).
export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { username } = await req.json();
    const uname = (username || '').trim().toLowerCase();
    if (!uname) return NextResponse.json({ error: 'username kerak' }, { status: 400 });

    const target = await User.findOne({ username: uname, chatAccess: true, chatBanned: { $ne: true } }).lean();
    if (!target) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    if (String(target._id) === String(user._id)) {
      return NextResponse.json({ error: "O'zingiz bilan suhbat ocholmaysiz" }, { status: 400 });
    }

    const blocked = await Block.findOne({
      $or: [
        { blockerId: user._id, blockedId: target._id },
        { blockerId: target._id, blockedId: user._id },
      ],
    }).lean();
    if (blocked) return NextResponse.json({ error: 'Ushbu foydalanuvchi bilan suhbat mavjud emas' }, { status: 403 });

    const participantIds = sortedPair(user._id, target._id);
    const key = pairKey(user._id, target._id);
    let convo = await Conversation.findOne({ pairKey: key }).lean();
    if (!convo) {
      try {
        convo = await Conversation.create({ participantIds, pairKey: key });
      } catch (createErr) {
        // Poyga holati: ikkalasi bir vaqtda "Yozish"ni bossa, unique pairKey
        // ikkinchisini E11000 bilan qaytaradi — bu holatda allaqachon yaratilgan
        // hujjatni topib qaytaramiz, xato emas.
        if (createErr?.code === 11000) {
          convo = await Conversation.findOne({ pairKey: key }).lean();
        } else {
          throw createErr;
        }
      }
    } else if ((convo.hiddenFor || []).some((id) => String(id) === String(user._id))) {
      // Bu user ilgari shu suhbatni ro'yxatidan o'chirgan edi — qidiruv orqali qayta
      // topib "Yozish"ni bossa, ro'yxatga qaytadi (eski xabarlar deletedFor tufayli
      // baribir yashirin qoladi, faqat shu nuqtadan keyingi yangi xabarlar ko'rinadi).
      await Conversation.updateOne({ _id: convo._id }, { $pull: { hiddenFor: user._id } });
    }

    return NextResponse.json({
      conversation: {
        id: convo._id,
        otherUser: {
          id: target._id,
          username: target.username,
          name: target.name || '',
          lastActiveAt: target.lastActiveAt || null,
          nickname: convo.nicknames?.get ? convo.nicknames.get(String(user._id)) || '' : convo.nicknames?.[String(user._id)] || '',
        },
        lastMessageAt: convo.lastMessageAt,
        lastMessagePreview: convo.lastMessagePreview || '',
        muted: (convo.mutedBy || []).some((id) => String(id) === String(user._id)),
        notifyOnline: (convo.onlineNotifyBy || []).some((id) => String(id) === String(user._id)),
      },
    });
  } catch (err) {
    return serverError(err, 'chat/conversations POST');
  }
}
