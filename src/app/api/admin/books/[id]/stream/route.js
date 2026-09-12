import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { ContentBook, IngestJob } from '@/lib/models';

// TZ-vocably-v2.md (AI Content Ingestion Agent) §11.2/§12 — "Real vaqtda (SSE)
// 12 bosqich ko'rinadi." Vercel serverless funksiyalari uzoq muddatli ulanish
// uchun mo'ljallanmagan (bepul/Pro rejada bir necha daqiqa bilan cheklangan),
// shuning uchun bu oqim CHEKLANGAN MUDDATGA (`MAX_DURATION_MS`) ochiladi va
// keyin o'zi yopiladi — klient (EventSource) avtomatik qayta ulanadi. Hozircha
// worker ulanmagani uchun bu yerda ko'rsatiladigan progress DOIM "queued"
// bo'lib qoladi — buning o'zi ham foydali signal (admin worker hali
// ishlamayotganini ko'radi, muzlab qolgandek ko'rinmaydi).
const POLL_MS = 3000;
const MAX_DURATION_MS = 4 * 60 * 1000;

export async function GET(req, { params }) {
  const { error, status } = await requireAdminUser(req);
  if (error) return new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } });

  await connectToDatabase();
  const bookId = params.id;

  const encoder = new TextEncoder();
  let closed = false;
  let intervalId;
  let timeoutId;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const tick = async () => {
        if (closed) return;
        const book = await ContentBook.findById(bookId).select('status progress').lean();
        if (!book) {
          send({ error: 'Kitob topilmadi' });
          return;
        }
        const jobs = await IngestJob.find({ bookId }).select('stage status attempt metrics.costUsd error.message').sort({ createdAt: 1 }).lean();
        send({
          bookStatus: book.status,
          progress: book.progress,
          jobs: jobs.map((j) => ({ stage: j.stage, status: j.status, attempt: j.attempt, costUsd: j.metrics?.costUsd || 0, errorMessage: j.error?.message || '' })),
        });
      };

      await tick();
      intervalId = setInterval(tick, POLL_MS);
      timeoutId = setTimeout(() => {
        closed = true;
        clearInterval(intervalId);
        controller.close();
      }, MAX_DURATION_MS);
    },
    cancel() {
      closed = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
