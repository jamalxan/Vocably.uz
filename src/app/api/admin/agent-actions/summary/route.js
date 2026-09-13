import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AgentAction } from '@/lib/models';
import { NextResponse } from 'next/server';

// docs/ai-content-agent-tz-avtopilot.md §7.1/§7.2 — "Bugungi AI faoliyati"
// mini-panel (AI sozlamalari → Avtopilot) va Kontent studiyasi bosh
// sahifasidagi status paneli shu bitta endpointdan o'qiydi. Bugun = server
// kunining boshidan (UTC) hozirgacha — TZ soat mintaqasi haqida aniq
// gapirmagan, admin panel boshqa joylarda ham UTC kun chegarasidan
// foydalanadi (masalan AiUsage#hourBucket), shu bilan izchil.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const rows = await AgentAction.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: '$action', count: { $sum: 1 }, costUsd: { $sum: '$costUsd' } } },
    ]);

    const byAction = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    const costUsdToday = rows.reduce((sum, r) => sum + (r.costUsd || 0), 0);

    return NextResponse.json({
      since: startOfDay,
      byAction,
      costUsdToday,
      totalActions: rows.reduce((sum, r) => sum + r.count, 0),
    });
  } catch (err) {
    return serverError(err, 'admin/agent-actions:summary');
  }
}
