import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, Conversation, Message, Report } from '@/lib/models';
import { NextResponse } from 'next/server';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const now = Date.now();
    const dayAgo = new Date(now - DAY_MS);
    const weekAgo = new Date(now - 7 * DAY_MS);

    const [
      totalUsers,
      chatAccessUsers,
      bannedUsers,
      adminCount,
      newToday,
      newThisWeek,
      totalConversations,
      totalMessages,
      openReports,
      messagesByType,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ chatAccess: true }),
      User.countDocuments({ chatAccess: true, chatBanned: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: dayAgo } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Conversation.countDocuments({}),
      Message.countDocuments({}),
      Report.countDocuments({ status: 'open' }),
      Message.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    const typeBreakdown = Object.fromEntries(messagesByType.map((r) => [r._id, r.count]));

    return NextResponse.json({
      totalUsers,
      chatAccessUsers,
      bannedUsers,
      adminCount,
      newToday,
      newThisWeek,
      totalConversations,
      totalMessages,
      openReports,
      typeBreakdown,
    });
  } catch (err) {
    return serverError(err, 'admin/stats');
  }
}
