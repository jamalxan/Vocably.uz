import { describe, it, expect } from 'vitest';
import { validateTest, hasBlockingErrors } from './contentValidator';
import type { Test } from './types';

// N-04 (Sprint 2, VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — regression-safety
// test for `SpeakingSectionEditor.jsx`. This does NOT add new validator
// logic — `validateTest`'s speaking checks already existed
// (`contentValidator.ts` §speaking block). It confirms that the EXACT draft
// shape the editor builds (existing `sections` + a pasted `speaking` object,
// merged client-side per the "PATCH replaces the whole `sections` object,
// does not deep-merge" contract of `PATCH /api/admin/exam-tests/[id]`)
// round-trips through `validateTest` as expected: a well-formed paste passes
// with no blocking errors, and specific malformed pastes are caught.

const EXAMPLE_SPEAKING = {
  durationSec: 780,
  part1Questions: ['Question 1?', 'Question 2?'],
  part2CueCard: { topic: 'Describe a...', bulletPoints: ['point 1', 'point 2'], prepSec: 60, speakSec: 120 },
  part3Questions: ['Question 1?', 'Question 2?'],
};

function draftWithSpeaking(existingSections: Test['sections'], speaking: unknown): Partial<Test> {
  return {
    title: 'Cambridge IELTS 19 — Test 1',
    slug: 'cambridge-19-test-1',
    module: 'academic',
    sections: { ...existingSections, speaking } as Test['sections'],
  };
}

describe('SpeakingSectionEditor draft round-trip via validateTest (N-04)', () => {
  it('accepts the exact example JSON shape shown as a placeholder in the editor, merged with existing sections, with no blocking errors', () => {
    const existingSections: Test['sections'] = {
      reading: {
        durationSec: 3600,
        passages: [
          {
            order: 1,
            title: 'The history of glass',
            paragraphs: [{ label: 'A', html: `<p>${'word '.repeat(800)}</p>` }],
            questionGroups: [
              {
                id: 'g1',
                type: 'true_false_notgiven',
                instructionHtml: 'Do the statements agree?',
                questions: [{ number: 1, promptHtml: 'Statement 1', answer: { accepted: ['TRUE'] }, explanationHtml: 'Because...' }],
              },
            ],
          },
        ],
      },
    };
    const draft = draftWithSpeaking(existingSections, EXAMPLE_SPEAKING);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  it('accepts a speaking-only test (no other sections) with no blocking errors', () => {
    const draft = draftWithSpeaking({}, EXAMPLE_SPEAKING);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  it('does not touch/clobber an existing Reading section when merging speaking in (deep-merge safety)', () => {
    const existingSections: Test['sections'] = {
      reading: {
        durationSec: 3600,
        passages: [
          {
            order: 1,
            title: 'The history of glass',
            paragraphs: [{ label: 'A', html: `<p>${'word '.repeat(800)}</p>` }],
            questionGroups: [
              {
                id: 'g1',
                type: 'true_false_notgiven',
                instructionHtml: 'Do the statements agree?',
                questions: [{ number: 1, promptHtml: 'Statement 1', answer: { accepted: ['TRUE'] } }],
              },
            ],
          },
        ],
      },
    };
    const draft = draftWithSpeaking(existingSections, EXAMPLE_SPEAKING);
    expect(draft.sections?.reading).toEqual(existingSections.reading);
    expect(draft.sections?.speaking).toEqual(EXAMPLE_SPEAKING);
  });

  it('flags a blocking error when part2CueCard.speakSec is missing', () => {
    const invalid = { ...EXAMPLE_SPEAKING, part2CueCard: { ...EXAMPLE_SPEAKING.part2CueCard, speakSec: undefined } };
    const draft = draftWithSpeaking({}, invalid);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(true);
    expect(issues.some((i) => i.path === 'speaking.part2CueCard' && i.message.includes('speakSec'))).toBe(true);
  });

  it('flags a blocking error when part1Questions is empty', () => {
    const invalid = { ...EXAMPLE_SPEAKING, part1Questions: [] };
    const draft = draftWithSpeaking({}, invalid);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(true);
    expect(issues.some((i) => i.path === 'speaking.part1Questions')).toBe(true);
  });

  it('flags a blocking error when durationSec is 0 or missing', () => {
    const invalid = { ...EXAMPLE_SPEAKING, durationSec: 0 };
    const draft = draftWithSpeaking({}, invalid);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(true);
    expect(issues.some((i) => i.path === 'speaking')).toBe(true);
  });

  it('flags a blocking error when part3Questions is empty', () => {
    const invalid = { ...EXAMPLE_SPEAKING, part3Questions: [] };
    const draft = draftWithSpeaking({}, invalid);
    const issues = validateTest(draft);
    expect(hasBlockingErrors(issues)).toBe(true);
    expect(issues.some((i) => i.path === 'speaking.part3Questions')).toBe(true);
  });
});
