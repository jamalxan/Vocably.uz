import { connectToDatabase } from '@/lib/db';
import { User, XpEvent } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// VOCABLY-TZ.md §13 / Gamified Vocabulary Engine TZ §18 — reyting: Global, Haftalik, Oylik.
// Hisoblash FAQAT serverda (XP ledger'dan) — klient ballni o'zgartira olmaydi. Maxfiylik:
// faqat ochiq nom (@username yoki ism) ko'rsatiladi; telefon/ID chiqmaydi. Foydalanuvchi o'zining
// o'rnini (TOP'dan tashqarida bo'lsa ham) `me` maydonida ko'radi.
// Do'stlar/kohort reytingi kiritilmadi — ijtimoiy graf (kim kimni "do'st" deb belgilaydi) hozircha
// yo'q, Do'stlar bo'limi 1:1 chat, guruh/do'stlik ro'yxati emas.
const LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
const PERIODS = { week: 7 * DAY_MS, month: 30 * DAY_MS };

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const raw = new URL(req.url).searchParams.get('period');
    const period = raw === 'week' || raw === 'month' ? raw : 'all';
    await connectToDatabase();
    const uid = new mongoose.Types.ObjectId(String(userId));

    let rows;
    let me = null;
    // N-14: haftalik/oylik tabda faoliyati bo'lmagan foydalanuvchilar reytingda 0 XP bilan
    // aralashib qolmasligi uchun, ular alohida ro'yxatda ("faol emas") qaytariladi — rank/medalsiz.
    let inactiveRows = [];
    if (period !== 'all') {
      const since = new Date(Date.now() - PERIODS[period]);
      rows = await XpEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$userId', xp: { $sum: '$amount' } } },
        { $match: { xp: { $gt: 0 } } },
        { $sort: { xp: -1 } },
        { $limit: LIMIT },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 0, userId: '$_id', xp: 1, username: '$user.username', name: '$user.name' } },
      ]);

      // O'z o'rnim (TOP'dan tashqarida bo'lsa ham)
      const mine = await XpEvent.aggregate([
        { $match: { userId: uid, createdAt: { $gte: since } } },
        { $group: { _id: null, xp: { $sum: '$amount' } } },
      ]);
      const myXp = mine[0]?.xp || 0;
      if (myXp > 0) {
        const ahead = await XpEvent.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: '$userId', xp: { $sum: '$amount' } } },
          { $match: { xp: { $gt: myXp } } },
          { $count: 'n' },
        ]);
        me = { rank: (ahead[0]?.n || 0) + 1, xp: myXp };
      } else {
        me = { rank: null, xp: 0 };
      }

      const activeIds = rows.map((r) => r.userId);
      if (rows.length < LIMIT) {
        const others = await User.find({ _id: { $nin: activeIds } }, { username: 1, name: 1 })
          .limit(LIMIT - rows.length)
          .lean();
        inactiveRows = others.map((u) => ({
          userId: u._id,
          displayName: u.username ? `@${u.username}` : u.name || 'Foydalanuvchi',
          isMe: String(u._id) === String(userId),
        }));
      }
    } else {
      const users = await User.find({}, { xp: 1, username: 1, name: 1 })
        .sort({ xp: -1 })
        .limit(LIMIT)
        .lean();
      rows = users.map((u) => ({ userId: u._id, xp: u.xp || 0, username: u.username, name: u.name }));
      const meDoc = await User.findById(uid).select('xp').lean();
      const myXp = meDoc?.xp || 0;
      const ahead = await User.countDocuments({ xp: { $gt: myXp } });
      me = { rank: myXp > 0 ? ahead + 1 : null, xp: myXp };
    }

    const rankedRows = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      displayName: r.username ? `@${r.username}` : r.name || 'Foydalanuvchi',
      xp: r.xp,
      isMe: String(r.userId) === String(userId),
    }));

    return NextResponse.json({ period, rows: rankedRows, inactiveRows, me });
  } catch (err) {
    return serverError(err, 'gamification/leaderboard');
  }
}
