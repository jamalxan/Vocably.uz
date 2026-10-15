// Reading/Listening test ro'yxati filtri (SkillHome) — sof funksiyalar, test qilinadi.
// Tur: to'liq test (40 savol: 3 passage / 4 part) yoki qisqa bo'lim mashqi (bitta
// passage 13-14 savol, bitta audio 10 savol). Holat: urinish bo'lmasa "boshlanmagan",
// baholangan/topshirilgan bo'lsa "tugallangan", qolgani (davom etmoqda, muddati
// o'tgan) "davom etmoqda" — ikkalasini ham davom ettirish/qayta boshlash mumkin.
export const FULL_TEST_QUESTIONS = 40;

export function testKind(test, skill) {
  return (test.sections?.[skill]?.questionCount || 0) >= FULL_TEST_QUESTIONS ? 'full' : 'short';
}

export function statusKind(st) {
  if (!st) return 'notStarted';
  if (st.status === 'graded' || st.status === 'submitted') return 'done';
  return 'inProgress';
}

/** Filtrlangan ro'yxat; `index` — asl ro'yxatdagi o'rin (raqam filtrdan o'zgarmaydi). */
export function filterTests(tests, statuses, { kind = 'all', status = 'all', query = '' }, skill) {
  const q = query.trim().toLowerCase();
  return (tests || [])
    .map((test, index) => ({ test, index }))
    .filter(({ test }) => kind === 'all' || testKind(test, skill) === kind)
    .filter(({ test }) => status === 'all' || statusKind(statuses?.[test.id]) === status)
    .filter(({ test }) => !q || String(test.title || '').toLowerCase().includes(q));
}

export function countByKind(tests, skill) {
  const c = { all: tests.length, full: 0, short: 0 };
  for (const x of tests) c[testKind(x, skill)]++;
  return c;
}

export function countByStatus(tests, statuses) {
  const c = { all: tests.length, notStarted: 0, inProgress: 0, done: 0 };
  for (const x of tests) c[statusKind(statuses?.[x.id])]++;
  return c;
}
