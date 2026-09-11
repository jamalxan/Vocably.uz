import { describe, it, expect } from 'vitest';
import { computeTypeAccuracy, weakestType } from './analytics';
import type { AttemptResult, QuestionType } from './types';

function q(number: number, type: QuestionType, correct: boolean): AttemptResult['perQuestion'][number] {
  return { number, type, correct, userAnswer: correct ? 'x' : 'y', accepted: ['x'] };
}

describe('computeTypeAccuracy', () => {
  it('groups questions by type and computes accuracy', () => {
    const perQuestion = [
      q(1, 'true_false_notgiven', true),
      q(2, 'true_false_notgiven', false),
      q(3, 'true_false_notgiven', false),
      q(4, 'short_answer', true),
      q(5, 'short_answer', true),
    ];
    const result = computeTypeAccuracy(perQuestion);
    const tfng = result.find((r) => r.type === 'true_false_notgiven')!;
    const short = result.find((r) => r.type === 'short_answer')!;
    expect(tfng).toEqual({ type: 'true_false_notgiven', correct: 1, total: 3, accuracy: 1 / 3 });
    expect(short).toEqual({ type: 'short_answer', correct: 2, total: 2, accuracy: 1 });
  });

  it('sorts weakest (lowest accuracy) first', () => {
    const perQuestion = [
      q(1, 'short_answer', true),
      q(2, 'true_false_notgiven', false),
      q(3, 'true_false_notgiven', false),
    ];
    const result = computeTypeAccuracy(perQuestion);
    expect(result[0].type).toBe('true_false_notgiven');
    expect(result[0].accuracy).toBe(0);
  });

  it('returns an empty array for no questions', () => {
    expect(computeTypeAccuracy([])).toEqual([]);
  });
});

describe('weakestType', () => {
  it('returns the type with the lowest accuracy', () => {
    const perQuestion = [
      q(1, 'short_answer', true),
      q(2, 'short_answer', true),
      q(3, 'true_false_notgiven', false),
      q(4, 'true_false_notgiven', true),
    ];
    const weakest = weakestType(perQuestion);
    expect(weakest?.type).toBe('true_false_notgiven');
    expect(weakest?.accuracy).toBe(0.5);
  });

  it('breaks a tie between equally-weak (0%) types by preferring the one with more questions', () => {
    const perQuestion = [
      q(1, 'short_answer', false), // 0/1 = 0%
      q(2, 'true_false_notgiven', false), // 0/2 = 0%
      q(3, 'true_false_notgiven', false),
    ];
    const weakest = weakestType(perQuestion);
    expect(weakest?.accuracy).toBe(0);
    expect(weakest?.type).toBe('true_false_notgiven'); // 2 questions > short_answer's 1
  });

  it('returns null when there are no questions', () => {
    expect(weakestType([])).toBeNull();
  });
});
