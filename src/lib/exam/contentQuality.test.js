import { describe, it, expect } from 'vitest';
import { contentQuality } from './contentQuality';

const att = (user, answers, status = 'graded') => ({
  testId: 't1',
  userId: user,
  status,
  result: { reading: { band: 6 }, perQuestion: answers.map(([number, correct, userAnswer]) => ({ number, correct, userAnswer, accepted: ['museum'] })) },
});

describe('contentQuality', () => {
  it('flags a question most learners miss the same way as a key suspect', () => {
    const attempts = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'].map((u, i) => att(u, [[1, false, 'library'], [2, i % 2 === 0, 'x']]));
    const [t] = contentQuality(attempts, { t1: 'Test 1' });
    expect(t.title).toBe('Test 1');
    expect(t.learners).toBe(6);
    expect(t.suspects.map((q) => q.number)).toEqual([1]);
    expect(t.suspects[0]).toMatchObject({ topWrong: 'library', topWrongShare: 1, accuracy: 0 });
    expect(t.hardest[0].number).toBe(1);
  });

  it('does not flag a key when one learner repeats the same test', () => {
    const attempts = [1, 2, 3, 4, 5, 6].map(() => att('solo', [[1, false, 'library']]));
    expect(contentQuality(attempts)[0].suspects).toEqual([]);
  });

  it('needs enough answers before judging, and reports completion', () => {
    const [t] = contentQuality([att('u1', [[1, false, 'a']]), { testId: 't1', userId: 'u2', status: 'abandoned' }]);
    expect(t.hardest).toEqual([]);
    expect(t.completion).toBe(0.5);
    expect(t.avgReading).toBe(6);
  });
});
