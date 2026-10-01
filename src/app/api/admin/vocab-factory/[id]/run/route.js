import { NextResponse } from 'next/server';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { runJob } from '@/lib/vocab/server/factoryService';

// Har chaqiruv navbatdan 2 tagacha bo'lakni AI bilan ishlaydi (foydalanuvchi so'rovini uzoq bloklamaydi);
// admin sahifasi tugamaguncha qayta chaqiradi. Bo'laklar atomik band qilinadi, shuning uchun parallel tablar xavfsiz.
export const maxDuration = 120;

export async function POST(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    // AI xarajatini cheklash: daqiqasiga ko'pi bilan 30 ta run-chaqiruv (~60 bo'lak).
    if (!(await checkRateLimit(admin._id, 'admin-vocab-factory-run', 30))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    const { id } = await params;
    const job = await runJob(id, admin._id);
    if (job.chunks.pending + job.chunks.processing === 0) {
      await writeAuditLog(req, admin._id, 'vocab.factory.finish', 'VocabIngestJob', id, { created: job.created, failed: job.chunks.failed }, 10);
    }
    return NextResponse.json({ job });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-factory/[id]/run POST');
  }
}
