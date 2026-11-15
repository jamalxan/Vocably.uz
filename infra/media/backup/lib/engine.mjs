// Backup and restore logic, free of process/env concerns so it can be tested with an in-memory bucket and channel.
import { open, partAad, seal, sha256hex, split, SEAL_OVERHEAD } from './crypto.mjs';
import { emptyManifest, packManifest, planScan, takeExpiredTrash, trashObject, unpackManifest } from './manifest.mjs';
import { TG_DOWNLOAD_MAX } from './telegram.mjs';

// A sealed part must stay under Telegram's 20 MB download limit, or it could be stored but never read back.
export const DEFAULT_PART_BYTES = 19 * 1024 * 1024;
const MANIFEST_PREFIX = 'manifest-';

/** The manifest pinned in the channel: { manifest, messageId }, or null when the channel has none. */
export async function fetchPinnedManifest({ tg, chatId, key }) {
  const pinned = await tg.pinnedDocument(chatId);
  if (!pinned || !pinned.fileName.startsWith(MANIFEST_PREFIX)) return null;
  return { manifest: unpackManifest(await tg.download(pinned.fileId), key), messageId: pinned.messageId };
}

/**
 * State to start from: the local state file; without one (a rebuilt server) the manifest pinned in the channel,
 * so an existing backup is continued instead of being uploaded a second time; otherwise an empty manifest.
 */
export async function loadState({ tg, chatId, key, bucket, readState }) {
  const local = await readState();
  if (local?.manifest) return { ...local, source: 'local' };
  const pinned = await fetchPinnedManifest({ tg, chatId, key });
  if (pinned) return { manifest: pinned.manifest, manifestMessageId: pinned.messageId, dirty: false, source: 'channel' };
  return { manifest: emptyManifest(bucket), manifestMessageId: null, dirty: false, source: 'empty' };
}

/**
 * One pass: upload what is new or changed, move what was deleted to the trash, purge expired trash, publish the
 * manifest. `state` ({ manifest, manifestMessageId, dirty }) is mutated; `save(state)` persists it locally.
 */
export async function runBackup({ s3, tg, chatId, key, state, save = async () => {}, partBytes = DEFAULT_PART_BYTES, maxUploads = 25, retentionDays = 30, now = () => new Date(), pause = async () => {} }) {
  if (partBytes + SEAL_OVERHEAD > TG_DOWNLOAD_MAX) throw new Error('part size exceeds what Telegram lets a bot download');
  const { manifest } = state;
  const plan = planScan(manifest, await s3.list(), { maxUploads });
  const report = { uploaded: 0, uploadedBytes: 0, trashed: 0, purged: 0, pending: plan.pending, massDeletion: plan.massDeletion, gone: plan.gone.length, failed: [], published: false };

  for (const obj of plan.upload) {
    const parts = [];
    try {
      const got = await s3.get(obj.key);
      if (!got) continue; // deleted between the listing and now
      const chunks = split(got.body, partBytes);
      const name = sha256hex(obj.key).slice(0, 16); // file names in the channel say nothing about the object
      for (let i = 0; i < chunks.length; i++) {
        parts.push(await tg.sendDocument(chatId, seal(key, chunks[i], partAad(obj.key, i, chunks.length)), `${name}.${i}`));
        await pause();
      }
      if (manifest.objects[obj.key]) trashObject(manifest, obj.key, now()); // the previous version
      manifest.objects[obj.key] = { size: obj.size, etag: obj.etag, sha256: sha256hex(got.body), contentType: got.contentType, parts, at: now().toISOString() };
      report.uploaded += 1;
      report.uploadedBytes += got.body.length;
    } catch (err) {
      // Parts already sent for this object are orphans: remember them so the purge removes them later.
      if (parts.length) manifest.trash.push({ key: obj.key, parts, deletedAt: now().toISOString() });
      report.failed.push({ key: obj.key, error: err.message });
    }
    state.dirty = true;
    await save(state); // after every object: a crash must not lose what is already in the channel
  }

  // A bucket that suddenly lost a large share of its objects is data loss, not users deleting messages: the
  // backup is left exactly as it is, and the caller raises the alarm.
  if (!plan.massDeletion) {
    for (const key_ of plan.gone) {
      trashObject(manifest, key_, now());
      report.trashed += 1;
      state.dirty = true;
    }
  }

  for (const item of takeExpiredTrash(manifest, { retentionDays, now: now() })) {
    for (const part of item.parts) {
      await tg.deleteMessage(chatId, part.messageId).catch(() => {}); // the blob is sealed; a leftover is harmless
      await pause();
    }
    report.purged += 1;
    state.dirty = true;
  }

  if (state.dirty) {
    manifest.updatedAt = now().toISOString();
    await save(state);
    const sealed = packManifest(manifest, key);
    if (sealed.length > TG_DOWNLOAD_MAX) throw new Error('the manifest has outgrown one Telegram document; it must be sharded');
    const sent = await tg.sendDocument(chatId, sealed, `${MANIFEST_PREFIX}${now().getTime()}.bin`);
    await tg.pin(chatId, sent.messageId);
    const previous = state.manifestMessageId;
    state.manifestMessageId = sent.messageId;
    state.dirty = false;
    await save(state);
    if (previous) await tg.deleteMessage(chatId, previous).catch(() => {});
    report.published = true;
  }
  return report;
}

/** Downloads, decrypts and verifies one object from the channel. */
export async function readObject({ tg, key, objectKey, entry }) {
  const chunks = [];
  for (let i = 0; i < entry.parts.length; i++) {
    chunks.push(open(key, await tg.download(entry.parts[i].fileId), partAad(objectKey, i, entry.parts.length)));
  }
  const body = Buffer.concat(chunks);
  if (body.length !== entry.size || sha256hex(body) !== entry.sha256) throw new Error(`checksum mismatch for ${objectKey}`);
  return body;
}

/**
 * Restores objects from the channel into a bucket. By default only what the bucket is missing (or holds with a
 * different size) is written; `force` rewrites everything; `check` writes nothing and only proves the objects
 * can be read back intact (`sample` limits it to that many random objects).
 */
export async function restore({ s3, tg, key, manifest, prefix = '', force = false, check = false, sample = 0, onProgress = () => {}, random = Math.random }) {
  let keys = Object.keys(manifest.objects).filter((k) => k.startsWith(prefix)).sort();
  if (check && sample > 0 && sample < keys.length) {
    keys = keys.map((k) => [random(), k]).sort((a, b) => a[0] - b[0]).slice(0, sample).map((x) => x[1]);
  }
  const existing = check || force ? new Map() : new Map((await s3.list(prefix)).map((o) => [o.key, o]));
  const report = { total: keys.length, restored: 0, verified: 0, skipped: 0, bytes: 0, failed: [] };
  for (const objectKey of keys) {
    const entry = manifest.objects[objectKey];
    if (existing.get(objectKey)?.size === entry.size) {
      report.skipped += 1;
      continue;
    }
    try {
      const body = await readObject({ tg, key, objectKey, entry });
      if (check) report.verified += 1;
      else {
        await s3.put(objectKey, body, entry.contentType);
        report.restored += 1;
      }
      report.bytes += body.length;
    } catch (err) {
      report.failed.push({ key: objectKey, error: err.message });
    }
    onProgress(report);
  }
  return report;
}
