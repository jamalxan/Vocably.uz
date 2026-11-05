// Sales funnel (TZ 2.0 §6.12.3): landing → onboarding → signup → payment. Pure — tested in salesFunnel.test.js.
// Counts are per period (unique visitors / accounts in the window), not a strict per-person cohort:
// visitors are anonymous until they sign up, so the step rates are "this period's flow", which is
// what the admin needs to see where people drop off.

export const FUNNEL_STAGES = ['landing', 'onboarding_start', 'onboarding_done'];
export const FUNNEL_RANGES = [7, 30, 90];

const rate = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : null);

/**
 * @param {{landing:number, onboardingStart:number, onboardingDone:number, signups:number, payers:number}} c
 * @returns {{ key:string, count:number, fromPrev:number|null, fromTop:number|null }[]}
 */
export function computeSalesFunnel(c) {
  const steps = [
    ['landing', c.landing],
    ['onboarding_start', c.onboardingStart],
    ['onboarding_done', c.onboardingDone],
    ['signup', c.signups],
    ['payment', c.payers],
  ];
  const top = steps[0][1] || 0;
  return steps.map(([key, count], i) => ({
    key,
    count: count || 0,
    fromPrev: i === 0 ? null : rate(count || 0, steps[i - 1][1] || 0),
    fromTop: i === 0 ? null : rate(count || 0, top),
  }));
}

/** Server-side guard for the beacon body. Returns a clean hit or null. */
export function cleanFunnelHit(body) {
  if (!body || typeof body !== 'object') return null;
  const stage = typeof body.stage === 'string' ? body.stage : '';
  const vid = typeof body.vid === 'string' ? body.vid : '';
  if (!FUNNEL_STAGES.includes(stage) || !/^[a-z0-9]{16,40}$/i.test(vid)) return null;
  // Only the path, never a query string (it may carry personal data); limited and URL-safe.
  let path = typeof body.path === 'string' ? body.path.split(/[?#]/)[0] : '';
  if (!/^\/[\w\-/.]{0,80}$/.test(path)) path = '';
  return { stage, vid: vid.toLowerCase(), path };
}

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse|pingdom|uptime/i;
export const isBotAgent = (ua) => !ua || BOT_RE.test(ua);
