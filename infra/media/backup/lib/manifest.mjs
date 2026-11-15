// The manifest is the index of the backup: which bucket object lives in which channel messages.
//   objects: { [key]: { size, etag, sha256, contentType, parts: [{ fileId, messageId }], at } }
//   trash:   [{ key, parts, deletedAt }]   — deleted or replaced objects, kept RETENTION days, never restored
// It is the one thing a restore cannot do without, so after every change it is sealed, uploaded to the channel
// and pinned: bot token + channel id + key are then enough to rebuild the bucket from nothing.
import { gzipSync, gunzipSync } from 'node:zlib';
import { open, seal } from './crypto.mjs';

export const MANIFEST_VERSION = 1;
const MANIFEST_AAD = 'vocably-media-backup/manifest';

export const emptyManifest = (bucket) => ({ version: MANIFEST_VERSION, bucket, updatedAt: null, objects: {}, trash: [] });

export function packManifest(manifest, key) {
  return seal(key, gzipSync(Buffer.from(JSON.stringify(manifest))), MANIFEST_AAD);
}

export function unpackManifest(sealed, key) {
  const manifest = JSON.parse(gunzipSync(open(key, sealed, MANIFEST_AAD)).toString());
  if (manifest?.version !== MANIFEST_VERSION || typeof manifest.objects !== 'object') throw new Error('unknown manifest format');
  manifest.trash ||= [];
  return manifest;
}

const same = (entry, obj) => entry.size === obj.size && entry.etag === obj.etag;

/**
 * Compares the bucket listing with the manifest.
 *   upload  — objects that are new or whose content changed, oldest first (at most `maxUploads`)
 *   pending — how many still wait after this run
 *   gone    — keys in the manifest that are no longer in the bucket
 *   massDeletion — true when so many objects vanished at once that it looks like data loss, not users deleting
 *                  messages. The caller must then leave the backup untouched: a wiped bucket must never wipe its
 *                  own backup.
 */
export function planScan(manifest, listing, { maxUploads = 25, massDeletionMin = 20, massDeletionShare = 0.2 } = {}) {
  const listed = new Map(listing.map((o) => [o.key, o]));
  const changed = listing
    .filter((o) => !manifest.objects[o.key] || !same(manifest.objects[o.key], o))
    .sort((a, b) => String(a.lastModified).localeCompare(String(b.lastModified)) || a.key.localeCompare(b.key));
  const live = Object.keys(manifest.objects);
  const gone = live.filter((key) => !listed.has(key));
  const massDeletion = gone.length >= massDeletionMin && gone.length >= live.length * massDeletionShare;
  return { upload: changed.slice(0, maxUploads), pending: Math.max(0, changed.length - maxUploads), gone, massDeletion };
}

/** Moves an object's parts to the trash (deleted from the bucket, or about to be replaced by a new version). */
export function trashObject(manifest, key, now = new Date()) {
  const entry = manifest.objects[key];
  if (!entry) return;
  manifest.trash.push({ key, parts: entry.parts, deletedAt: now.toISOString() });
  delete manifest.objects[key];
}

/** Trash entries older than `retentionDays`: removed from the manifest and returned so their messages can be deleted. */
export function takeExpiredTrash(manifest, { retentionDays = 30, now = new Date() } = {}) {
  const cutoff = now.getTime() - retentionDays * 86400000;
  const expired = manifest.trash.filter((t) => new Date(t.deletedAt).getTime() <= cutoff);
  if (expired.length) manifest.trash = manifest.trash.filter((t) => new Date(t.deletedAt).getTime() > cutoff);
  return expired;
}

export function stats(manifest) {
  const entries = Object.values(manifest.objects);
  return { objects: entries.length, bytes: entries.reduce((n, e) => n + e.size, 0), parts: entries.reduce((n, e) => n + e.parts.length, 0), trash: manifest.trash.length };
}
