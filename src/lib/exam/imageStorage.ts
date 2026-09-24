// Imtihon kontentidagi rasmlar (Writing Task 1 grafigi, savol diagrammasi)
// uchun ombor — Listening audiosi bilan BIR XIL yechim: MongoDB GridFS
// (`audioStorage.ts` izohiga q., §23). Alohida bucket (`examImages`) —
// audio bilan aralashib ketmasin va `/api/exam/audio/[fileId]` route'i
// faqat audio berishda qolsin.
//
// Nega S3/R2 emas: `src/lib/storage/r2.js` (kitob pipeline'i) `R2_*`
// kredensiallarini talab qiladi, ular hali sozlanmagan; admin AI chat orqali
// kontent yuklash esa bugun ishlashi kerak. GridFS mavjud MongoDB
// ulanishidan boshqa hech narsa talab qilmaydi.
import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import { connectToDatabase } from '@/lib/db';

const BUCKET_NAME = 'examImages';

let bucket: any = null;

async function getImageBucket() {
  await connectToDatabase();
  if (!bucket) {
    bucket = new (mongoose as any).mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
  }
  return bucket;
}

export async function uploadImageBuffer(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const imageBucket = await getImageBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = imageBucket.openUploadStream(filename, { contentType });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(String(uploadStream.id)));
    Readable.from(buffer).pipe(uploadStream);
  });
}

export interface ImageFileMeta {
  id: string;
  length: number;
  contentType: string;
  filename: string;
}

export async function getImageFileMeta(fileId: string): Promise<ImageFileMeta | null> {
  if (!mongoose.isValidObjectId(fileId)) return null;
  const imageBucket = await getImageBucket();
  const files = await imageBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
  const file = files[0];
  if (!file) return null;
  return {
    id: String(file._id),
    length: file.length,
    contentType: file.contentType || 'image/png',
    filename: file.filename,
  };
}

export async function openImageDownloadStream(fileId: string): Promise<NodeJS.ReadableStream> {
  const imageBucket = await getImageBucket();
  return imageBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

/** `ListeningPart.audioUrl` bilan bir xil naqsh — kontent hujjatida to'liq,
 * o'zi yetarli URL saqlanadi, klient tomonda hech qanday qo'shimcha
 * o'zgartirish talab qilinmaydi. */
export function buildImageUrl(fileId: string): string {
  return `/api/exam/image/${fileId}`;
}
