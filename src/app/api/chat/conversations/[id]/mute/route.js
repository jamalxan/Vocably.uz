import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { NextResponse } from 'next/server';

async function loadConversationForUser(conversationId, userId) {
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}

// G-3 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 G — "Mute: 1 soat / 8 soat / 1 kun /
// doimiy") — ixtiyoriy `durationMs` bilan chaqirilsa muddatli mute (`mutedUntil`),
// aks holda (yoki noto'g'ri/haddan tashqari katta qiymat) doimiy (`mutedBy`).
const MAX_MUTE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 kun — cheksiz o'sib ketmasin

// Faqat so'rovchi userga tegishli — boshqa tomon bu holatni ko'rmaydi va undan
// hech qanday bildirishnoma/belgi olmaydi (jimgina bildirishnomani o'chirish).
export async function POST(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const uid = String(user._id);
    const durationMs = Number(body?.durationMs);

    let mutedUntilIso = null;
    if (Number.isFinite(durationMs) && durationMs > 0 && durationMs <= MAX_MUTE_DURATION_MS) {
      // Muddatli — eski "doimiy" belgi bo'lsa olib tashlanadi (ikkalasi bir vaqtda
      // faol bo'lib qolmasin, isConversationMuted baribir OR bilan tekshiradi,
      // lekin bitta manba toza bo'lgani ma'qul).
      const until = new Date(Date.now() + durationMs);
      convo.mutedUntil.set(uid, until);
      convo.mutedBy = convo.mutedBy.filter((id) => String(id) !== uid);
      mutedUntilIso = until.toISOString();
    } else {
      // Doimiy ("Doimiy" tanlovi — `durationMs` yuborilmaydi).
      if (!convo.mutedBy.some((id) => String(id) === uid)) convo.mutedBy.push(user._id);
      convo.mutedUntil.delete(uid);
    }
    await convo.save();

    return NextResponse.json({ success: true, muted: true, mutedUntil: mutedUntilIso });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/mute POST');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const uid = String(user._id);
    convo.mutedBy = convo.mutedBy.filter((id) => String(id) !== uid);
    convo.mutedUntil.delete(uid);
    await convo.save();

    return NextResponse.json({ success: true, muted: false, mutedUntil: null });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/mute DELETE');
  }
}
