// Referral — Mongo side (rules in ./referral.js). Tested in referralServer.integration.test.js.
//
//   ensureReferralCode  → a user's personal code, created on first use (unique, retried on collision)
//   applyReferral       → right after sign-up: links the new account to the inviter and pays both sides
//                         7 days of Premium (inviter capped per month); idempotent, never throws
//   grantBonusDays      → the one way bonus days are added (also usable for promo bonuses later)
import { User, Referral, Notification } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { activationUpdate, subscriptionState } from '@/lib/subscription';
import { REFERRAL, generateReferralCode, inviterRewardStatus, monthStart, normalizeReferralCode, referralLink } from './referral';

const appUrl = () => (process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '');

/** The user's referral code, creating one if they have none. */
export async function ensureReferralCode(userId) {
  const u = await User.findById(userId).select('referral.code').lean();
  if (!u) return null;
  if (u.referral?.code) return u.referral.code;
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    try {
      const r = await User.updateOne({ _id: userId, 'referral.code': { $in: [null, undefined] } }, { $set: { 'referral.code': code } });
      if (r.modifiedCount) return code;
      // A parallel request set it first.
      return (await User.findById(userId).select('referral.code').lean())?.referral?.code || null;
    } catch (e) {
      if (e?.code !== 11000) throw e; // collision → another code
    }
  }
  throw new Error('referral code collision');
}

/**
 * Adds `days` of paid access: Premium for free / Premium users (extending an active Premium), and an
 * extension of the current term for an active Standard subscriber (a paid Standard term is never
 * overwritten by a shorter Premium one). Returns the new expiry.
 */
export async function grantBonusDays(userId, days, { now = new Date(), by = null } = {}) {
  const user = await User.findById(userId).select('subscriptionTier subscriptionExpiresAt subscriptionStartedAt').lean();
  if (!user) return null;
  const state = subscriptionState(user, now);
  const tier = state.effectiveTier === 'standard' && state.status !== 'expired' ? 'standard' : 'premium';
  const update = activationUpdate(user, tier, { days, now, by });
  await User.updateOne({ _id: userId }, { $set: update });
  return { tier, expiresAt: update.subscriptionExpiresAt };
}

async function tell(userId, { title, body, telegram, link = '/app/billing' }) {
  const u = await User.findById(userId).select('telegramChatId').lean();
  await Notification.create({ userId, type: 'gift', title, body, link }).catch(() => {});
  await sendPushToUser(userId, { title, body, url: link }).catch(() => {});
  if (u?.telegramChatId) await sendTelegramMessage(u.telegramChatId, telegram).catch(() => {});
}

/**
 * Links a brand-new account to the code it signed up with and pays the rewards. Safe to call with
 * junk (returns null); a second call for the same account is a no-op (unique inviteeId).
 * @returns {Promise<{ ownerId, rewardStatus, days } | null>}
 */
export async function applyReferral(newUser, rawCode, { now = new Date() } = {}) {
  try {
    const code = normalizeReferralCode(rawCode);
    if (!code || !newUser?._id) return null;
    const owner = await User.findOne({ 'referral.code': code }).select('_id name').lean();
    if (!owner || String(owner._id) === String(newUser._id)) return null;

    const rewardsThisMonth = await Referral.countDocuments({ ownerId: owner._id, rewardStatus: 'granted', createdAt: { $gte: monthStart(now) } });
    const rewardStatus = inviterRewardStatus(rewardsThisMonth);
    try {
      await Referral.create({ code, ownerId: owner._id, inviteeId: newUser._id, rewardStatus, days: REFERRAL.days, createdAt: now });
    } catch (e) {
      if (e?.code === 11000) return null; // already applied for this account
      throw e;
    }
    await User.updateOne({ _id: newUser._id }, { $set: { 'referral.invitedBy': owner._id } });

    // Invitee: 7 days on top of whatever the welcome trial gave.
    const mine = await grantBonusDays(newUser._id, REFERRAL.days, { now });
    await tell(newUser._id, {
      title: `🎁 Do'st taklifi: +${REFERRAL.days} kun Premium`,
      body: `${owner.name ? `${owner.name} ` : "Do'stingiz "}taklifi bilan keldingiz — ${REFERRAL.days} kun Premium qo'shildi.`,
      telegram: `🎁 <b>Do'st taklifi</b>\n${REFERRAL.days} kun Premium qo'shildi — ${escapeTelegramHtml(owner.name || "do'stingiz")} taklifi bilan.`,
    });

    if (rewardStatus === 'granted') {
      await grantBonusDays(owner._id, REFERRAL.days, { now });
      await User.updateOne({ _id: owner._id }, { $inc: { 'referral.rewardCount': 1, 'referral.rewardedDays': REFERRAL.days } });
      const who = escapeTelegramHtml(newUser.name || "Do'stingiz");
      await tell(owner._id, {
        title: `🎉 ${newUser.name || "Do'stingiz"} qo'shildi: +${REFERRAL.days} kun Premium`,
        body: `Taklifingiz bilan yangi o'quvchi keldi. Sizga ${REFERRAL.days} kun Premium qo'shildi.`,
        telegram: `🎉 <b>${who}</b> sizning havolangiz bilan qo'shildi — sizga <b>${REFERRAL.days} kun Premium</b> qo'shildi.`,
        link: '/app/profile',
      });
    }
    return { ownerId: owner._id, rewardStatus, days: REFERRAL.days, expiresAt: mine?.expiresAt || null };
  } catch (err) {
    console.error('[referral] apply failed', err?.message);
    return null;
  }
}

/** GET /api/referral — my code, link and numbers. */
export async function referralStats(userId) {
  const code = await ensureReferralCode(userId);
  if (!code) return null;
  const [u, invited, recent] = await Promise.all([
    User.findById(userId).select('referral').lean(),
    Referral.countDocuments({ ownerId: userId }),
    Referral.find({ ownerId: userId }).sort({ createdAt: -1 }).limit(10).select('inviteeId rewardStatus createdAt').lean(),
  ]);
  const names = await User.find({ _id: { $in: recent.map((r) => r.inviteeId) } }).select('name').lean();
  const nameOf = (id) => names.find((n) => String(n._id) === String(id))?.name || '';
  return {
    code,
    link: referralLink(code, appUrl()),
    days: REFERRAL.days,
    invited,
    rewardCount: u?.referral?.rewardCount || 0,
    rewardedDays: u?.referral?.rewardedDays || 0,
    recent: recent.map((r) => ({ name: nameOf(r.inviteeId), rewarded: r.rewardStatus === 'granted', at: r.createdAt })),
  };
}
