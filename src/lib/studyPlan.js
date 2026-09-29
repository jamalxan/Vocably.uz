// Daily study plan (pure — tested in studyPlan.test.js). Turns what the
// dashboard already knows — due words, exam date, target band, per-skill
// bands, today's finished sections, mistake words — into 3–6 concrete tasks
// for today, so the user never has to wonder "what should I do now".
//
// Rules:
//   - Vocabulary review is always first (SRS only works if done daily).
//   - The weakest skill gets today's main exercise; a skill never tried
//     counts as weakest (no data = biggest unknown).
//   - A second, rotating skill keeps all four moving across the week.
//   - Mistake words are drilled when any are due.
//   - Close to the exam, a mock test replaces the rotating skill weekly
//     (every 3rd day in the last two weeks).

const SKILLS = ['listening', 'reading', 'writing', 'speaking'];

const SKILL_TASK = {
  reading: { title: '1 ta Reading passage', minutes: 20, href: '/app/oqish' },
  listening: { title: '1 ta Listening part', minutes: 10, href: '/app/tinglash' },
  writing: { title: 'Writing Task 2 insho', minutes: 40, href: '/app/yozish' },
  writingShort: { title: 'Writing Task 1 (grafik tavsifi)', minutes: 20, href: '/app/yozish' },
  speaking: { title: 'Speaking: Part 2 cue card', minutes: 10, href: '/app/gapirish' },
};

export function weakestSkill(skillBands = {}) {
  const ranked = SKILLS.map((s) => ({ s, b: skillBands?.[s] ?? null })).sort((a, b) => {
    if (a.b == null && b.b == null) return 0;
    if (a.b == null) return -1;
    if (b.b == null) return 1;
    return a.b - b.b;
  });
  return ranked[0].s;
}

function dayIndex(date) {
  return Math.floor(new Date(date).getTime() / 86400000);
}

/**
 * @param {object} p
 * @param {number} p.due               SRS words due now
 * @param {number} p.newAvailable      new (never studied) words
 * @param {number} p.reviewsToday
 * @param {number} p.goal              daily review goal
 * @param {number|null} p.daysLeft     days until the exam (null = no date)
 * @param {number|null} p.targetBand
 * @param {object} p.skillBands        { listening, reading, writing, speaking }
 * @param {string[]} p.sectionsDoneToday
 * @param {number} p.mistakeWordsDue
 * @param {number|null} p.dailyMinutes
 * @param {Date|string} p.now
 */
export function buildDailyPlan(p) {
  const now = p.now || new Date();
  const day = dayIndex(now);
  const done = new Set(p.sectionsDoneToday || []);
  const minutes = p.dailyMinutes || 45;
  const tasks = [];

  // 1. Vocabulary
  const reviewCount = Math.min(p.due || 0, Math.max(20, p.goal || 20));
  if (reviewCount > 0) {
    tasks.push({
      key: 'review',
      title: `${reviewCount} ta so‘zni takrorlash`,
      minutes: Math.max(5, Math.round(reviewCount / 4)),
      href: '/app/lugat/takrorlash',
      done: (p.reviewsToday || 0) >= reviewCount,
    });
  } else if ((p.newAvailable || 0) > 0) {
    const n = minutes >= 45 ? 20 : 10;
    tasks.push({ key: 'new', title: `${n} ta yangi so‘z o‘rganish`, minutes: Math.round(n / 2), href: '/app/lugat/kartochka', done: false });
  }

  // 2. Mistakes
  if ((p.mistakeWordsDue || 0) > 0) {
    tasks.push({
      key: 'mistakes',
      title: `Xatolardan ${Math.min(p.mistakeWordsDue, 15)} ta so‘z`,
      minutes: 5,
      href: '/app/xatolar',
      done: false,
    });
  }

  // 3. Weakest skill — the main exercise
  const weak = weakestSkill(p.skillBands);
  const weakTask = weak === 'writing' && day % 2 === 1 ? SKILL_TASK.writingShort : SKILL_TASK[weak];
  tasks.push({ key: `skill-${weak}`, skill: weak, focus: true, ...weakTask, done: done.has(weak) });

  // 4. Mock close to the exam, otherwise a rotating second skill
  const dl = p.daysLeft;
  const mockDay = dl != null && dl >= 0 && ((dl <= 14 && day % 3 === 0) || (dl <= 45 && day % 7 === 0));
  if (mockDay) {
    tasks.push({ key: 'mock', title: 'Mock test (imtihon sharoiti)', minutes: 160, href: '/app/mock', done: done.has('mock') });
  } else {
    const others = SKILLS.filter((s) => s !== weak);
    const second = others[day % others.length];
    if (minutes >= 30) tasks.push({ key: `skill-${second}`, skill: second, ...SKILL_TASK[second], done: done.has(second) });
  }

  const total = tasks.reduce((sum, t) => sum + t.minutes, 0);
  const remaining = tasks.filter((t) => !t.done).length;
  let headline;
  if (dl == null) headline = 'Imtihon sanasini profilda belgilang — reja unga moslashadi';
  else if (dl < 0) headline = 'Imtihon sanasi o‘tib ketgan — yangi sanani kiriting';
  else if (dl === 0) headline = 'Imtihon bugun — omad! Faqat yengil takrorlash';
  else headline = `Imtihongacha ${dl} kun${p.targetBand ? ` · maqsad ${Number(p.targetBand).toFixed(1)}` : ''}`;

  return { tasks, totalMinutes: total, remaining, weakest: weak, headline, intensity: dl != null && dl <= 14 ? 'intensive' : 'steady' };
}
