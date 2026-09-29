import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import { connectToDatabase } from '@/lib/db';

// Payment receipts (screenshots / PDF) in MongoDB GridFS — same approach as
// exam images (src/lib/exam/imageStorage.ts): needs nothing beyond the
// database, and receipts are private (served only to the owner and admins).
const BUCKET = 'paymentReceipts';
let bucket = null;

async function getBucket() {
  await connectToDatabase();
  if (!bucket) bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
  return bucket;
}

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
export const RECEIPT_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };

/** Checks the file's real signature, not just the declared type. */
export function receiptMagicMatches(mime, bytes) {
  const b = bytes;
  if (mime === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (mime === 'image/png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (mime === 'image/webp') return String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP';
  if (mime === 'application/pdf') return String.fromCharCode(...b.slice(0, 4)) === '%PDF';
  return false;
}

export async function saveReceipt(buffer, filename, contentType) {
  const b = await getBucket();
  return new Promise((resolve, reject) => {
    const up = b.openUploadStream(filename, { contentType });
    up.on('error', reject);
    up.on('finish', () => resolve(String(up.id)));
    Readable.from(buffer).pipe(up);
  });
}

export async function readReceipt(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return null;
  const b = await getBucket();
  const id = new mongoose.Types.ObjectId(fileId);
  const [file] = await b.find({ _id: id }).toArray();
  if (!file) return null;
  const chunks = [];
  for await (const c of b.openDownloadStream(id)) chunks.push(c);
  return { buffer: Buffer.concat(chunks), contentType: file.contentType || 'application/octet-stream' };
}
