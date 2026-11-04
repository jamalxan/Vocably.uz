import { describe, it, expect } from 'vitest';
import { normalizeAnswers, stepsFor, isComplete, resumeStep, planSummary, toUserUpdate, DEFAULT_PLAN_DAYS } from './onboarding';

const NOW = new Date('2026-11-04T10:00:00Z');
const full = {
  goal: 'ielts', examType: 'academic', targetBand: 7, examDate: '2027-02-02',
  selfLevel: 'intermediate', dailyMinutes: 40, weakestSkill: 'writing',
};

describe('normalizeAnswers', () => {
  it('keeps valid answers', () => {
    const a = normalizeAnswers(full);
    expect(a).toMatchObject({ goal: 'ielts', targetBand: 7, examDate: '2027-02-02', dailyMinutes: 40 });
  });
  it('drops invalid values instead of throwing', () => {
    const a = normalizeAnswers({ goal: 'x', targetBand: 6.3, dailyMinutes: 15, weakestSkill: 'math', examDate: 'nope', diagnosticLevel: 'Z9' });
    expect(a).toMatchObject({ goal: null, targetBand: null, dailyMinutes: null, weakestSkill: null, examDate: null, diagnosticLevel: null });
  });
  it('tolerates null / garbage input', () => {
    expect(normalizeAnswers(null).goal).toBe(null);
    expect(normalizeAnswers('x').goal).toBe(null);
  });
  it('clamps the diagnostic score', () => {
    expect(normalizeAnswers({ diagnosticScore: 140 }).diagnosticScore).toBe(100);
    expect(normalizeAnswers({ diagnosticScore: null }).diagnosticScore).toBe(null);
  });
});

describe('steps', () => {
  it('IELTS learners get 7 steps, general learners skip exam questions', () => {
    expect(stepsFor({ goal: 'ielts' })).toHaveLength(7);
    expect(stepsFor({ goal: 'general' })).toEqual(['goal', 'selfLevel', 'dailyMinutes', 'weakestSkill']);
  });
  it('"don\'t know" counts as an answered exam date', () => {
    expect(isComplete(normalizeAnswers({ ...full, examDate: null, examDateUnknown: true }))).toBe(true);
  });
  it('resumes at the first unanswered step', () => {
    expect(resumeStep(normalizeAnswers({ goal: 'ielts', examType: 'academic' }))).toBe(2);
    expect(resumeStep(normalizeAnswers(full))).toBe(7);
  });
});

describe('planSummary', () => {
  it('counts days to the exam and words needed', () => {
    const s = planSummary(normalizeAnswers(full), NOW);
    expect(s.days).toBe(90);
    expect(s.cefr).toBe('B1'); // self-rated intermediate
    expect(s.wordsNeeded).toBe(5500 - 2000);
    expect(s.minutesPerDay).toBe(40);
    expect(s.wordsPerDay).toBeGreaterThan(0);
  });
  it('uses 90 days when the exam date is unknown', () => {
    const s = planSummary(normalizeAnswers({ ...full, examDate: null, examDateUnknown: true }), NOW);
    expect(s.days).toBe(DEFAULT_PLAN_DAYS);
  });
  it('prefers the diagnostic level over the self-rating', () => {
    const s = planSummary(normalizeAnswers({ ...full, diagnosticLevel: 'C1' }), NOW);
    expect(s.cefr).toBe('C1');
    expect(s.wordsNeeded).toBe(0);
    expect(s.onTrack).toBe(true);
  });
  it('flags an unreachable goal with too few minutes', () => {
    const s = planSummary(normalizeAnswers({ ...full, dailyMinutes: 10, examDate: '2026-11-20', selfLevel: 'beginner' }), NOW);
    expect(s.onTrack).toBe(false);
  });
  it('never returns zero or negative days for a past exam date', () => {
    expect(planSummary(normalizeAnswers({ ...full, examDate: '2026-01-01' }), NOW).days).toBe(1);
  });
});

describe('toUserUpdate', () => {
  it('fills a 90-day estimated exam date when unknown', () => {
    const u = toUserUpdate(normalizeAnswers({ ...full, examDate: null, examDateUnknown: true }), NOW);
    expect(u.examDateEstimated).toBe(true);
    expect(Math.round((u.examDate - NOW) / 86400000)).toBe(90);
  });
  it('clears IELTS fields for general-English learners', () => {
    const u = toUserUpdate(normalizeAnswers({ goal: 'general', selfLevel: 'beginner', dailyMinutes: 10, weakestSkill: 'speaking' }), NOW);
    expect(u).toMatchObject({ examType: null, targetBand: null, examDate: null, goal: 'general' });
  });
  it('stores the diagnostic result', () => {
    const u = toUserUpdate(normalizeAnswers({ ...full, diagnosticLevel: 'B2', diagnosticScore: 70 }), NOW);
    expect(u['vocabOnboarding.estimatedLevel']).toBe('B2');
    expect(u['vocabOnboarding.estimatedScore']).toBe(70);
  });
});
