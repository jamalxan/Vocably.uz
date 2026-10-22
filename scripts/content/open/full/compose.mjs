// To'liq (40 savol) Reading / Listening testlari — bo'lim mashqlaridan yig'iladi.
//
// reading/reading-N.mjs (1 passage, 13-14 savol) va listening/listening-N.mjs
// (1 part, 10 savol) fayllari manba bo'lib qoladi; sets.json qaysi bo'limlar
// qaysi to'liq testga kirishini (barqaror `n` bilan) belgilaydi:
//   reading-full-N  = 3 passage (13 + 13 + 14 = 40 savol), 60 daqiqa
//   listening-full-N = 4 part (4 × 10 = 40 savol), 10 daqiqa tekshiruv vaqti
// Savollar 1..40 qayta raqamlanadi ({{qN}} joylari, subtitle oralig'i, group id'lar
// bilan), qolgan hamma narsa (matn, javob kaliti, izohlar, audio kaliti) aynan
// bo'lim faylidagidek. verify.mjs / openTests.test.ts / load-open-tests.mts bu
// testlarni ham boshqa seriyalar bilan bir xil tekshiradi (slug: vocably-<series>-N).
// sets.json'ni yangilash: node scripts/content/open/tools/full-sets-gen.mjs

export const READING_FULL_DURATION_SEC = 3600;
export const LISTENING_FULL_CHECK_SEC = 600;

const clone = (v) => JSON.parse(JSON.stringify(v));
const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

/** "Reading 12: The Rosetta Stone" → "The Rosetta Stone" */
export function topicOf(title) {
  return String(title || '').replace(/^(Reading|Listening)\s+\d+:\s*/i, '').trim();
}

function majorityDifficulty(sections) {
  const counts = {};
  for (const s of sections) counts[s.difficulty || 'medium'] = (counts[s.difficulty || 'medium'] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || DIFF_RANK[a[0]] - DIFF_RANK[b[0]])[0][0];
}

/** Savol raqamlarini `offset` ga suradi: number, {{qN}} joylari, group id prefiksi. */
function shiftGroups(groups, offset, prefix) {
  return groups.map((g) => {
    const out = clone(g);
    out.id = `${prefix}-${g.id}`;
    out.questions = out.questions.map((qq) => ({ ...qq, number: qq.number + offset }));
    if (out.stemHtml) {
      out.stemHtml = out.stemHtml.replace(/\{\{q(\d+)\}\}/g, (_, n) => `{{q${Number(n) + offset}}}`);
    }
    return out;
  });
}

const countQs = (groups) => groups.reduce((s, g) => s + g.questions.length, 0);

/**
 * @param {number} n to'liq test raqami
 * @param {object[]} sections 3 ta `reading` seriyasi testi (tartib = passage tartibi)
 */
export function composeReadingFull(n, sections) {
  if (sections.length !== 3) throw new Error(`reading-full-${n}: 3 ta bo'lim kerak, ${sections.length} bor`);
  let offset = 0;
  const passages = sections.map((s, i) => {
    const src = s.reading.passages[0];
    const qn = countQs(src.questionGroups);
    const from = offset + 1;
    const to = offset + qn;
    const passage = {
      ...clone(src),
      order: i + 1,
      subtitle: src.subtitle.replace(/questions \d+-\d+/, `questions ${from}-${to}`),
      questionGroups: shiftGroups(src.questionGroups, offset, `p${i + 1}`),
    };
    offset += qn;
    return passage;
  });
  if (offset !== 40) throw new Error(`reading-full-${n}: jami ${offset} savol (40 kerak) — bo'limlar: ${sections.map((s) => s.n).join(',')}`);
  return {
    slug: `vocably-reading-full-${n}`,
    title: `Reading Test ${n}: ${sections.map((s) => topicOf(s.title)).join(' · ')}`,
    difficulty: majorityDifficulty(sections),
    composedFrom: sections.map((s) => s.n),
    reading: { durationSec: READING_FULL_DURATION_SEC, passages },
  };
}

/**
 * @param {number} n to'liq test raqami
 * @param {object[]} sections 4 ta `listening` seriyasi testi (tartib = part tartibi)
 */
export function composeListeningFull(n, sections) {
  if (sections.length !== 4) throw new Error(`listening-full-${n}: 4 ta bo'lim kerak, ${sections.length} bor`);
  const parts = sections.map((s, i) => {
    const src = s.listening.parts[0];
    if (countQs(src.questionGroups) !== 10) throw new Error(`listening-full-${n}: bo'lim ${s.n} da 10 savol yo'q`);
    return { ...clone(src), order: i + 1, questionGroups: shiftGroups(src.questionGroups, i * 10, `p${i + 1}`) };
  });
  return {
    slug: `vocably-listening-full-${n}`,
    title: `Listening Test ${n}: ${sections.map((s) => topicOf(s.title)).join(' · ')}`,
    difficulty: majorityDifficulty(sections),
    composedFrom: sections.map((s) => s.n),
    listening: { audio: 'static', checkTimeSec: LISTENING_FULL_CHECK_SEC, parts },
  };
}

/** sets.json + bo'lim testlari → to'liq testlar ro'yxati ({ ...test, series, n }). */
export function composeAll(sets, sectionTests, onlySeries) {
  const byKey = new Map(sectionTests.map((t) => [`${t.series}-${t.n}`, t]));
  const pick = (series, ns) =>
    ns.map((k) => {
      const t = byKey.get(`${series}-${k}`);
      if (!t) throw new Error(`${series}-${k} bo'limi topilmadi (sets.json)`);
      return t;
    });
  const out = [];
  if (!onlySeries || onlySeries === 'reading-full') {
    for (const set of sets.reading || []) out.push({ ...composeReadingFull(set.n, pick('reading', set.parts)), series: 'reading-full', n: set.n });
  }
  if (!onlySeries || onlySeries === 'listening-full') {
    for (const set of sets.listening || []) out.push({ ...composeListeningFull(set.n, pick('listening', set.parts)), series: 'listening-full', n: set.n });
  }
  return out;
}
