// Merging a freshly polled page of messages into what the chat already shows.
// The poll returns the newest 50 messages (oldest → newest). Replacing the
// list outright used to drop two things the user can see:
//   - bubbles still being sent (or failed, waiting for "Retry"), which the
//     server doesn't know yet — they flickered away every poll;
//   - older messages loaded by scrolling up, which fell off the 50-item page.

const idOf = (m) => String(m.id || m._id);
/** Bubbles the server does not know yet: being uploaded, being sent, or waiting for "Retry". */
export const isPendingStatus = (s) => s === 'sending' || s === 'failed' || s === 'uploading';

/**
 * A message was deleted "for everyone": turn it into a tombstone (or drop it
 * when `silently`) and blank out reply quotes that point at it.
 * Returns `list` itself when nothing changed.
 */
export function applyDeletedForEveryone(list, messageId, silently) {
  const target = String(messageId);
  let changed = false;
  const out = [];
  for (const m of list) {
    if (idOf(m) === target) {
      changed = true;
      if (!silently) out.push({ ...m, deletedForEveryone: true, text: '', media: null, stickerId: null });
    } else if (m.replyTo && String(m.replyTo.messageId) === target && !m.replyTo.deleted) {
      changed = true;
      out.push({ ...m, replyTo: { ...m.replyTo, text: '', deleted: true } });
    } else {
      out.push(m);
    }
  }
  return changed ? out : list;
}

/** @returns the merged list, oldest → newest */
export function mergePolledMessages(prev, page) {
  if (!page.length) return prev.filter((m) => isPendingStatus(m._status));
  const pageIds = new Set(page.map(idOf));
  const pageClientIds = new Set(page.map((m) => m.clientMessageId).filter(Boolean));
  const firstAt = new Date(page[0].createdAt).getTime();

  const older = prev.filter(
    (m) => !m._status && !pageIds.has(idOf(m)) && new Date(m.createdAt).getTime() < firstAt
  );
  const pending = prev.filter((m) => isPendingStatus(m._status) && !pageClientIds.has(m.clientMessageId));
  // Keep the local clientMessageId on messages the server now returns, so the
  // in-flight request can still find and settle its bubble.
  const prevByClient = new Map(prev.filter((m) => m.clientMessageId).map((m) => [String(m.clientMessageId), m]));
  const merged = page.map((m) => {
    const local = m.clientMessageId && prevByClient.get(String(m.clientMessageId));
    if (!local) return m;
    const out = local._status === 'sent' ? { ...m, _status: 'sent' } : m;
    // Keep the local preview (object URL) so a just-sent photo never flashes to a blank tile.
    return local._localUrl ? { ...out, _localUrl: local._localUrl } : out;
  });
  return [...older, ...merged, ...pending];
}
