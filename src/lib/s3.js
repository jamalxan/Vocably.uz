import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// MinIO (self-hosted, S3-mos) yoki haqiqiy AWS S3 bilan ishlaydi — faqat
// S3_ENDPOINT/S3_REGION o'zgaradi, kod o'zgarmaydi (docs/ chat plani, "Arxitektura
// qarorlari" §1). `forcePathStyle` MinIO uchun majburiy (virtual-hosted-style emas).
let client = null;
function getClient() {
  if (client) return client;
  if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
    throw new Error('S3_ENDPOINT/S3_ACCESS_KEY/S3_SECRET_KEY sozlanmagan.');
  }
  client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });
  return client;
}

const BUCKET = () => {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET sozlanmagan.');
  return process.env.S3_BUCKET;
};

// Ruxsat etilgan media turlari va har biriga maksimal hajm (baytlarda).
// docs/ chat plani, "Xavfsizlik" bo'limidagi limitlar bilan bir xil.
export const ALLOWED_MEDIA = {
  image: { mimePrefix: 'image/', maxBytes: 10 * 1024 * 1024 },
  video: { mimePrefix: 'video/', maxBytes: 60 * 1024 * 1024 },
  voice: { mimePrefix: 'audio/', maxBytes: 15 * 1024 * 1024 },
  file: { mimePrefix: null, maxBytes: 25 * 1024 * 1024 }, // istalgan mimeType, faqat hajm cheklanadi
};

export function validateUpload(type, mimeType, size) {
  const rule = ALLOWED_MEDIA[type];
  if (!rule) return 'Noto\'g\'ri media turi';
  if (rule.mimePrefix && !mimeType?.startsWith(rule.mimePrefix)) return 'Fayl turi mos kelmadi';
  if (!size || size <= 0 || size > rule.maxBytes) return 'Fayl hajmi ruxsat etilgan chegaradan katta';
  return null;
}

// Kalit hech qachon foydalanuvchi kiritgan fayl nomidan yasalmaydi (path traversal /
// taxmin qilinadigan nomlarning oldini olish uchun) — faqat random UUID + conversationId.
export function buildObjectKey(conversationId, type, mimeType) {
  const ext = (mimeType.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 8);
  return `conversations/${conversationId}/${type}/${crypto.randomUUID()}.${ext}`;
}

export async function presignUpload(key, mimeType) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: mimeType });
  return getSignedUrl(getClient(), cmd, { expiresIn: 300 }); // 5 daqiqa
}

export async function presignDownload(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET(), Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn: 300 });
}

export async function objectExists(key) {
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: BUCKET(), Key: key }));
    return true;
  } catch {
    return false;
  }
}
