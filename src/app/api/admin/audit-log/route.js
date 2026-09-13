import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AdminAuditLog, AgentAction, User } from '@/lib/models';
import { NextResponse } from 'next/server';

// docs/ai-content-agent-tz-avtopilot.md §7.4 — "Aktyor: Hammasi / Admin /
// AI agent" filtri. AI harakatlari `AgentAction`da yotadi (§4.2 — ATAYLAB
// `AdminAuditLog`dan alohida, shishib ketmasligi uchun), shuning uchun bu
// yerda ikkalasini kerak bo'lganda birlashtirib, bitta izchil shaklga
// keltiramiz — frontend ikkala turdagi yozuvni deyarli bir xil render qiladi.
function agentActionToLogShape(a) {
  return {
    _id: a._id,
    actorId: null,
    actor: { username: 'AI agent', name: 'AI agent' },
    isAgent: true,
    action: a.action,
    targetType: a.testId ? 'ExamTest' : a.reviewItemId ? 'ReviewItem' : a.bookId ? 'ContentBook' : null,
    targetId: String(a.testId || a.reviewItemId || a.bookId || ''),
    diff: { reasoning: a.reasoning, costUsd: a.costUsd, beforeConfidence: a.beforeConfidence, afterConfidence: a.afterConfidence },
    createdAt: a.createdAt,
  };
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const before = req.nextUrl.searchParams.get('before');
    const actorFilter = req.nextUrl.searchParams.get('actor') || 'admin'; // 'admin' | 'ai_agent' | 'all'
    const timeQuery = before ? { createdAt: { $lt: new Date(before) } } : {};
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    let page = [];

    if (actorFilter === 'ai_agent') {
      const actions = await AgentAction.find(timeQuery).sort({ createdAt: -1 }).limit(limit + 1).lean();
      const hasMore = actions.length > limit;
      page = (hasMore ? actions.slice(0, limit) : actions).map(agentActionToLogShape);
      return NextResponse.json({ logs: page, nextCursor: hasMore ? page[page.length - 1].createdAt : null });
    }

    if (actorFilter === 'all') {
      const [adminLogs, agentLogs] = await Promise.all([
        AdminAuditLog.find(timeQuery).sort({ createdAt: -1 }).limit(limit).lean(),
        AgentAction.find(timeQuery).sort({ createdAt: -1 }).limit(limit).lean(),
      ]);
      const actorIds = [...new Set(adminLogs.map((l) => String(l.actorId)))];
      const actors = await User.find({ _id: { $in: actorIds } }).select('username name').lean();
      const byId = new Map(actors.map((u) => [String(u._id), u]));
      const merged = [
        ...adminLogs.map((l) => ({ ...l, actor: byId.get(String(l.actorId)) || null, isAgent: false })),
        ...agentLogs.map(agentActionToLogShape),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
      const nextCursor = merged.length === limit ? merged[merged.length - 1].createdAt : null;
      return NextResponse.json({ logs: merged, nextCursor });
    }

    // default: 'admin' — avvalgi xatti-harakat, o'zgarishsiz.
    const logs = await AdminAuditLog.find(timeQuery).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = logs.length > limit;
    page = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    const actorIds = [...new Set(page.map((l) => String(l.actorId)))];
    const actors = await User.find({ _id: { $in: actorIds } }).select('username name').lean();
    const byId = new Map(actors.map((u) => [String(u._id), u]));

    return NextResponse.json({
      logs: page.map((l) => ({ ...l, actor: byId.get(String(l.actorId)) || null, isAgent: false })),
      nextCursor,
    });
  } catch (err) {
    return serverError(err, 'admin/audit-log');
  }
}
