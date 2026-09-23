// TZ-vocably-v2.md §23 (ochiq savol #1) — "Audio fayllar qayerda saqlanadi?"
// Javob: MongoDB'ning o'zi (GridFS) — alohida Blob/S3/R2 xizmati ULANMAYDI.
// GridFS 16MB'dan katta fayllarni bo'laklarga (`chunks`) bo'lib saqlaydi,
// audio fayllar (bir necha MB) uchun bemalol yetarli va loyihada allaqachon
// mavjud MongoDB ulanishidan tashqari hech narsa talab qilmaydi.
//
// `mongoose.connection.db` orqali — alohida MongoClient OCHILMAYDI, mavjud
// (src/lib/db.js) ulanish qayta ishlatiladi.
import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import { connectToDatabase } from '@/lib/db';

const BUCKET_NAME = 'examAudio';

let bucket: any = null;

async function getAudioBucket() {
  await connectToDatabase();
  if (!bucket) {
    bucket = new (mongoose as any).mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
  }
  return bucket;
}

/** Xom audio baytlarni GridFS'ga yozadi, yaratilgan fayl ID'sini (string)
 * qaytaradi. Scripts (seed) va (keyinchalik) admin audio-yuklash oqimi shu
 * funksiyani ishlatadi. */
export async function uploadAudioBuffer(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const audioBucket = await getAudioBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = audioBucket.openUploadStream(filename, { contentType });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(String(uploadStream.id)));
    Readable.from(buffer).pipe(uploadStream);
  });
}

export interface AudioFileMeta {
  id: string;
  length: number;
  contentType: string;
  filename: string;
}

/** Fayl metadatasini (uzunlik, MIME turi) qaytaradi — API route
 * `Content-Length`/`Content-Range` sarlavhalarini shundan hisoblaydi.
 * Topilmasa `null`. */
export async function getAudioFileMeta(fileId: string): Promise<AudioFileMeta | null> {
  if (!mongoose.isValidObjectId(fileId)) return null;
  const audioBucket = await getAudioBucket();
  const files = await audioBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
  const file = files[0];
  if (!file) return null;
  return {
    id: String(file._id),
    length: file.length,
    contentType: file.contentType || 'audio/mpeg',
    filename: file.filename,
  };
}

/** EX-02 (audio-based pronunciation grader, speakingGrader.ts) uchun — butun
 * faylni bir marta xotiraga yig'adi, chunki Gemini `inlineData`si base64
 * qilingan TO'LIQ baytlarni talab qiladi (oqim emas). Pastdagi HTTP download
 * route'i esa faqat baytlarni pipe qiladi, hech qachon buferga yig'maydi —
 * shuning uchun bu yordamchi u yerda ishlatilmaydi. */
export async function downloadAudioBuffer(fileId: string): Promise<Buffer> {
  const stream = await openAudioDownloadStream(fileId);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/** `[start, end]` (ikkalasi ham inklyuziv, HTTP Range semantikasi) berilsa
 * faqat shu baytlar oralig'ini oqib beradi — brauzer `<audio>` elementi
 * odatda `Range` so'rovi yuboradi, buni qo'llab-quvvatlamasak ba'zi
 * brauzerlarda progressiv yuklash/orqaga o'tish sinmasligi mumkin. */
export async function openAudioDownloadStream(fileId: string, range?: { start: number; end: number }): Promise<NodeJS.ReadableStream> {
  const audioBucket = await getAudioBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);
  if (range) {
    // GridFSBucket'ning `end` argumenti EXCLUSIVE — HTTP Range esa INKLYUZIV,
    // shuning uchun +1.
    return audioBucket.openDownloadStream(objectId, { start: range.start, end: range.end + 1 });
  }
  return audioBucket.openDownloadStream(objectId);
}
