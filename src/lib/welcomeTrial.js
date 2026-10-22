import { User } from '@/lib/models';
import { activationUpdate } from '@/lib/subscription';
import { notifySubscriptionActivated } from '@/lib/subscriptionNotify';
import { getWelcomeTrial } from '@/lib/settings';

// Free starter plan for brand-new accounts (settings: welcomeTrial). Called
// right after registration creates the user. Idempotent: `welcomeTrialAt` is
// claimed atomically, so a retried request can never grant it twice. Never
// throws — a failed trial must not fail the registration itself.
export async function grantWelcomeTrial(user) {
  try {
    const trial = await getWelcomeTrial();
    if (!trial.enabled) return null;
    const now = new Date();
    const update = activationUpdate(user, trial.tier, { months: trial.months, now, by: null });
    const res = await User.updateOne({ _id: user._id, welcomeTrialAt: null }, { $set: { ...update, welcomeTrialAt: now } });
    if (!res.modifiedCount) return null;
    await notifySubscriptionActivated(user, { kind: 'trial', tier: trial.tier, months: trial.months, expiresAt: update.subscriptionExpiresAt });
    return { tier: trial.tier, months: trial.months, expiresAt: update.subscriptionExpiresAt };
  } catch (err) {
    console.error('[welcome-trial] berilmadi', err);
    return null;
  }
}
