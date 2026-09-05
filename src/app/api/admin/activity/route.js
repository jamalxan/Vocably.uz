import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, ReviewEvent, Message } from '@/lib/models';
import { cached } from '@/lib/cache';
import { NextResponse } from 'next/server';

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const TREND_DAYS = 14;
// Loyihada hech qanday sahifa-ko'rish/heartbeat kuzatuvi yo'q (docs/DB_SCHEMA.md) — "saytda
// qancha vaqt o'tkazdi" degan haqiqiy o'lchov mavjud emas. Shuning uchun bor-yo'g'i ikkita vaqt
// tamg'asi manbaidan (so'z takrorlash — ReviewEvent, Do'stlar xabarlari — Message) TAXMINIY
// sessiya davomiyligi chiqariladi: bir foydalanuvchining hodisalari SESSION_GAP_MS'dan kam
// farq bilan ketma-ket kelsa, bitta "sessiya" deb hisoblanadi. Bu chinakam ekran vaqti emas —
// faqat mavjud faollik izidan qilingan qo'pol taxmin, front-end shunday deb belgilaydi.
const SESSION_GAP_MS = 20 * 60 * 1000;
const MIN_SESSION_MS = 60 * 1000; // yakka hodisali "sessiya" uchun eng kam davomiylik pol'i

function toDay(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

// events: [{ userId, ts, kind }] — vaqt bo'yicha saralanmagan bo'lishi mumkin.
// Har bir foydalanuvchi uchun alohida, hodisalarni saralab, GAP'dan katta bo'shliqlarni
// sessiya chegarasi deb hisoblaydi.
function estimateSessions(events) {
  const byUser = new Map();
  for (const e of events) {
    const key = String(e.userId);
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key).push(e.ts);
  }

  const perUser = new Map(); // userId -> { totalMs, sessionCount, eventCount }
  let totalMs = 0;

  for (const [userId, rawTimestamps] of byUser) {
    const timestamps = [...rawTimestamps].sort((a, b) => a - b);
    let sessionStart = timestamps[0];
    let prev = timestamps[0];
    let sessionCount = 0;
    let userMs = 0;

    const flushSession = () => {
      userMs += Math.max(prev - sessionStart, MIN_SESSION_MS);
      sessionCount += 1;
    };

    for (let i = 1; i < timestamps.length; i++) {
      const t = timestamps[i];
      if (t - prev > SESSION_GAP_MS) {
        flushSession();
        sessionStart = t;
      }
      prev = t;
    }
    flushSession();

    perUser.set(userId, { totalMs: userMs, sessionCount, eventCount: timestamps.length });
    totalMs += userMs;
  }

  return { perUser, totalMs };
}

async function computeActivityStats() {
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_DAYS * DAY_MS);
  const dayAgo = new Date(now - DAY_MS);
  const weekAgo = new Date(now - 7 * DAY_MS);

  const [reviewEvents, messages] = await Promise.all([
    ReviewEvent.find({ reviewedAt: { $gte: windowStart } }, { userId: 1, reviewedAt: 1, isCorrect: 1 }).lean(),
    Message.find({ createdAt: { $gte: windowStart } }, { senderId: 1, createdAt: 1, type: 1 }).lean(),
  ]);

  const events = [
    ...reviewEvents.map((r) => ({ userId: r.userId, ts: new Date(r.reviewedAt).getTime(), kind: 'review' })),
    ...messages.map((m) => ({ userId: m.senderId, ts: new Date(m.createdAt).getTime(), kind: 'message' })),
  ];

  const { perUser, totalMs } = estimateSessions(events);

  // Kunlik trend (oxirgi TREND_DAYS kun) — UTC kun chegarasi bilan, admin/stats'dagi
  // kabi (bu yerda foydalanuvchilar aralash, bitta timezone bog'lab bo'lmaydi).
  const dailyMap = new Map();
  for (const e of events) {
    const day = toDay(e.ts);
    if (!dailyMap.has(day)) dailyMap.set(day, { date: day, reviews: 0, messages: 0 });
    dailyMap.get(day)[e.kind === 'review' ? 'reviews' : 'messages'] += 1;
  }
  const dailyTrend = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const day = toDay(now - i * DAY_MS);
    dailyTrend.push(dailyMap.get(day) || { date: day, reviews: 0, messages: 0 });
  }

  const activeToday = new Set(events.filter((e) => e.ts >= dayAgo.getTime()).map((e) => String(e.userId)));
  const activeThisWeek = new Set(events.filter((e) => e.ts >= weekAgo.getTime()).map((e) => String(e.userId)));

  const correctCount = reviewEvents.filter((r) => r.isCorrect).length;

  const topEntries = [...perUser.entries()].sort((a, b) => b[1].totalMs - a[1].totalMs).slice(0, 10);
  const topUserDocs = await User.find(
    { _id: { $in: topEntries.map(([id]) => id) } },
    { name: 1, phone: 1, username: 1 }
  ).lean();
  const userMap = new Map(topUserDocs.map((u) => [String(u._id), u]));

  const topUsers = topEntries.map(([userId, v]) => {
    const u = userMap.get(userId);
    return {
      userId,
      name: u?.name || u?.username || u?.phone || "Noma'lum",
      estimatedMinutes: Math.round(v.totalMs / 60000),
      sessionCount: v.sessionCount,
      eventCount: v.eventCount,
    };
  });

  return {
    windowDays: WINDOW_DAYS,
    totalEstimatedMinutes: Math.round(totalMs / 60000),
    activeUsers: perUser.size,
    activeToday: activeToday.size,
    activeThisWeek: activeThisWeek.size,
    totalReviews: reviewEvents.length,
    correctCount,
    wrongCount: reviewEvents.length - correctCount,
    totalMessages: messages.length,
    dailyTrend,
    topUsers,
  };
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    // Og'irroq agregatsiya (2 ta to'liq koleksiya skanerlash + sessiya klasterlash JS'da) —
    // admin/stats'ga (60s) qaraganda uzunroq TTL bilan keshlanadi.
    const stats = await cached('admin:activity', computeActivityStats, 5 * 60_000);
    return NextResponse.json(stats);
  } catch (err) {
    return serverError(err, 'admin/activity');
  }
}
