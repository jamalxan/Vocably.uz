import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §4 — Cloudflare R2, chat
// funksiyasining `src/lib/s3.js`dan ATAYLAB ALOHIDA: boshqa bucket/hisob
// (`R2_*` env o'zgaruvchilari, `S3_*` emas), boshqa maqsad (kitob/audio/
// rasm manbasi, imtihon media'si emas) va TZ §4.2'dagi o'z kalit tuzilmasi
// bilan. R2 S3-mos bo'lgani uchun bir xil `@aws-sdk/client-s3` ishlatiladi
// (bu paket allaqachon o'rnatilgan — chat media uchun ham shu ishlatiladi).
//
// MUHIM — bu sessiyada tekshirib bo'lmaydi: sandbox'da tarmoq yo'q, R2
// hisobi/kalitlari hali sozlanmagan. Kod `src/lib/s3.js`dagi allaqachon
// productionda ishlayotgan bir xil naqsh bo'yicha yozilgan (presigned PUT/GET,
// forcePathStyle, xuddi shu xatolik ishlov berish) — shuning uchun past
// xavfli, lekin `R2_ENDPOINT`/`R2_ACCESS_KEY`/`R2_SECRET_KEY`/`R2_BUCKET`
// sozlanib, kamida bitta haqiqiy yuklash sinalmaguncha "tasdiqlangan" deb
// hisoblanmasin.
let client = null;
function getClient() {
  if (client) return client;
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY) {
    throw new Error('R2_ENDPOINT/R2_ACCESS_KEY/R2_SECRET_KEY sozlanmagan.');
  }
  client = new S3Client({
    endpoint: process.env.R2_ENDPOINT,
    region: process.env.R2_REGION || 'auto', // Cloudflare R2 uchun standart
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY,
      secretAccessKey: process.env.R2_SECRET_KEY,
    },
  });
  return client;
}

const BUCKET = () => {
  if (!process.env.R2_BUCKET) throw new Error('R2_BUCKET sozlanmagan.');
  return process.env.R2_BUCKET;
};

// TZ §4.3 — ruxsat etilgan manba fayl turlari va maksimal hajm. Bular kitob/
// audio MANBASI uchun (chat media'nikidan farqli, kattaroq — kitob PDF'i
// ~35MB, audio ~100MB bo'lishi mumkin).
//
// §50.2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — 'docx' PDF bilan BIR XIL
// qoida bilan ("bitta kitobga bitta manba hujjat") qo'shildi. Qaysi format
// ekanini yakuniy hal qiluvchi mantiq — `src/lib/contentAgent/sourceFormat.ts`
// (`detectSourceFormat`) — bu yerda faqat MIME ro'yxati, chunki
// `validateSourceUpload` `kind`ni chaqiruvchidan (allaqachon aniqlangan)
// oladi, o'zi aniqlamaydi.
export const ALLOWED_SOURCE = {
  pdf: { mimePrefix: 'application/pdf', maxBytes: 500 * 1024 * 1024 },
  docx: {
    mimePrefix: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    maxBytes: 500 * 1024 * 1024,
  },
  audio: { mimePrefix: 'audio/', maxBytes: 300 * 1024 * 1024 },
  image: { mimePrefix: 'image/', maxBytes: 20 * 1024 * 1024 },
};

export function validateSourceUpload(kind, mimeType, size) {
  const rule = ALLOWED_SOURCE[kind];
  if (!rule) return "Noto'g'ri fayl turi";
  const matches = kind === 'pdf' || kind === 'docx' ? mimeType === rule.mimePrefix : mimeType?.startsWith(rule.mimePrefix);
  if (!matches) return 'Fayl turi mos kelmadi';
  if (!size || size <= 0 || size > rule.maxBytes) return "Fayl hajmi ruxsat etilgan chegaradan katta";
  return null;
}

// TZ §4.2 — bucket tuzilmasi. `kind` bo'yicha to'g'ri prefiks tanlanadi;
// PDF/DOCX manba fayli har doim `books/{bookId}/source.{pdf|docx}` (bitta
// kitobga bitta asl hujjat), audio/rasm esa tasodifiy UUID bilan (bitta
// kitobda bir nechta audio fayl bo'lishi mumkin).
export function buildSourceKey(bookId, kind, mimeType) {
  if (kind === 'pdf') return `books/${bookId}/source.pdf`;
  if (kind === 'docx') return `books/${bookId}/source.docx`;
  const subtype = mimeType?.split('/')[1]?.split(';')[0];
  const ext = (subtype || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 8);
  const prefix = kind === 'audio' ? 'audio/raw' : 'images';
  return `${prefix}/${bookId}/${crypto.randomUUID()}.${ext}`;
}

export async function presignSourceUpload(key, mimeType) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: mimeType });
  return getSignedUrl(getClient(), cmd, { expiresIn: 600 }); // 10 daqiqa — katta fayllar uchun 5 daqiqa tor bo'lishi mumkin
}

export async function presignSourceDownload(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET(), Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn: 3600 });
}

export async function deleteSourceObject(key) {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
}

// AI-01 worker qatlami (worker/) uchun — admin brauzeri emas, server(worker)ning
// o'zi R2 kalitlariga bevosita ega, shuning uchun o'ziga (`presignSourceUpload`)
// so'rov yozib keyin `fetch` bilan PUT qilishning hojati yo'q: to'g'ridan-to'g'ri
// `PutObjectCommand`/`GetObjectCommand`. Worker manba PDF/audio'ni o'qishi
// (`getObjectBuffer`) va o'zi hosil qilgan hujjatlarni (sahifa matni/render,
// kesilgan audio, WebM/Opus derivativ) yozishi (`putObject`) uchun.
export async function putObject(key, body, contentType) {
  await getClient().send(new PutObjectCommand({ Bucket: BUCKET(), Key: key, Body: body, ContentType: contentType }));
  return key;
}

export async function getObjectBuffer(key) {
  const res = await getClient().send(new GetObjectCommand({ Bucket: BUCKET(), Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
}
