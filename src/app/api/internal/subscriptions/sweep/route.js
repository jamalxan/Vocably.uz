import { connectToDatabase } from '@/lib/db';
import { bearerMatches } from '@/lib/safeEqual';
import { User, Notification } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { sendPushToUser } from '@/lib/webPush';
import { dueNotice, GRACE_DAYS } from '@/lib/subscription';
import { TIER_CONFIG } from '@/lib/entitlements';
import { NextResponse } from 'next/server';

// Daily subscription reminder sweep (vercel.json cron). Sends at most ONE due
// notice per user per run: "ends tomorrow" -> "expired, N days left" (each
// grace day) -> "closed". Access itself is decided on read
// (src/lib/subscription.js), so a late or missed run never keeps a lapsed plan
// open — it only delays a message. Idempotent: delivered keys are recorded on
// the user and a notice is sent only if its key isn't there yet.
//
// Auth: `Authorization: Bearer $CRON_SECRET` (what Vercel Cron sends).
const DAY_MS = 24 * 60 * 60 * 1000;

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  return bearerMatches(req.headers.get('authorization'), secret);
}

async function deliver(user, notice) {
  await Notification.create({ userId: user._id, type: 'subscription', title: notice.title, body: notice.body, link: notice.link });
  const appUrl = process.env.APP_URL || '';
  const jobs = [sendPushToUser(user._id, { title: notice.title, body: notice.body, url: notice.link })];
  if (user.telegramChatId) {
    jobs.push(sendTelegramMessage(user.telegramChatId, `<b>${notice.title}</b>\n${notice.body}\n\n${appUrl}${notice.link}`, { parse_mode: 'HTML' }));
  }
  // A failing channel (blocked bot, dead push endpoint) must not block the others
  // or re-send the in-app notice next run.
  await Promise.allSettled(jobs);
}

async function sweep() {
  const now = new Date();
  // Paid users from 1 day before expiry up to a week after the grace ends.
  const candidates = await User.find({
    subscriptionTier: { $ne: 'free' },
    subscriptionExpiresAt: {
      $lte: new Date(now.getTime() + DAY_MS),
      $gte: new Date(now.getTime() - (GRACE_DAYS + 7) * DAY_MS),
    },
  })
    .select('subscriptionTier subscriptionExpiresAt subscriptionNotices telegramChatId')
    .lean();

  let sent = 0;
  for (const user of candidates) {
    const notice = dueNotice(user, now, { tierLabel: (t) => TIER_CONFIG[t]?.label || t });
    if (!notice) continue;
    // Claim the key first (atomic) so two overlapping runs can't both send it.
    const claimed = await User.updateOne(
      { _id: user._id, subscriptionNotices: { $ne: notice.key } },
      { $push: { subscriptionNotices: { $each: [notice.key], $slice: -30 } } }
    );
    if (!claimed.modifiedCount) continue;
    await deliver(user, notice);
    sent++;
  }
  return { checked: candidates.length, sent };
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    return NextResponse.json({ ok: true, ...(await sweep()) });
  } catch (err) {
    return serverError(err, 'internal/subscriptions/sweep');
  }
}
