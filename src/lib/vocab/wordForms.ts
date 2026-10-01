// So'z shakllari (TZ §22): matndagi "abandoned" / "significantly" ni lug'atdagi "abandon" / "significant" bilan
// bog'lash. Ikki yo'nalish: lug'at so'zidan barcha shakllar (matnni belgilash uchun) va matndagi shakldan
// mumkin bo'lgan asos so'zlar (qidirish uchun). Qoidaga asoslangan, ATAYLAB oddiy — noto'g'ri musbat
// bo'lsa foydalanuvchi popup'da ko'radi; modal fe'llar/noto'g'ri fe'llar qamrab olinmaydi.

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .trim();

export function normalizeToken(s: string): string {
  return norm(s);
}

const isVowel = (c: string) => 'aeiou'.includes(c);

/** Asos so'zdan hosil bo'ladigan shakllar (asosning o'zi birinchi). Bir so'zli birikmalar uchun faqat o'zi. */
export function inflectionForms(word: string): string[] {
  const w = norm(word);
  if (!w || /\s/.test(w)) return w ? [w] : [];
  const out = new Set<string>([w]);
  out.add(`${w}s`);
  out.add(`${w}es`);
  out.add(`${w}ed`);
  out.add(`${w}d`);
  out.add(`${w}ing`);
  out.add(`${w}ly`);
  out.add(`${w}er`);
  out.add(`${w}est`);
  out.add(`${w}ment`);
  out.add(`${w}ness`);
  if (w.endsWith('y') && w.length > 2 && !isVowel(w[w.length - 2])) {
    const stem = w.slice(0, -1);
    out.add(`${stem}ies`);
    out.add(`${stem}ied`);
    out.add(`${stem}ily`);
    out.add(`${stem}ier`);
    out.add(`${stem}iest`);
  }
  if (w.endsWith('e') && w.length > 2) {
    const stem = w.slice(0, -1);
    out.add(`${stem}ing`);
    out.add(`${stem}ed`);
    out.add(`${stem}ly`);
  }
  if (w.length >= 3 && /[^aeiou][aeiou][^aeiouwxy]$/.test(w)) {
    const last = w[w.length - 1];
    out.add(`${w}${last}ed`);
    out.add(`${w}${last}ing`);
    out.add(`${w}${last}er`);
  }
  if (w.endsWith('ic')) out.add(`${w}ally`);
  if (w.endsWith('le') && w.length > 3) out.add(`${w.slice(0, -1)}y`); // significant -> ... (kam uchraydi), simple -> simply
  return [...out];
}

/** Matndagi shakldan mumkin bo'lgan asos so'zlar (o'zi birinchi). Qidirishda har biri sinab ko'riladi. */
export function lemmaCandidates(surface: string): string[] {
  const s = norm(surface);
  if (!s) return [];
  const out = new Set<string>([s]);
  const strip = (suffix: string, add = '') => {
    if (s.endsWith(suffix) && s.length - suffix.length >= 2) out.add(s.slice(0, -suffix.length) + add);
  };
  strip('s');
  strip('es');
  strip('ies', 'y');
  strip('ed');
  strip('d');
  strip('ied', 'y');
  strip('ing');
  strip('ing', 'e');
  strip('ly');
  strip('ily', 'y');
  strip('ally');
  strip('er');
  strip('est');
  strip('ment');
  strip('ness');
  // ikkilangan undosh: stopped -> stop, running -> run
  const m = /^(.*?([^aeiou]))\2(ed|ing|er)$/.exec(s);
  if (m) out.add(m[1]);
  return [...out];
}

export interface FormEntry<T> {
  key: string;
  value: T;
}

/**
 * form -> qiymat xaritasi. Bir xil shakl bir nechta so'zga to'g'ri kelsa, ASOSNING O'ZI (aniq moslik) ustun,
 * aks holda birinchi kelgan saqlanadi. Bo'sh joyli birikmalar matn belgilashda ishtirok etmaydi (token'lar bir so'zli).
 */
export function buildFormIndex<T extends { word: string }>(words: T[]): Map<string, T> {
  const exact = new Map<string, T>();
  const derived = new Map<string, T>();
  for (const w of words) {
    const base = norm(w.word);
    if (!base || /\s/.test(base)) continue;
    if (!exact.has(base)) exact.set(base, w);
    for (const f of inflectionForms(base)) if (f !== base && !derived.has(f)) derived.set(f, w);
  }
  const index = new Map<string, T>(derived);
  for (const [k, v] of exact) index.set(k, v);
  return index;
}

/** Matn tokenlari (ingliz so'zlari) va ularning joylashuvi — belgilash uchun. */
export function tokenize(text: string): Array<{ token: string; start: number; end: number }> {
  const out: Array<{ token: string; start: number; end: number }> = [];
  const re = /[A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ token: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}
