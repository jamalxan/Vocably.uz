import { connectToDatabase } from '@/lib/db';
import { User, XpEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §13 — "Leaderboard: Haftalik XP bo'yicha; umumiy". Do'stlar
// orasidagi reyting (faqat chatAccess'i bor foydalanuvchilar bir-birini bilgani
// uchun) kiritilmadi — ijtimoiy graf (kim kimni "do'st" deb belgilaydi) hozircha
// yo'q, Do'stlar bo'limi shunchaki 1:1 chat, guruh/do'stlik ro'yxati emas.
const LIMIT = 20;

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const period = new URL(req.url).searchParams.get('period') === 'week' ? 'week' : 'all';
    await connectToDatabase();

    let rows;
    if (period === 'week') {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      rows = await XpEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$userId', xp: { $sum: '$amount' } } },
        { $sort: { xp: -1 } },
        { $limit: LIMIT },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 0, userId: '$_id', xp: 1, username: '$user.username', name: '$user.name' } },
      ]);
    } else {
      const users = await User.find({}, { xp: 1, username: 1, name: 1 })
        .sort({ xp: -1 })
        .limit(LIMIT)
        .lean();
      rows = users.map((u) => ({ userId: u._id, xp: u.xp || 0, username: u.username, name: u.name }));
    }

    const rankedRows = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      displayName: r.username ? `@${r.username}` : r.name || 'Foydalanuvchi',
      xp: r.xp,
      isMe: String(r.userId) === String(userId),
    }));

    return NextResponse.json({ period, rows: rankedRows });
  } catch (err) {
    return serverError(err, 'gamification/leaderboard');
  }
}
