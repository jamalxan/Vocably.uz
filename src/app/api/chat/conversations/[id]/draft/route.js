import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { emitEvent } from '@/lib/realtime';
import { loadConversationForUser } from '@/lib/chat/conversationAccess';
import { cleanDraftInput, rawDraftOf, resolveDraftReply, serializeDraft } from '@/lib/chat/draftServer';
import { after, NextResponse } from 'next/server';

// Qoralama (PARITY_PLAN WP6): bir userning bir suhbatdagi yozilgan, lekin yuborilmagan matni (+ javob
// nishoni) serverda — boshqa qurilmasidagi ro'yxat va Composer'da ham ko'rinadi. Faqat egasi o'qiydi/yozadi.
// Vaqt faqat server soati bilan; o'zgarish shu userning boshqa tab/qurilmalariga `draft:update`
// (realtime-server /internal/emit-event, self-push) bilan yetadi — yuborgan qurilma `deviceId` orqali o'zinikini tashlaydi.
const RATE_LIMIT = 60;

export async function GET(req, props) {
  const params = await props.params;
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const convo = await loadConversationForUser(params.id, user._id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi', code: 'not_found' }, { status: 404 });
    const raw = rawDraftOf(convo, user._id);
    const reply = raw?.replyTo ? await resolveDraftReply(convo._id, user._id, raw.replyTo) : null;
    return NextResponse.json({ draft: serializeDraft(raw, reply) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'chat/draft GET');
  }
}

async function writeDraft(req, params, body) {
  const { error, status, user } = await requireChatUser(req);
  if (error) return NextResponse.json({ error }, { status });
  await connectToDatabase();
  const convo = await loadConversationForUser(params.id, user._id);
  if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi', code: 'not_found' }, { status: 404 });

  const input = cleanDraftInput(body);
  if (input.error) return NextResponse.json({ error: input.error, code: 'bad_request' }, { status: 400 });
  if (!(await checkRateLimit(user._id, 'chat-draft', RATE_LIMIT))) {
    return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting.", code: 'rate_limited' }, { status: 429 });
  }

  // Javob nishoni shu suhbatdagi ko'rinadigan xabar bo'lishi shart, aks holda jimgina null.
  const reply = input.replyTo ? await resolveDraftReply(convo._id, user._id, input.replyTo) : null;
  const empty = !input.text.trim() && !reply;
  const raw = { text: empty ? '' : input.text, replyTo: reply ? reply._id : null, updatedAt: new Date() };
  await Conversation.updateOne({ _id: convo._id }, { $set: { [`drafts.${String(user._id)}`]: raw } });

  const draft = serializeDraft(raw, reply);
  const conversationId = String(convo._id);
  after(async () => {
    await emitEvent([user._id], 'draft:update', { conversationId, draft, deviceId: input.deviceId });
  });
  return NextResponse.json({ draft });
}

export async function PUT(req, props) {
  const params = await props.params;
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: "Noto'g'ri so'rov", code: 'bad_request' }, { status: 400 });
    return await writeDraft(req, params, body);
  } catch (err) {
    return serverError(err, 'chat/draft PUT');
  }
}

// DELETE — tombstone yozadi (hujjatdan olib tashlamaydi): boshqa qurilmaning eski keshi qayta tirilmasin.
export async function DELETE(req, props) {
  const params = await props.params;
  try {
    const deviceId = req.nextUrl?.searchParams?.get('deviceId') || null;
    return await writeDraft(req, params, { text: '', replyTo: null, deviceId });
  } catch (err) {
    return serverError(err, 'chat/draft DELETE');
  }
}
