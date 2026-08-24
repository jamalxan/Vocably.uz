import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, User, Block } from '@/lib/models';
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

    const conversations = await Conversation.find({ participantIds: user._id })
      .sort({ lastMessageAt: -1 })
      .limit(200)
      .lean();

    const otherIds = conversations.map(
      (c) => c.participantIds.find((id) => String(id) !== String(user._id))
    );
    const others = await User.find({ _id: { $in: otherIds } }).select('username name lastActiveAt').lean();
    const byId = new Map(others.map((u) => [String(u._id), u]));

    const result = conversations.map((c) => {
      const otherId = c.participantIds.find((id) => String(id) !== String(user._id));
      const other = byId.get(String(otherId));
      return {
        id: c._id,
        otherUser: other
          ? { id: other._id, username: other.username, name: other.name || '', lastActiveAt: other.lastActiveAt || null }
          : null,
        lastMessageAt: c.lastMessageAt,
        lastMessagePreview: c.lastMessagePreview || '',
        muted: (c.mutedBy || []).some((id) => String(id) === String(user._id)),
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
    }

    return NextResponse.json({
      conversation: {
        id: convo._id,
        otherUser: {
          id: target._id,
          username: target.username,
          name: target.name || '',
          lastActiveAt: target.lastActiveAt || null,
        },
        lastMessageAt: convo.lastMessageAt,
        lastMessagePreview: convo.lastMessagePreview || '',
        muted: (convo.mutedBy || []).some((id) => String(id) === String(user._id)),
      },
    });
  } catch (err) {
    return serverError(err, 'chat/conversations POST');
  }
}
