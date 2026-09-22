// TZ-vocably-v2.md (AI Content Ingestion Agent) §13 — "Kerak bo'ladigan
// komponentlar: Web/Admin -> Upload API -> ContentBook+ContentAsset -> Job
// Queue -> Orchestrator -> Workers." Bu fayl FAQAT navbatga qo'yish (enqueue)
// tomoni. Audit AI-01 ("Real worker/orchestrator ulanmagan") ning ikkinchi
// yarmi — haqiqiy worker (PDF/ffmpeg/AI chaqiruvlari) alohida process/
// container bo'lishi SHART (Vercel request hayot davri 300s bilan
// cheklangan va ffmpeg/poppler yo'q, TZ §13 "Vercel'ga tiqish noto'g'ri") —
// ATAYLAB bu sessiyada QURILMAYDI (foydalanuvchi bilan kelishilgan qaror:
// "Redis bilan davom et, worker keyinroq"). Worker qo'shilganda u shu yerdagi
// `CONTENT_INGEST_QUEUE_NAME` navbatini `new Worker(...)` bilan tinglaydi —
// bu fayl (va `ingest/route.js`) o'zgarishsiz qoladi.
//
// `REDIS_URL` sozlanmagan bo'lsa (masalan bu sandbox'da yoki hali production
// Redis ulanmagan bo'lsa) — bu modul BUTUNLAY jim tarzda o'chadi
// (`getContentQueue()` -> null), chaqiruvchi (`ingest/route.js`) eski
// "faqat Mongo'da 'queued'" xatti-harakatiga qaytadi. Hech narsa qulab
// tushmaydi — xuddi Groq/Gemini kalitlari yo'q bo'lganda AI zanjiri
// keyingi provayderga o'tishi kabi (aiJson.js) — bu ham xuddi shunday
// "ixtiyoriy xizmat, yo'q bo'lsa darrov aniq degrade" naqshi.
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
export const CONTENT_INGEST_QUEUE_NAME = 'content-ingest';

// db.js'dagi `global.mongoose` bilan bir xil naqsh — Next.js dev'da hot-reload
// paytida va serverless issiq (warm) chaqiruvlar orasida bitta ulanish/navbat
// obyekti qayta ishlatiladi, har so'rovda yangisini ochib yubormaydi.
let cached = global.__vocablyContentQueue;
if (!cached) {
  cached = global.__vocablyContentQueue = { connection: null, queue: null };
}

function getConnection() {
  if (!REDIS_URL) return null;
  if (!cached.connection) {
    // BullMQ talabi: blocking (BRPOPLPUSH kabi) buyruqlar cheksiz kutishi
    // uchun `maxRetriesPerRequest: null` shart (BullMQ docs, Queue/Worker ikkalasi ham).
    cached.connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
    cached.connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[contentQueue] Redis ulanish xatosi:', err.message);
    });
  }
  return cached.connection;
}

/** `REDIS_URL` sozlanmagan bo'lsa `null` qaytaradi — chaqiruvchi buni "queue
 * backend yo'q, faqat Mongo `IngestJob` hujjati bor" holati sifatida
 * talqin qilishi kerak, xato deb emas. */
export function getContentQueue() {
  if (!REDIS_URL) return null;
  if (!cached.queue) {
    cached.queue = new Queue(CONTENT_INGEST_QUEUE_NAME, { connection: getConnection() });
  }
  return cached.queue;
}

/** Bitta `IngestJob` (Mongo hujjati) uchun Redis navbatiga xabar qo'shadi.
 * `jobId: idempotencyKey` — Mongo tomondagi `IngestJob.idempotencyKey` bilan
 * ATAYLAB BIR XIL: BullMQ shu ID bo'yicha o'zi dublikatni oldini oladi, shuning
 * uchun bitta bosqich (masalan "shu kitob + shu updatedAt + 'extract'") ikki
 * marta so'ralsa ham navbatda ikkinchi nusxa PAYDO BO'LMAYDI — Mongo va Redis
 * bitta idempotency tushunchasini baham ko'radi, ikkita alohida sxema emas.
 *
 * Redis sozlanmagan YOKI vaqtincha yetib bo'lmasa — xato TASHLAMAYDI, faqat
 * `{queued:false}` qaytaradi: chaqiruvchi (`ingest/route.js`) baribir Mongo
 * `IngestJob`ni "queued" holida saqlab qo'yadi (eski, ishlab turgan yo'l),
 * worker keyinroq ulanganda uni poll qilib topa oladi — Redis o'chib qolishi
 * butun ingest oqimini TO'XTATMASLIGI kerak.
 *
 * ⚠️ `ENQUEUE_TIMEOUT_MS` bilan MAJBURAN chegaralanadi — synovda aniqlandi:
 * ioredis'ning standart xatti-harakati (`maxRetriesPerRequest:null`, BullMQ
 * TALABI, o'chirib bo'lmaydi — Worker'ning blocking buyruqlari uchun shart)
 * Redis yetib bo'lmasa `queue.add()`ni CHEKSIZ osilib qoladigan holga
 * keltiradi (offline queue + cheksiz reconnect, xato TASHLAMAYDI, shunchaki
 * hech qachon resolve/reject bo'lmaydi). `try/catch`ning O'ZI YETARLI EMAS —
 * `Promise.race` bilan qo'lda vaqt chegarasi qo'yilmasa, bitta noto'g'ri
 * `REDIS_URL` butun admin so'rovini abadiy osilib qoldirar edi.
 */
const ENQUEUE_TIMEOUT_MS = 3000;

export async function enqueueIngestJob({ ingestJobId, bookId, stage, idempotencyKey }) {
  const queue = getContentQueue();
  if (!queue) return { queued: false, backend: 'mongo-only' };

  const addPromise = queue.add(
    stage,
    { ingestJobId: String(ingestJobId), bookId: String(bookId), stage },
    { jobId: idempotencyKey, removeOnComplete: 1000, removeOnFail: 5000 }
  );
  // Timeout'dan keyin ham fon rejimida davom etadi (bekor qilinmaydi — ioredis
  // buyruqni bekor qila olmaydi) — shuning uchun kech muvaffaqiyatsiz bo'lsa
  // handle qilinmagan rejection bo'lib qolmasligi uchun alohida ushlanadi.
  addPromise.catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[contentQueue] enqueueIngestJob (fon, timeout\'dan keyin) muvaffaqiyatsiz:', err.message);
  });

  try {
    await Promise.race([
      addPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis enqueue timeout')), ENQUEUE_TIMEOUT_MS)),
    ]);
    return { queued: true, backend: 'redis' };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[contentQueue] enqueueIngestJob muvaffaqiyatsiz:', err.message);
    return { queued: false, backend: 'redis-error' };
  }
}
