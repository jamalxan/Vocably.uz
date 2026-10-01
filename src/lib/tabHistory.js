// Mobil pastki tab-bar uchun navigatsiya tarixi qoidasi. Muammo: har bir tab bosilishi `push` qilinardi, shuning uchun
// Profil'dan "orqaga" bosilganda foydalanuvchi tasodifiy oldin ko'rgan tabga (AI, Mashq…) tushardi. Mobil ilovalardagi odat:
//   Bosh sahifa -> tab: push (Bosh sahifa ostida qoladi), tab -> tab: replace (tarix o'smaydi),
//   tab -> Bosh sahifa: Bosh sahifa yozuvi tarixda ostida bo'lsa shunga qaytiladi (back), aks holda replace.
// Natija: istalgan tab ildizidan "orqaga" doim Bosh sahifaga, undan keyingisi — ilovadan chiqish.
//
// "Ostida Bosh sahifa bor" belgisi sessionStorage'da `history.length` bilan birga saqlanadi: oraliqda yangi yozuv
// (`push`) qo'shilgan bo'lsa uzunlik o'zgaradi va belgi yaroqsiz hisoblanadi (xavfsiz tomonga — replace).

export const HOME_HREF = '/app';
const STORAGE_KEY = 'vocably.tabBase';

/**
 * @param {object} p
 * @param {string} p.pathname     joriy yo'l
 * @param {string} p.targetHref   bosilgan tab havolasi
 * @param {string[]} p.tabRoots   barcha tab ildiz yo'llari (Bosh sahifa ham)
 * @param {{ len: number } | null} p.base  saqlangan belgi (yoki null)
 * @param {number} p.historyLength  joriy `history.length`
 * @returns {{ action: 'noop'|'push'|'replace'|'back', nextBase: { len: number } | null }}
 */
export function decideTabNavigation({ pathname, targetHref, tabRoots, base, historyLength }) {
  if (pathname === targetHref) return { action: 'noop', nextBase: base };
  const onTabRoot = tabRoots.includes(pathname);
  const onHome = pathname === HOME_HREF;

  // Tab ildizidan boshqa joyda (ichki sahifa) — oddiy navigatsiya, taxmin qilinmaydi.
  if (!onTabRoot) return { action: 'push', nextBase: null };

  if (onHome) {
    // Bosh sahifa -> tab: yangi yozuv qo'shiladi; uzunlik shundan KEYIN +1 bo'ladi.
    return { action: 'push', nextBase: { len: historyLength + 1 } };
  }

  // Tab ildizi.
  if (targetHref === HOME_HREF) {
    const valid = base && base.len === historyLength;
    return valid ? { action: 'back', nextBase: null } : { action: 'replace', nextBase: null };
  }
  // tab -> tab: replace (uzunlik o'zgarmaydi, belgi o'z kuchida qoladi).
  return { action: 'replace', nextBase: base };
}

export function readBase(storage = typeof window !== 'undefined' ? window.sessionStorage : null) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed?.len) ? { len: parsed.len } : null;
  } catch {
    return null;
  }
}

export function writeBase(base, storage = typeof window !== 'undefined' ? window.sessionStorage : null) {
  try {
    if (!storage) return;
    if (base) storage.setItem(STORAGE_KEY, JSON.stringify(base));
    else storage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage yopiq (private rejim) — belgi saqlanmaydi, qoida replace'ga tushadi.
  }
}
