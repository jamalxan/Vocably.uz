import { describe, it, expect } from 'vitest';
import { deriveAssignmentStatus } from './assignmentStatus';

describe('deriveAssignmentStatus', () => {
  it('returns not_started when there are no attempts', () => {
    expect(deriveAssignmentStatus([])).toEqual({ status: 'not_started', band: null });
    expect(deriveAssignmentStatus(null)).toEqual({ status: 'not_started', band: null });
    expect(deriveAssignmentStatus(undefined)).toEqual({ status: 'not_started', band: null });
  });

  it('treats only expired/abandoned attempts as not_started (student has not meaningfully begun)', () => {
    const result = deriveAssignmentStatus([
      { status: 'expired', createdAt: '2026-01-01' },
      { status: 'abandoned', createdAt: '2026-01-02' },
    ]);
    expect(result).toEqual({ status: 'not_started', band: null });
  });

  it('returns in_progress when an attempt is in_progress and none are graded', () => {
    const result = deriveAssignmentStatus([{ status: 'in_progress', createdAt: '2026-01-01' }]);
    expect(result).toEqual({ status: 'in_progress', band: null });
  });

  it('returns in_progress for a submitted-but-not-yet-graded attempt', () => {
    const result = deriveAssignmentStatus([{ status: 'submitted', createdAt: '2026-01-01' }]);
    expect(result).toEqual({ status: 'in_progress', band: null });
  });

  it('returns graded with the band when an attempt is graded', () => {
    const result = deriveAssignmentStatus([
      { status: 'graded', result: { overall: 6.5 }, createdAt: '2026-01-01' },
    ]);
    expect(result).toEqual({ status: 'graded', band: 6.5 });
  });

  it('prefers graded over in_progress when both exist', () => {
    const result = deriveAssignmentStatus([
      { status: 'in_progress', createdAt: '2026-01-02' },
      { status: 'graded', result: { overall: 7 }, createdAt: '2026-01-01' },
    ]);
    expect(result).toEqual({ status: 'graded', band: 7 });
  });

  it('picks the most recently created graded attempt when there are several (retake)', () => {
    const result = deriveAssignmentStatus([
      { status: 'graded', result: { overall: 5.5 }, createdAt: '2026-01-01' },
      { status: 'graded', result: { overall: 7 }, createdAt: '2026-01-10' },
    ]);
    expect(result).toEqual({ status: 'graded', band: 7 });
  });

  it('handles a graded attempt with a missing result.overall as band null (still graded)', () => {
    const result = deriveAssignmentStatus([{ status: 'graded', result: {}, createdAt: '2026-01-01' }]);
    expect(result).toEqual({ status: 'graded', band: null });
  });
});
