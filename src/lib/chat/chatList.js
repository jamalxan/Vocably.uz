// Chat list rules (Telegram parity): pinned first, then by last activity; archived chats live in
// their own folder; a new message updates the row in place (no full reload). Pure; tested in
// chatList.test.js.

const t = (d) => (d ? new Date(d).getTime() : 0);

/** Splits the raw list into what the main list shows and what the archive folder shows. */
export function partitionConversations(list) {
  const main = [];
  const archived = [];
  for (const c of list || []) (c.archived ? archived : main).push(c);
  const byActivity = (a, b) => t(b.lastMessageAt) - t(a.lastMessageAt);
  main.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || byActivity(a, b));
  archived.sort(byActivity);
  return { main, archived, archivedUnread: archived.reduce((s, c) => s + (c.unreadCount || 0), 0) };
}

/**
 * A message arrived or was sent in `conversationId`: move the row up with the new preview.
 * `incoming` bumps the unread counter; a row we don't know is left for the next full reload.
 */
export function applyNewMessageToList(list, { conversationId, preview, createdAt, incoming, unarchive = true }) {
  const id = String(conversationId);
  let found = false;
  const next = (list || []).map((c) => {
    if (String(c.id) !== id) return c;
    found = true;
    return {
      ...c,
      lastMessageAt: createdAt,
      lastMessagePreview: preview,
      unreadCount: incoming ? (c.unreadCount || 0) + 1 : c.unreadCount || 0,
      archived: incoming && unarchive ? false : c.archived,
    };
  });
  return found ? next : list;
}

/** Local flag updates after a bulk action (the server did the same). */
export function applyBulkAction(list, ids, action) {
  const set = new Set((ids || []).map(String));
  if (action === 'delete') return (list || []).filter((c) => !set.has(String(c.id)));
  return (list || []).map((c) => {
    if (!set.has(String(c.id))) return c;
    switch (action) {
      case 'archive':
        return { ...c, archived: true, pinned: false };
      case 'unarchive':
        return { ...c, archived: false };
      case 'pin':
        return { ...c, pinned: true };
      case 'unpin':
        return { ...c, pinned: false };
      case 'mute':
        return { ...c, muted: true, mutedUntil: null };
      case 'unmute':
        return { ...c, muted: false, mutedUntil: null };
      case 'read':
        return { ...c, unreadCount: 0 };
      default:
        return c;
    }
  });
}

/** Row preview: a draft wins over the last message, like Telegram's red "Draft:". */
export function rowPreview(conversation, draft) {
  if (draft?.text?.trim()) return { kind: 'draft', text: draft.text.trim().slice(0, 80) };
  return { kind: 'message', text: conversation.lastMessagePreview || '' };
}
