import { describe, it, expect } from 'vitest';
import {
  buildTodayPlan, applySignals, pickWeakest, skillForDay, dayIndexOf, mergeRebuilt, planInputsKey, planProgress,
  MIN_TASKS, MAX_TASKS,
} from './todayPlan';

// 2026-11-04 → dayIndex 20761; %5 = 1, %7 = 6.
const base = { date: '2026-11-04', minutes: 40, due: 30, newAvailable: 50, skillBands: {}, weakestSkill: 'writing', daysLeft: 90 };

function dateWith(mod7) {
  // find a date whose dayIndex % 7 === mod7
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2026, 10, 4 + i)).toISOString().slice(0, 10);
    if (dayIndexOf(d) % 7 === mod7) return d;
  }
  throw new Error('unreachable');
}

describe('pickWeakest', () => {
  it('uses the lowest band when all four are known', () => {
    expect(pickWeakest({ reading: 7, listening: 6, writing: 6.5, speaking: 7 }, 'writing')).toBe('listening');
  });
  it('falls back to the onboarding answer with no data', () => {
    expect(pickWeakest({}, 'speaking')).toBe('speaking');
    expect(pickWeakest({}, null)).toBe('writing');
  });
});

describe('skillForDay', () => {
  it('gives the weakest skill 2 of every 5 days (40%)', () => {
    const days = [0, 1, 2, 3, 4].map((d) => skillForDay('speaking', d));
    expect(days.filter((s) => s === 'speaking')).toHaveLength(2);
    expect(new Set(days).size).toBe(4);
  });
});

describe('buildTodayPlan', () => {
  it('always starts with the mandatory SRS review when words are due', () => {
    const p = buildTodayPlan(base);
    expect(p.tasks[0].key).toBe('review');
    expect(p.tasks.every((t) => t.status === 'todo')).toBe(true);
  });
  it('keeps between 3 and 6 tasks for every minutes option', () => {
    for (const minutes of [10, 20, 40, 60]) {
      for (let i = 0; i < 14; i++) {
        const date = new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10);
        const n = buildTodayPlan({ ...base, minutes, date }).tasks.length;
        expect(n).toBeGreaterThanOrEqual(MIN_TASKS);
        expect(n).toBeLessThanOrEqual(MAX_TASKS);
      }
    }
  });
  it('more minutes → at least as much planned time', () => {
    const t10 = planProgress(buildTodayPlan({ ...base, minutes: 10 }).tasks).minutes;
    const t60 = planProgress(buildTodayPlan({ ...base, minutes: 60 }).tasks).minutes;
    expect(t60).toBeGreaterThanOrEqual(t10);
  });
  it('asks to add words from the library when the user has none', () => {
    const p = buildTodayPlan({ ...base, due: 0, newAvailable: 0 });
    const nw = p.tasks.find((t) => t.key === 'new');
    expect(nw.needsWords).toBe(true);
    expect(nw.href).toBe('/app/vocabulary/library');
  });
  it('adds a weekly mock section on the mock day', () => {
    const p = buildTodayPlan({ ...base, date: dateWith(5) });
    expect(p.tasks.find((t) => t.key === 'mock')?.title).toMatch(/Haftalik/);
    const q = buildTodayPlan({ ...base, date: dateWith(2) });
    expect(q.tasks.find((t) => t.key === 'mock')).toBeUndefined();
  });
  it('carries 50% (rounded up) of unfinished skill tasks', () => {
    const previousTasks = [
      { key: 'skill-reading', type: 'skill', skill: 'reading', title: 'R', minutes: 20, href: '/x', status: 'todo' },
      { key: 'mock', type: 'mock', title: 'M', minutes: 40, href: '/m', status: 'todo' },
      { key: 'skill-speaking', type: 'skill', skill: 'speaking', title: 'S', minutes: 10, href: '/s', status: 'todo' },
      { key: 'review', type: 'review', title: 'rv', minutes: 5, href: '/r', status: 'todo' },
      { key: 'skill-listening', type: 'skill', skill: 'listening', title: 'L', minutes: 10, href: '/l', status: 'done' },
    ];
    const p = buildTodayPlan({ ...base, minutes: 60, previousTasks });
    const carried = p.tasks.filter((t) => t.carried);
    expect(carried.map((t) => t.key)).toEqual(['skill-reading', 'mock']); // 3 unfinished → 2
  });
  it('does not duplicate a carried task that is also today\'s skill', () => {
    const d = '2026-11-04';
    const todaySkill = skillForDay('writing', dayIndexOf(d));
    const p = buildTodayPlan({ ...base, date: d, previousTasks: [{ key: `skill-${todaySkill}`, type: 'skill', skill: todaySkill, title: 'x', minutes: 10, href: '/', status: 'todo' }] });
    expect(p.tasks.filter((t) => t.key === `skill-${todaySkill}`)).toHaveLength(1);
  });
});

describe('applySignals', () => {
  it('marks tasks done from activity and reports only the new ones', () => {
    const p = buildTodayPlan({ ...base, minutes: 60 });
    const review = p.tasks.find((t) => t.key === 'review');
    let done = applySignals(p.tasks, { reviews: review.target, newWords: 0, games: 1, sections: [] });
    expect(done).toEqual(expect.arrayContaining(['review', 'game']));
    done = applySignals(p.tasks, { reviews: 999, games: 5, sections: [] });
    expect(done).toEqual([]);
  });
  it('tracks partial progress', () => {
    const p = buildTodayPlan(base);
    applySignals(p.tasks, { reviews: 3 });
    expect(p.tasks.find((t) => t.key === 'review').progress).toBe(3);
  });
});

describe('rebuild', () => {
  it('changes the inputs key when the exam date changes', () => {
    const a = planInputsKey({ dailyStudyMinutes: 20, examDate: '2027-01-01' });
    const b = planInputsKey({ dailyStudyMinutes: 20, examDate: '2027-02-01' });
    expect(a).not.toBe(b);
  });
  it('keeps done tasks that survive a rebuild', () => {
    const old = [{ key: 'review', status: 'done', progress: 20, doneAt: 'x' }];
    const fresh = buildTodayPlan(base).tasks;
    const merged = mergeRebuilt(old, fresh);
    expect(merged.find((t) => t.key === 'review').status).toBe('done');
  });
});
