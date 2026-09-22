// AI-01 worker — kirish nuqtasi: `node worker/index.ts` (yoki `npm run
// worker` — tsx orqali, build qadamisiz, `realtime-server/`ning "build
// yo'q, to'g'ridan-to'g'ri node" falsafasiga mos, lekin TypeScript'da,
// chunki bu worker `src/lib/exam/*`ning TIPLANGAN kontraktlarini
// BEVOSITA qayta ishlatadi — worker/lib/aiStageRunner.ts va h.k. izohiga q.).
//
// Next.js ilovasidan FARQLI — bu alohida, uzoq umr ko'radigan Node protsessi
// (Vercel/serverless EMAS): `content-ingest` Redis navbatini tinglaydi va
// PDF/audio/AI ishlov berishni bajaradi (TZ §3.1 — "Vercel'da ISHLAMAYDI,
// 300s limit + ffmpeg/poppler yo'q").
import dotenv from 'dotenv';
import path from 'path';

// Next.js konvensiyasi bilan bir xil: `.env` avval, `.env.local` UNI
// USTIDAN YOZADI (Next.js'ning o'zi ham shunday ishlaydi — .env.local
// ustuvor). `override:true` ikkinchi chaqiruvda SHART, aks holda dotenv
// birinchi marta o'qigan qiymatni saqlab qoladi.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { connectToDatabase } from '@/lib/db';
import { CONTENT_INGEST_QUEUE_NAME } from '@/lib/queue/contentQueue';
import { runJob, JobPausedSignal, type WorkerJobData } from './jobRunner';

const REQUIRED_ENV = ['MONGODB_URI', 'REDIS_URL'] as const;

function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`[worker] Majburiy env o'zgaruvchilar yo'q: ${missing.join(', ')}. .env/.env.local'ni tekshiring.`);
    process.exit(1);
  }
  // R2/OPENROUTER_API_KEY/GROQ_API_KEY worker'ni ISHGA TUSHIRISH uchun
  // shart EMAS (ular yo'q bo'lsa alohida bosqichlar aniq xato bilan
  // muvaffaqiyatsiz bo'ladi, butun worker EMAS) — lekin ogohlantirish
  // beramiz, aks holda admin nega "hech narsa ishlamayapti" ekanini tushunmasligi mumkin.
  const optional = ['R2_ENDPOINT', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET', 'OPENROUTER_API_KEY'];
  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[worker] Ixtiyoriy (lekin ko'p bosqich uchun kerak) env yo'q: ${missingOptional.join(', ')} — shu maydonlarga tayanuvchi bosqichlar aniq xato bilan to'xtaydi.`);
  }
}

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 2);

async function main() {
  assertRequiredEnv();
  await connectToDatabase();
  // eslint-disable-next-line no-console
  console.log('[worker] MongoDB ulandi.');

  const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[worker] Redis ulanish xatosi:', err.message);
  });

  const worker = new Worker<WorkerJobData>(
    CONTENT_INGEST_QUEUE_NAME,
    async (job: Job<WorkerJobData>) => {
      try {
        return await runJob(job.data);
      } catch (err) {
        if (err instanceof JobPausedSignal) {
          // eslint-disable-next-line no-console
          console.log(`[worker] Job ${job.id} (${job.data.stage}) — AutomationPolicy pauza/xarajat chegarasi, keyinroq qo'lda qayta ingest chaqirilganda davom etadi.`);
          return null; // BullMQ nuqtai nazaridan "muvaffaqiyatli tugadi" — bu xato emas, atayin to'xtatish
        }
        throw err;
      }
    },
    { connection, concurrency: CONCURRENCY }
  );

  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] ✓ ${job.data.bookId} / ${job.data.stage} (job ${job.id})`);
  });
  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`[worker] ✗ ${job?.data?.bookId} / ${job?.data?.stage} (job ${job?.id}): ${err.message}`);
  });

  // eslint-disable-next-line no-console
  console.log(`[worker] "${CONTENT_INGEST_QUEUE_NAME}" navbatini tinglayapti (concurrency=${CONCURRENCY})...`);

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] ${signal} qabul qilindi — joriy ishlar tugashini kutmoqda...`);
    await worker.close();
    await connection.quit();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[worker] Ishga tushirishda halokatli xato:', err);
  process.exit(1);
});
