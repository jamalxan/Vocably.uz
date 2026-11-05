// Albums in the message list (Telegram parity): consecutive messages from the same sender with the
// same `albumId` are rendered as one grid bubble. Pure; tested in albums.test.js.

/**
 * Groups a flat, oldest→newest message list into render items:
 *   { kind: 'message', message } | { kind: 'album', id, messages, senderId, createdAt }
 */
export function groupAlbums(messages) {
  const out = [];
  let i = 0;
  while (i < messages.length) {
    const m = messages[i];
    const albumId = m.albumId && !m.deletedForEveryone ? m.albumId : null;
    if (!albumId) {
      out.push({ kind: 'message', message: m });
      i++;
      continue;
    }
    const group = [m];
    let j = i + 1;
    while (j < messages.length && messages[j].albumId === albumId && String(messages[j].senderId) === String(m.senderId) && !messages[j].deletedForEveryone) {
      group.push(messages[j]);
      j++;
    }
    if (group.length === 1) out.push({ kind: 'message', message: m });
    else out.push({ kind: 'album', id: `album-${albumId}-${m.id || m._id}`, messages: group, senderId: m.senderId, createdAt: group[group.length - 1].createdAt });
    i = j;
  }
  return out;
}

/**
 * Grid rows for n tiles, Telegram-like: 1 → [1]; 2 → [2]; 3 → [1,2]; 4 → [2,2]; 5 → [2,3];
 * 6 → [3,3]; 7 → [2,2,3]; 8 → [2,3,3]; 9 → [3,3,3]; 10 → [2,2,3,3].
 */
export function albumRows(n) {
  const table = { 1: [1], 2: [2], 3: [1, 2], 4: [2, 2], 5: [2, 3], 6: [3, 3], 7: [2, 2, 3], 8: [2, 3, 3], 9: [3, 3, 3], 10: [2, 2, 3, 3] };
  if (table[n]) return table[n];
  const rows = [];
  let left = n;
  while (left > 0) {
    const take = Math.min(3, left);
    rows.push(take);
    left -= take;
  }
  return rows;
}

/** The caption of an album is the text of its first message (Telegram keeps one caption per album). */
export function albumCaption(messages) {
  return messages.find((m) => m.text)?.text || '';
}
