import { describe, it, expect } from 'vitest';
import { buildDailyPlan, weakestSkill } from './studyPlan';

const base = {
  due: 30,
  newAvailable: 50,
  reviewsToday: 0,
  goal: 20,
  daysLeft: 60,
  targetBand: 7,
  skillBands: { listening: 6.5, reading: 5.5, writing: 6, speaking: 6 },
  sectionsDoneToday: [],
  mistakeWordsDue: 0,
  dailyMinutes: 45,
  now: new Date('2026-09-29T08:00:00Z'),
};

describe('weakestSkill', () => {
  it('picks the lowest band; an untried skill counts as weakest', () => {
    expect(weakestSkill(base.skillBands)).toBe('reading');
    expect(weakestSkill({ ...base.skillBands, speaking: null })).toBe('speaking');
  });
});

describe('buildDailyPlan', () => {
  it('starts with vocabulary review and focuses the weakest skill', () => {
    const plan = buildDailyPlan(base);
    expect(plan.tasks[0].key).toBe('review');
    expect(plan.tasks.find((t) => t.focus).skill).toBe('reading');
    expect(plan.headline).toBe('Imtihongacha 60 kun · maqsad 7.0');
  });

  it('marks work finished today as done', () => {
    const plan = buildDailyPlan({ ...base, reviewsToday: 25, sectionsDoneToday: ['reading'] });
    expect(plan.tasks.find((t) => t.key === 'review').done).toBe(true);
    expect(plan.tasks.find((t) => t.focus).done).toBe(true);
  });

  it('adds mistake words when due, and new words when nothing is due', () => {
    expect(buildDailyPlan({ ...base, mistakeWordsDue: 7 }).tasks.some((t) => t.key === 'mistakes')).toBe(true);
    expect(buildDailyPlan({ ...base, due: 0 }).tasks[0].key).toBe('new');
  });

  it('schedules a mock in the last two weeks every third day', () => {
    const days = [0, 1, 2].map((i) => buildDailyPlan({ ...base, daysLeft: 10, now: new Date(Date.UTC(2026, 8, 29 + i)) }));
    expect(days.filter((p) => p.tasks.some((t) => t.key === 'mock')).length).toBe(1);
    expect(days[0].intensity).toBe('intensive');
  });

  it('asks for an exam date when there is none', () => {
    expect(buildDailyPlan({ ...base, daysLeft: null }).headline).toMatch(/sanasini/);
  });
});
