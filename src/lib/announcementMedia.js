import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import { connectToDatabase } from '@/lib/db';

// Media attached to an announcement from the admin panel — MongoDB GridFS,
// like payment receipts (src/lib/payments/receiptStorage.js). The Vercel
// request body limit is ~4.5 MB, hence the 4 MB cap; larger files (long
// videos, voice notes) go through the Telegram bot instead, which keeps them
// on Telegram's side (file_id) and needs no upload here at all.
const BUCKET = 'announcementMedia';
let bucket = null;

async function getBucket() {
  await connectToDatabase();
  if (!bucket) bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
  return bucket;
}

export const MEDIA_MAX_BYTES = 4 * 1024 * 1024;

/** Browser MIME type → Telegram media kind. Anything else is sent as a document. */
export function mediaKindFor(mime) {
  if (!mime) return 'document';
  if (['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return 'photo';
  if (mime === 'image/gif') return 'animation';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'audio/ogg') return 'voice';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
}

export async function saveAnnouncementMedia(buffer, filename, contentType) {
  const b = await getBucket();
  return new Promise((resolve, reject) => {
    const up = b.openUploadStream(filename, { contentType });
    up.on('error', reject);
    up.on('finish', () => resolve(String(up.id)));
    Readable.from(buffer).pipe(up);
  });
}

export async function readAnnouncementMedia(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return null;
  const b = await getBucket();
  const id = new mongoose.Types.ObjectId(fileId);
  const [file] = await b.find({ _id: id }).toArray();
  if (!file) return null;
  const chunks = [];
  for await (const c of b.openDownloadStream(id)) chunks.push(c);
  return { buffer: Buffer.concat(chunks), contentType: file.contentType || 'application/octet-stream', filename: file.filename };
}
