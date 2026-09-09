import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, ReviewEvent } from '@/lib/models';
import { cached } from '@/lib/cache';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §16 — "O'quv analitikasi": qiyin so'zlar, rejim samaradorligi.
// To'liq §16'dagi "retention egri chizig'i (FSRS bashorati vs haqiqiy)" va
// "kontent sifati (juda oson/qiyin savollarni belgilash)" kiritilmadi — bular
// FAZA 3'da qurilgan on-demand generatsiya (bank emas) arxitekturasi bilan
// mos kelmaydi (bitta savol qayta ishlatilmaydi, "bu savol juda oson" statistikasi
// ma'nosiz). Ikkalasi ham FAZA1'dagi "so'zlar har foydalanuvchida alohida"
// qaroriga bog'liq cheklov — global bank bo'lganda tabiiy yechiladi.
async function computeLearningAnalytics() {
  const [leechWords, modeStats] = await Promise.all([
    // So'zlar User hujjati ichida embedded — barcha foydalanuvchilar bo'yicha
    // "eng ko'p leech bo'lgan so'zlar"ni topish uchun $unwind kerak.
    User.aggregate([
      { $unwind: '$categories' },
      { $unwind: '$categories.words' },
      { $match: { 'categories.words.stats.isLeech': true } },
      {
        $group: {
          _id: { $toLower: '$categories.words.word' },
          userCount: { $sum: 1 },
          avgLapses: { $avg: '$categories.words.stats.lapses' },
        },
      },
      { $sort: { userCount: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, word: '$_id', userCount: 1, avgLapses: { $round: ['$avgLapses', 1] } } },
    ]),
    ReviewEvent.aggregate([
      {
        $group: {
          _id: '$mode',
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          mode: '$_id',
          total: 1,
          correct: 1,
          accuracy: { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] },
        },
      },
    ]),
  ]);

  return { leechWords, modeStats };
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const data = await cached('admin:learning-analytics', computeLearningAnalytics, 300_000);
    return NextResponse.json(data);
  } catch (err) {
    return serverError(err, 'admin/learning-analytics');
  }
}
