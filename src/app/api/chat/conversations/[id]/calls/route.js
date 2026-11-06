import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Block, User } from '@/lib/models';
import { loadConversationForUser } from '@/lib/chat/conversationAccess';
import { recordCall, notifyRecordedCall } from '@/lib/chat/callRecord';
import { currentPhotoId } from '@/lib/avatars';
import { buildIceServers } from '@/lib/turn';
import { isUserOnline, getUserCallState, emitEvent } from '@/lib/realtime';
import { after, NextResponse } from 'next/server';

const GRANT_TTL_SEC = 60;
const NO_STORE = { 'Cache-Control': 'no-store' };

const json = (body, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });

// Qo'ng'iroq grant'i (docs/chat/CALLS_SPEC.md §6.1). realtime-server'ning DB'si yo'q va
// sessiya JWT'sini ko'rmaydi — shuning uchun "kim kimga qo'ng'iroq qila oladi" degan
// barcha tekshiruv SHU YERDA: a'zolik, ikki tomonlama blok, qo'ng'iroq qilinayotganning
// chatAccess/chatBanned holati, tezlik cheklovi. Natija — 60 s'lik HS256 grant
// (REALTIME_SHARED_SECRET), realtime-server uni socket.userId va payload'ga bog'laydi.
// Grant'da qo'ng'iroq qiluvchining ismi/rasmi ham bor — qabul qiluvchi ekranidagi
// ma'lumot client payload'idan emas, shu imzolangan da'volardan olinadi.
//
// Qo'ng'iroq qilinayotgan foydalanuvchi oflayn (404 callee_offline) yoki boshqa
// qo'ng'iroqda (409 busy) bo'lsa grant berilmaydi — lekin javobsiz qo'ng'iroq yozuvi va
// bildirishnoma (realtime-server invite paytida qiladigan narsa) shu yerda yoziladi,
// tarix bir xil bo'lib qoladi. realtime-server o'z tekshiruvini baribir qiladi (poyga holati).
export async function POST(req, props) {
  const params = await props.params;
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return json({ error }, status);

    const body = await req.json().catch(() => ({}));
    const kind = body?.kind;
    if (kind !== 'audio' && kind !== 'video') {
      return json({ error: "Noto'g'ri qo'ng'iroq turi", code: 'bad_kind' }, 400);
    }

    const secret = process.env.REALTIME_SHARED_SECRET;
    if (!secret || !process.env.NEXT_PUBLIC_REALTIME_URL) {
      return json({ error: 'Server sozlanmagan', code: 'not_configured' }, 503);
    }

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return json({ error: 'Suhbat topilmadi', code: 'not_found' }, 404);

    const otherId = convo.participantIds.find((id) => String(id) !== String(user._id));
    if (!otherId) return json({ error: 'Suhbat topilmadi', code: 'not_found' }, 404);

    const blocked = await Block.findOne({
      $or: [
        { blockerId: user._id, blockedId: otherId },
        { blockerId: otherId, blockedId: user._id },
      ],
    }).lean();
    if (blocked) return json({ error: "Qo'ng'iroq qilib bo'lmadi", code: 'blocked' }, 403);

    const [callee, me] = await Promise.all([
      User.findById(otherId).select('username name chatAccess chatBanned photos photoVisibility').lean(),
      User.findById(user._id).select('photos photoVisibility').lean(),
    ]);
    if (!callee || !callee.chatAccess || callee.chatBanned) {
      return json({ error: "Qo'ng'iroq qilib bo'lmadi", code: 'callee_unavailable' }, 403);
    }

    if (!(await checkRateLimit(user._id, 'call-invite', 10))) {
      return json({ error: "Juda ko'p qo'ng'iroq. Biroz kuting.", code: 'rate_limited' }, 429);
    }

    const callId = crypto.randomUUID();
    const callerId = String(user._id);
    const calleeId = String(otherId);
    const conversationId = String(convo._id);

    // Oflayn/band: grant yo'q, lekin javobsiz qo'ng'iroq yoziladi (`null` — noma'lum, bloklamaymiz).
    const [online, calleeCall] = await Promise.all([isUserOnline(calleeId), getUserCallState(calleeId)]);
    const unreachable = online === false ? 'callee_offline' : calleeCall?.inCall ? 'busy' : null;
    if (unreachable) {
      const t = new Date();
      const value = {
        callId,
        conversationId,
        callerId,
        calleeId,
        kind,
        outcome: unreachable === 'busy' ? 'busy' : 'missed',
        durationSec: null,
        startedAt: t,
        acceptedAt: null,
        endedAt: t,
        answered: false,
      };
      const result = await recordCall(value);
      if (result.message) {
        after(async () => {
          // Realtime-server invite'dagi bilan bir xil: yozuv ikkala tomonga (o'zining boshqa tablariga ham).
          await emitEvent([callerId, calleeId], 'message:new', { conversationId, message: result.message });
          if (result.created) await notifyRecordedCall({ convo: result.convo, value });
        });
      }
      return unreachable === 'busy'
        ? json({ error: 'Foydalanuvchi band', code: 'busy', callId, message: result.message || null }, 409)
        : json({ error: 'Foydalanuvchi oflayn', code: 'callee_offline', callId, message: result.message || null }, 404);
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const grant = jwt.sign(
      {
        scope: 'call',
        callId,
        conversationId,
        callerId,
        calleeId,
        kind,
        from: {
          userId: callerId,
          username: user.username || null,
          name: user.name || null,
          // Qabul qiluvchi ko'ra oladigan rasm (photoVisibility; suhbat bor, blok yo'q).
          photoId: currentPhotoId(me, { hasConversation: true }),
        },
      },
      secret,
      { algorithm: 'HS256', expiresIn: GRANT_TTL_SEC }
    );
    const ice = buildIceServers(callerId);
    const nickname = convo.nicknames?.get ? convo.nicknames.get(callerId) || null : convo.nicknames?.[callerId] || null;

    return json({
      callId,
      grant,
      expiresAt: new Date((nowSec + GRANT_TTL_SEC) * 1000).toISOString(),
      iceServers: ice.iceServers,
      iceTtlSec: ice.ttlSec,
      ttl: ice.ttlSec,
      turn: ice.turn,
      peer: {
        id: calleeId,
        username: callee.username || null,
        name: callee.name || null,
        nickname,
        photoId: currentPhotoId(callee, { hasConversation: true }),
      },
    });
  } catch (err) {
    return serverError(err, 'chat/calls POST');
  }
}
