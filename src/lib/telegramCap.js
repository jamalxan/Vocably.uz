// TZ 2.0 §6.10.5: "kuniga 2 tadan ortiq xabar yuborilmaydi". Every proactive bot message (vocab reminders,
// the 21:00 streak nudge, the daily mini-test) claims a slot here first. Replies to what the user taps or
// types are not counted — they asked for them.
import { User } from '@/lib/models';
import { REMINDER_CONFIG } from '@/lib/vocab/reminders';

/**
 * Atomically takes one of today's slots. Two single-document conditional updates, so parallel cron runs
 * can never push the count past the cap. @returns {Promise<boolean>} false = cap reached, don't send.
 */
export async function claimTelegramSlot(userId, day, max = REMINDER_CONFIG.maxPerDay) {
  if (max < 1) return false;
  const bump = () => User.updateOne({ _id: userId, 'tgNudge.day': day, 'tgNudge.count': { $lt: max } }, { $inc: { 'tgNudge.count': 1 } });
  if ((await bump()).modifiedCount) return true;
  const fresh = await User.updateOne({ _id: userId, 'tgNudge.day': { $ne: day } }, { $set: { tgNudge: { day, count: 1 } } });
  if (fresh.modifiedCount) return true;
  // A parallel call started the day between our two updates — try the same-day path once more.
  return (await bump()).modifiedCount > 0;
}

/** Gives a slot back when the send itself failed (the user received nothing). */
export async function releaseTelegramSlot(userId, day) {
  await User.updateOne({ _id: userId, 'tgNudge.day': day, 'tgNudge.count': { $gt: 0 } }, { $inc: { 'tgNudge.count': -1 } }).catch(() => {});
}
