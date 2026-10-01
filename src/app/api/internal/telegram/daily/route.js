import { connectToDatabase } from '@/lib/db';
import { bearerMatches } from '@/lib/safeEqual';
import { User } from '@/lib/models';
import { sendDailyPractice, tashkentDate } from '@/lib/telegramQuiz';
import { NextResponse } from 'next/server';

// Daily Telegram mini-test / reminder (Vercel cron, see vercel.json). Same
// protection as the subscription sweep: Authorization: Bearer $CRON_SECRET.
// Idempotent per Tashkent day (`tgDailySentOn`), so a retried or doubled cron
// run never sends twice.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const BATCH = 400;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!bearerMatches(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
  }
  await connectToDatabase();
  const today = tashkentDate();
  const users = await User.find({
    telegramChatId: { $ne: null },
    tgDailyPractice: { $ne: false },
    tgDailySentOn: { $ne: today },
    chatBanned: { $ne: true },
  })
    .select('categories reviewStreak telegramChatId')
    .limit(BATCH);

  const stats = { quiz: 0, reminder: 0, failed: 0 };
  for (const u of users) {
    try {
      stats[await sendDailyPractice(u)]++;
    } catch (err) {
      stats.failed++;
      // A user who blocked the bot: stop trying every day.
      if (/blocked|chat not found|deactivated/i.test(String(err?.message))) {
        await User.updateOne({ _id: u._id }, { $set: { tgDailyPractice: false } });
      } else {
        console.error('[telegram daily]', u._id, err?.message);
      }
    }
    await new Promise((r) => setTimeout(r, 40)); // stay far below Telegram's 30 msg/s
  }
  return NextResponse.json({ ok: true, candidates: users.length, ...stats });
}
