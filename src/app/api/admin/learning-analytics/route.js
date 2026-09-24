import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, ReviewEvent, ExamAttempt } from '@/lib/models';
import { cached } from '@/lib/cache';
import { QUESTION_TYPE_LABEL } from '@/lib/exam/analytics';
import { NextResponse } from 'next/server';

// U-03 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md P2) — "O'quv analitikasi faqat
// vocabulary — IELTS bo'limlari (L/R/W/S) bo'yicha analitika yo'q". Bounded MVP:
// (1) har skill (L/R/W/S) bo'yicha o'rtacha band + attempt soni — to'g'ridan-to'g'ri
// `ExamAttempt.result.<skill>.band`dan oddiy Mongo aggregation (pastda).
// (2) savol turi bo'yicha platforma-keng aniqlik — `analytics.ts#computeTypeAccuracy`
// bitta urinishning `perQuestion` massivi ustida ishlaydi (sof JS funksiya, DB'siz);
// bu yerda BARCHA urinishlar bo'yicha xuddi shu natijani Mongo `$unwind`+`$group` bilan
// olamiz (million darajadagi `perQuestion` massivini JS'ga tortib
// `computeTypeAccuracy`'ni chaqirishdan ko'ra samaraliroq) — faqat label'lar
// (`QUESTION_TYPE_LABEL`) va "kamida 2 ta savol" signal chegarasi (`analytics.ts`dagi
// `MIN_TOTAL_FOR_SIGNAL` bilan bir xil qoidaga asoslanadi) o'sha modulndan qayta ishlatiladi.
const MIN_TYPE_TOTAL_FOR_SIGNAL = 2;
const SKILLS = ['listening', 'reading', 'writing', 'speaking'];

// VOCABLY-TZ.md §16 — "O'quv analitikasi": qiyin so'zlar, rejim samaradorligi.
// To'liq §16'dagi "retention egri chizig'i (FSRS bashorati vs haqiqiy)" va
// "kontent sifati (juda oson/qiyin savollarni belgilash)" kiritilmadi — bular
// FAZA 3'da qurilgan on-demand generatsiya (bank emas) arxitekturasi bilan
// mos kelmaydi (bitta savol qayta ishlatilmaydi, "bu savol juda oson" statistikasi
// ma'nosiz). Ikkalasi ham FAZA1'dagi "so'zlar har foydalanuvchida alohida"
// qaroriga bog'liq cheklov — global bank bo'lganda tabiiy yechiladi.
// U-03 — har IELTS skill (L/R/W/S) bo'yicha o'rtacha band + baholangan attempt soni.
// Faqat `status: 'graded'` (band aniq) urinishlar hisoblanadi; `mode` filtrlanmaydi
// (mock ham, alohida section attempt ham — ikkalasida ham `result.<skill>.band` bor
// bo'lsa hisobga olinadi).
async function computeExamSkillStats() {
  const [facet] = await ExamAttempt.aggregate([
    { $match: { status: 'graded', result: { $ne: null } } },
    {
      $facet: Object.fromEntries(
        SKILLS.map((skill) => [
          skill,
          [
            { $match: { [`result.${skill}.band`]: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgBand: { $avg: `$result.${skill}.band` }, count: { $sum: 1 } } },
          ],
        ])
      ),
    },
  ]);

  return SKILLS.map((skill) => {
    const row = facet?.[skill]?.[0];
    return {
      skill,
      avgBand: row ? Math.round(row.avgBand * 10) / 10 : null,
      count: row ? row.count : 0,
    };
  });
}

// U-03 — platforma-keng savol turi bo'yicha aniqlik (eng zaif turdan boshlab) —
// analytics.ts#computeTypeAccuracy'ning ko'p-urinishli aggregate varianti.
async function computeExamTypeStats() {
  const rows = await ExamAttempt.aggregate([
    { $match: { status: 'graded', result: { $ne: null }, 'result.perQuestion.0': { $exists: true } } },
    { $unwind: '$result.perQuestion' },
    {
      $group: {
        _id: '$result.perQuestion.type',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$result.perQuestion.correct', 1, 0] } },
      },
    },
    { $match: { total: { $gte: MIN_TYPE_TOTAL_FOR_SIGNAL } } },
    {
      $project: {
        _id: 0,
        type: '$_id',
        total: 1,
        correct: 1,
        accuracy: { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] },
      },
    },
    { $sort: { accuracy: 1 } },
  ]);

  return rows.map((r) => ({ ...r, label: QUESTION_TYPE_LABEL[r.type] || r.type }));
}

async function computeLearningAnalytics() {
  const [leechWords, modeStats, examSkillStats, examTypeStats] = await Promise.all([
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
    computeExamSkillStats(),
    computeExamTypeStats(),
  ]);

  return { leechWords, modeStats, examSkillStats, examTypeStats };
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
