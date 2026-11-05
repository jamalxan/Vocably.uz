import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { markConversationRead } from '@/lib/chatRead';
import { NextResponse } from 'next/server';

const ACTIONS = new Set(['delete', 'archive', 'unarchive', 'read', 'mute', 'unmute', 'pin', 'unpin']);
const MAX_IDS = 100;

// Telegram-style multi-select on the chat list: one request for the whole selection.
// POST { ids: string[], action, forEveryone?: boolean }. Each id is checked for membership; ids that
// are not mine are skipped (reported in `skipped`), never an error for the whole batch.
export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    if (!(await checkRateLimit(user._id, 'chat-bulk', 30))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map(String))].filter((id) => /^[a-f0-9]{24}$/.test(id)).slice(0, MAX_IDS) : [];
    if (!ACTIONS.has(action) || !ids.length) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

    const convos = await Conversation.find({ _id: { $in: ids }, participantIds: user._id }).lean();
    const mine = convos.map((c) => String(c._id));
    const skipped = ids.filter((id) => !mine.includes(id));
    if (!mine.length) return NextResponse.json({ done: [], skipped });

    const now = new Date();
    if (action === 'delete') {
      const forEveryone = !!body.forEveryone;
      for (const c of convos) {
        const otherId = c.participantIds.find((id) => String(id) !== String(user._id));
        const targets = forEveryone ? [user._id, otherId] : [user._id];
        await Message.updateMany({ conversationId: c._id }, { $addToSet: { deletedFor: { $each: targets } } });
        const set = {};
        targets.forEach((id) => {
          set[`clearedAt.${String(id)}`] = now;
        });
        await Conversation.updateOne({ _id: c._id }, { $addToSet: { hiddenFor: { $each: targets } }, $pull: { archivedBy: user._id, pinnedBy: user._id }, $set: set });
      }
    } else if (action === 'archive' || action === 'unarchive') {
      await Conversation.updateMany({ _id: { $in: mine } }, action === 'archive' ? { $addToSet: { archivedBy: user._id }, $pull: { pinnedBy: user._id } } : { $pull: { archivedBy: user._id } });
    } else if (action === 'pin' || action === 'unpin') {
      await Conversation.updateMany({ _id: { $in: mine } }, action === 'pin' ? { $addToSet: { pinnedBy: user._id } } : { $pull: { pinnedBy: user._id } });
    } else if (action === 'mute' || action === 'unmute') {
      await Conversation.updateMany({ _id: { $in: mine } }, action === 'mute' ? { $addToSet: { mutedBy: user._id } } : { $pull: { mutedBy: user._id }, $unset: { [`mutedUntil.${String(user._id)}`]: '' } });
    } else if (action === 'read') {
      await Promise.all(
        convos.map((c) => {
          const otherId = c.participantIds.find((id) => String(id) !== String(user._id));
          return otherId ? markConversationRead(c._id, user._id, otherId) : null;
        })
      );
    }
    return NextResponse.json({ done: mine, skipped });
  } catch (err) {
    return serverError(err, 'chat/conversations/bulk POST');
  }
}
