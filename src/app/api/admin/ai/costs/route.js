import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AiCall } from '@/lib/models';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §11.5 — "Oylik xarajat grafigi, eng qimmat vazifalar
// reytingi." Worker hali `ai_calls`ga hech narsa yozmagani uchun bu
// hozircha bo'sh natija qaytaradi — lekin haqiqiy so'rov, real ma'lumot
// kelganda qo'shimcha kod kerak bo'lmaydi.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ? new Date(searchParams.get('from')) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = searchParams.get('to') ? new Date(searchParams.get('to')) : new Date();

    const byTask = await AiCall.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$taskKey', costUsd: { $sum: '$costUsd' }, calls: { $sum: 1 }, tokensIn: { $sum: '$tokensIn' }, tokensOut: { $sum: '$tokensOut' } } },
      { $sort: { costUsd: -1 } },
    ]);

    const total = byTask.reduce((sum, t) => sum + t.costUsd, 0);

    return NextResponse.json({
      totalUsd: total,
      byTask: byTask.map((t) => ({ taskKey: t._id, costUsd: t.costUsd, calls: t.calls, tokensIn: t.tokensIn, tokensOut: t.tokensOut })),
    });
  } catch (err) {
    return serverError(err, 'admin/ai/costs:get');
  }
}
