// Picking files for a message (Telegram parity): many at once, grouped into an album when they are
// photos/videos sent "as media". Pure helpers; the Composer does the browser part.

export const ATTACH = {
  maxPerMessage: 10,
  maxBytes: { image: 10 * 1024 * 1024, video: 60 * 1024 * 1024, file: 25 * 1024 * 1024, voice: 15 * 1024 * 1024 },
};

export function kindOf(file, { asFile = false } = {}) {
  if (asFile) return 'file';
  const t = String(file?.type || '');
  if (t.startsWith('image/') && t !== 'image/svg+xml') return 'image';
  if (t.startsWith('video/')) return 'video';
  return 'file';
}

/**
 * Splits picked files into accepted attachments and rejections.
 * @returns {{ accepted: { id, file, type, name, size }[], rejected: { file, reason: 'too_big'|'too_many' }[] }}
 */
export function stageFiles(files, { existingCount = 0, asFile = false, makeId = defaultId } = {}) {
  const accepted = [];
  const rejected = [];
  for (const file of files || []) {
    if (!file) continue;
    if (existingCount + accepted.length >= ATTACH.maxPerMessage) {
      rejected.push({ file, reason: 'too_many' });
      continue;
    }
    const type = kindOf(file, { asFile });
    if (file.size > ATTACH.maxBytes[type]) {
      rejected.push({ file, reason: 'too_big' });
      continue;
    }
    accepted.push({ id: makeId(), file, type, name: file.name || '', size: file.size });
  }
  return { accepted, rejected };
}

/** Album = 2+ image/video attachments sent together. Files never join an album. */
export function albumGroups(attachments) {
  const isMedia = (a) => a.type === 'image' || a.type === 'video';
  const media = attachments.filter(isMedia);
  const rest = attachments.filter((a) => !isMedia(a)); // files, voice notes
  const groups = [];
  for (let i = 0; i < media.length; i += 10) groups.push(media.slice(i, i + 10));
  return { albums: groups.filter((g) => g.length >= 2), singles: [...groups.filter((g) => g.length === 1).flat(), ...rest] };
}

export function defaultId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a${Date.now()}${Math.random().toString(16).slice(2)}`;
}

/** Clipboard / drop event → File[] (images from screenshots included). */
export function filesFromDataTransfer(dt) {
  if (!dt) return [];
  if (dt.files?.length) return Array.from(dt.files);
  return Array.from(dt.items || [])
    .filter((it) => it.kind === 'file')
    .map((it) => it.getAsFile())
    .filter(Boolean);
}
