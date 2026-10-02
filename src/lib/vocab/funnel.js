// Ro'yxatdan o'tish voronkasi va qaytish (D1/D7) — sof hisoblash (DB'siz, testlanadigan).
// "Faol" = o'yin boshlagan yoki takrorlash qilgan. D-N qaytish: ro'yxatdan o'tgandan N·24 soat o'tib, keyingi 24 soat ichida faollik.
const DAY = 24 * 3600 * 1000;

/**
 * @param {{ id: string, createdAt: Date|string|number }[]} users — kogorta (tanlangan oynada ro'yxatdan o'tganlar)
 * @param {{ userId: string, at: Date|string|number, kind: 'game'|'review' }[]} events — kogorta foydalanuvchilarining faolligi
 * @param {Date} now
 */
export function computeSignupFunnel(users, events, now = new Date()) {
  const byUser = new Map();
  for (const e of events) {
    const k = String(e.userId);
    if (!byUser.has(k)) byUser.set(k, []);
    byUser.get(k).push({ at: new Date(e.at).getTime(), kind: e.kind });
  }

  let firstGame24h = 0;
  const ret = { 1: { eligible: 0, retained: 0 }, 7: { eligible: 0, retained: 0 } };
  for (const u of users) {
    const t0 = new Date(u.createdAt).getTime();
    const evs = byUser.get(String(u.id)) || [];
    if (evs.some((e) => e.kind === 'game' && e.at >= t0 && e.at < t0 + DAY)) firstGame24h++;
    for (const n of [1, 7]) {
      const from = t0 + n * DAY;
      if (from + DAY > now.getTime()) continue; // oyna hali tugamagan — hisobga olinmaydi (qaytish past ko'rinib qolmasin)
      ret[n].eligible++;
      if (evs.some((e) => e.at >= from && e.at < from + DAY)) ret[n].retained++;
    }
  }
  const rate = (n, d) => (d ? Math.round((n / d) * 100) : null);
  return {
    signups: users.length,
    firstGame24h,
    firstGame24hRate: rate(firstGame24h, users.length),
    d1: { ...ret[1], rate: rate(ret[1].retained, ret[1].eligible) },
    d7: { ...ret[7], rate: rate(ret[7].retained, ret[7].eligible) },
  };
}
