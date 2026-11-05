import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { NextResponse } from 'next/server';

// Per-user chat flags (Telegram parity): PATCH { archived?: boolean, pinned?: boolean }.
// Only this user's view changes — the other side never sees archive/pin state.
export async function PATCH(req, props) {
  const params = await props.params;
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const convo = await Conversation.findById(params.id).select('participantIds archivedBy pinnedBy').lean();
    if (!convo || !convo.participantIds.some((id) => String(id) === String(user._id))) {
      return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const add = {};
    const pull = {};
    if (typeof body.archived === 'boolean') (body.archived ? add : pull).archivedBy = user._id;
    if (typeof body.pinned === 'boolean') (body.pinned ? add : pull).pinnedBy = user._id;
    if (!Object.keys(add).length && !Object.keys(pull).length) return NextResponse.json({ error: "O'zgartiriladigan maydon yo'q" }, { status: 400 });
    const update = {};
    if (Object.keys(add).length) update.$addToSet = add;
    if (Object.keys(pull).length) update.$pull = pull;
    await Conversation.updateOne({ _id: convo._id }, update);
    const fresh = await Conversation.findById(convo._id).select('archivedBy pinnedBy').lean();
    return NextResponse.json({
      archived: (fresh.archivedBy || []).some((id) => String(id) === String(user._id)),
      pinned: (fresh.pinnedBy || []).some((id) => String(id) === String(user._id)),
    });
  } catch (err) {
    return serverError(err, 'chat/conversations/[id]/state PATCH');
  }
}
