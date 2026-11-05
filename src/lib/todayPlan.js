// "Bugungi reja" engine — Vocably 2.0 (TZ 2.0 §6.2). Pure; tested in todayPlan.test.js.
// The server (src/lib/plan/server.js) builds one plan per user per local day, stores it
// (DailyPlan), and marks tasks done from activity signals; this module only decides WHAT
// today's tasks are and WHEN a task counts as done.
//
// Rules (TZ §6.2):
//   - SRS review is mandatory whenever anything is due.
//   - New words, 1 skill task, 1 game; a mock section once a week.
//   - The skill task rotates over a 5-day cycle where the weakest skill gets 2 of 5 days
//     (= the 40% weight), every other skill 1 of 5.
//   - Task count follows the daily minutes; never fewer than 3, never more than 6 tasks.
//   - Unfinished skill/mock tasks carry over at 50% (rounded up), the rest are dropped,
//     so a skipped week can't snowball into an impossible queue. Review/new/game don't
//     carry — they're rebuilt from live SRS state every day anyway.

export const SKILLS = ['reading', 'listening', 'writing', 'speaking'];
export const MIN_TASKS = 3;
export const MAX_TASKS = 6;
export const XP = { review: 10, new: 10, game: 10, skill: 20, mock: 40 };
export const PLAN_VERSION = 1;

const SKILL_TASK = {
  reading: { title: '1 ta Reading passage', minutes: 20, href: '/app/reading' },
  listening: { title: '1 ta Listening part', minutes: 10, href: '/app/listening' },
  writing: { title: 'Writing Task 2 insho', minutes: 40, href: '/app/writing' },
  writingShort: { title: 'Writing Task 1 (grafik tavsifi)', minutes: 20, href: '/app/writing' },
  speaking: { title: 'Speaking: Part 2 cue card', minutes: 10, href: '/app/speaking' },
};

/** New words per day by the daily-minutes choice (onboarding offers 10/20/40/60). */
function newWordTarget(minutes) {
  if (minutes >= 60) return 15;
  if (minutes >= 40) return 12;
  if (minutes >= 20) return 8;
  return 5;
}

/** Weakest skill: explicit band data wins; an untried skill counts as weakest; else the onboarding answer. */
export function pickWeakest(skillBands = {}, declared = null) {
  const scored = SKILLS.map((s) => ({ s, b: skillBands?.[s] ?? null }));
  const known = scored.filter((x) => x.b != null);
  if (known.length === SKILLS.length) return known.sort((a, b) => a.b - b.b)[0].s;
  if (declared && SKILLS.includes(declared) && skillBands?.[declared] == null) return declared;
  if (known.length === 0) return declared && SKILLS.includes(declared) ? declared : 'writing';
  return scored.find((x) => x.b == null).s;
}

/** 5-day rotation: weak, a, weak, b, c → weakest = 40%. */
export function skillForDay(weakest, dayIndex) {
  const others = SKILLS.filter((s) => s !== weakest);
  const cycle = [weakest, others[0], weakest, others[1], others[2]];
  return cycle[((dayIndex % 5) + 5) % 5];
}

export function dayIndexOf(date) {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
}

function skillTask(skill, minutes, dayIndex) {
  const short = skill === 'writing' && (minutes < 40 || dayIndex % 2 === 1);
  const t = short ? SKILL_TASK.writingShort : SKILL_TASK[skill];
  return { key: `skill-${skill}`, type: 'skill', skill, title: t.title, minutes: t.minutes, href: t.href, xp: XP.skill, target: 1 };
}

/**
 * @param {object} p
 * @param {string} p.date               local 'YYYY-MM-DD'
 * @param {number|null} p.minutes       daily minutes from onboarding/profile
 * @param {number} p.due                SRS words due now
 * @param {number} p.newAvailable       never-studied words in the user's decks
 * @param {object} [p.skillBands]
 * @param {string|null} [p.weakestSkill] onboarding answer
 * @param {number|null} [p.daysLeft]
 * @param {Array} [p.previousTasks]     yesterday's stored tasks (for carry-over)
 */
export function buildTodayPlan(p) {
  const minutes = p.minutes && p.minutes > 0 ? p.minutes : 20;
  const day = dayIndexOf(p.date);
  const weakest = pickWeakest(p.skillBands, p.weakestSkill);
  const tasks = [];

  // 1. SRS review — mandatory.
  if ((p.due || 0) > 0) {
    const count = Math.min(p.due, Math.max(10, Math.round(minutes * 1.2)));
    tasks.push({
      key: 'review', type: 'review', title: `${count} ta so‘zni takrorlash`,
      minutes: Math.max(3, Math.ceil(count / 4)), href: '/app/vocabulary/review', xp: XP.review, target: count,
    });
  }

  // 2. One game — always present: it's the quick, reachable task that keeps a streak alive
  // (TZ 2.0 §6.8.2: a streak day = ≥1 plan task done).
  tasks.push({ key: 'game', type: 'game', title: '1 ta o‘yin — so‘zlarni mustahkamlash', minutes: 5, href: '/app/games', xp: XP.game, target: 1 });

  const optional = [];

  // 3. Carry-over: 50% (rounded up) of yesterday's unfinished skill/mock tasks.
  const unfinished = (p.previousTasks || []).filter((t) => (t.type === 'skill' || t.type === 'mock') && t.status !== 'done');
  const carried = unfinished.slice(0, Math.ceil(unfinished.length / 2));
  for (const t of carried) {
    optional.push({
      key: t.key, type: t.type, skill: t.skill, title: t.title, minutes: t.minutes, href: t.href,
      xp: t.xp ?? (t.type === 'mock' ? XP.mock : XP.skill), target: 1, carried: true,
    });
  }

  // 4. Today's skill (40% weighted to the weakest).
  const skill = skillForDay(weakest, day);
  optional.push({ ...skillTask(skill, minutes, day), focus: skill === weakest });

  // 5. New words.
  const n = newWordTarget(minutes);
  optional.push((p.newAvailable || 0) > 0
    ? { key: 'new', type: 'new', title: `${Math.min(n, p.newAvailable)} ta yangi so‘z`, minutes: Math.ceil(Math.min(n, p.newAvailable) * 0.75), href: '/app/vocabulary/flashcards', xp: XP.new, target: Math.min(n, p.newAvailable) }
    : { key: 'new', type: 'new', title: `Kutubxonadan ${n} ta yangi so‘z qo‘shish`, minutes: 5, href: '/app/vocabulary/library', xp: XP.new, target: n, needsWords: true });


  // De-duplicate (a carried skill task can equal today's skill task).
  const seen = new Set(tasks.map((t) => t.key));
  const pool = optional.filter((t) => (seen.has(t.key) ? false : (seen.add(t.key), true)));

  // Fill by priority while the time budget allows (25% slack), but at least MIN_TASKS.
  let used = tasks.reduce((s, t) => s + t.minutes, 0);
  for (const t of pool) {
    if (tasks.length >= MAX_TASKS) break;
    if (tasks.length < MIN_TASKS || used + t.minutes <= minutes * 1.25) {
      tasks.push(t);
      used += t.minutes;
    }
  }

  // 6. Mock: one section a week for everyone; near the exam a full mock every 3rd day.
  const dl = p.daysLeft;
  const fullMock = dl != null && dl > 0 && dl <= 14 && day % 3 === 0;
  const weeklySection = day % 7 === 5;
  if ((fullMock || weeklySection) && !seen.has('mock')) {
    const mock = fullMock
      ? { key: 'mock', type: 'mock', title: 'To‘liq mock test (imtihon sharoiti)', minutes: 165, href: '/app/mock', xp: XP.mock * 2, target: 1 }
      : { key: 'mock', type: 'mock', title: 'Haftalik mock bo‘lim', minutes: 40, href: '/app/mock', xp: XP.mock, target: 1 };
    if (tasks.length >= MAX_TASKS) tasks.pop();
    tasks.push(mock);
  }

  return {
    version: PLAN_VERSION,
    date: p.date,
    minutes,
    weakest,
    tasks: tasks.map((t) => ({ ...t, status: 'todo', progress: 0 })),
  };
}

/**
 * Today's activity → task progress. Signals come from the server:
 * { reviews, newWords, games, sections: ['reading', ..., 'mock'] }.
 * Returns the keys that just became done.
 */
export function applySignals(tasks, s) {
  const newlyDone = [];
  for (const t of tasks) {
    if (t.status === 'done') continue;
    let progress = 0;
    if (t.type === 'review') progress = s.reviews || 0;
    else if (t.type === 'new') progress = s.newWords || 0;
    else if (t.type === 'game') progress = s.games || 0;
    else if (t.type === 'skill') progress = (s.sections || []).includes(t.skill) ? 1 : 0;
    else if (t.type === 'mock') progress = (s.sections || []).includes('mock') ? 1 : 0;
    t.progress = Math.min(progress, t.target || 1);
    if (progress >= (t.target || 1)) {
      t.status = 'done';
      newlyDone.push(t.key);
    }
  }
  return newlyDone;
}

/** Inputs that, when changed, rebuild today's plan (TZ: "imtihon sanasi o'zgarsa qayta hisoblanadi"). */
export function planInputsKey(u) {
  const exam = u.examDate ? new Date(u.examDate).toISOString().slice(0, 10) : '';
  return [PLAN_VERSION, u.dailyStudyMinutes || '', exam, u.weakestSkill || '', u.targetBand || ''].join('|');
}

/** Rebuild keeping progress of tasks that survive (same key). */
export function mergeRebuilt(oldTasks, fresh) {
  const byKey = new Map((oldTasks || []).map((t) => [t.key, t]));
  return fresh.map((t) => {
    const prev = byKey.get(t.key);
    return prev && prev.status === 'done' ? { ...t, status: 'done', progress: prev.progress, doneAt: prev.doneAt } : t;
  });
}

export function planProgress(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  return {
    total,
    done,
    pct: total ? Math.round((done / total) * 100) : 0,
    minutes: tasks.reduce((s, t) => s + t.minutes, 0),
    xpEarned: tasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.xp || 0), 0),
    xpTotal: tasks.reduce((s, t) => s + (t.xp || 0), 0),
  };
}
