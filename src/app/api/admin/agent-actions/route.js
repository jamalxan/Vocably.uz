import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AgentAction } from '@/lib/models';
import { NextResponse } from 'next/server';

// docs/ai-content-agent-tz-avtopilot.md §4.2/§6 — "GET /api/admin/agent-actions
// ?bookId=&action=&from=&to=". Bo'sh qaytishi kutilgan — hali hech qanday
// orchestrator bu kolleksiyaga yozmayapti (M2-M6 asosiy pipeline kutmoqda),
// lekin UI/query qatlami tayyor bo'lsin, birinchi yozuv kelganda kod
// o'zgarishi shart bo'lmasin.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const { searchParams } = req.nextUrl;
    const bookId = searchParams.get('bookId');
    const action = searchParams.get('action');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limitParam = parseInt(searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const query = {};
    if (bookId) query.bookId = bookId;
    if (action) query.action = action;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const actions = await AgentAction.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({ actions });
  } catch (err) {
    return serverError(err, 'admin/agent-actions:list');
  }
}
