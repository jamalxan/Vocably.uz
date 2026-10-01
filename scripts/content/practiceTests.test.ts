// Regression test: every original Vocably Practice Test content module (used by
// scripts/seed-practice-tests.mjs to seed real Reading/Listening/Writing content)
// must always pass the same admin-authoring validator real content goes through
// (TZ §15.2), be Mock-eligible, and be internally consistent (numbering, answer
// keys that actually exist among the options/bank, {{qN}} gaps in stems).
import { describe, it, expect } from 'vitest';
import { validateTest, hasBlockingErrors, checkMockEligibility } from '../../src/lib/exam/contentValidator';
import { buildListeningSection, buildWritingSection, computeMockEligible } from '../seed-practice-tests.mjs';
import { loadAllTests } from './index.mjs';
import { partsFromContent, committedDurations } from '../tts/rebuild-durations.mjs';

const TESTS = (await loadAllTests()).map(({ n, content }) => [`practice-test-${n}`, n, content] as const);

// Derived from committed content + scripts/tts/durations.json (scripts/tts/out/ is gitignored,
// so reading it only ever worked on the machine that synthesized the audio).
const PARTS = partsFromContent(TESTS.map(([, , content]) => content));
const DURATIONS = committedDurations();

/** The document shape actually inserted into Mongo by scripts/seed-practice-tests.mjs
 * — includes the real synthesized audioUrl/durationSec and the rendered chart
 * imageUrl, which the plain content module does not have yet. */
function toSeededDoc(content: any) {
  return {
    slug: content.slug,
    title: content.title,
    module: 'academic',
    sections: {
      reading: content.reading,
      listening: buildListeningSection(content, DURATIONS, PARTS),
      writing: buildWritingSection(content),
    },
  };
}

function countQuestions(groups: any[]): number {
  return groups.reduce((sum, g) => sum + g.questions.length, 0);
}

function allGroups(containers: any[]): any[] {
  return containers.flatMap((c) => c.questionGroups);
}

const GAP_TYPES = new Set([
  'form_completion',
  'note_completion',
  'table_completion',
  'flowchart_completion',
  'summary_completion',
  'summary_completion_bank',
]);
const BANK_TYPES = new Set([
  'matching_headings',
  'matching_features',
  'matching_sentence_endings',
  'summary_completion_bank',
  'map_label',
  'plan_label',
]);

describe.each(TESTS)('%s content', (_name, n: number, content: any) => {
  it('has exactly 40 reading questions numbered 1-40', () => {
    let total = 0;
    for (const p of content.reading.passages) total += countQuestions(p.questionGroups);
    expect(total).toBe(40);
    const nums = allGroups(content.reading.passages).flatMap((g) => g.questions.map((q: any) => q.number));
    expect(nums).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('has exactly 40 listening questions numbered 1-40, 10 per part', () => {
    for (const p of content.listening.parts) expect(countQuestions(p.questionGroups)).toBe(10);
    const nums = allGroups(content.listening.parts).flatMap((g) => g.questions.map((q: any) => q.number));
    expect(nums).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('has exactly 3 reading passages and 4 listening parts', () => {
    expect(content.reading.passages).toHaveLength(3);
    expect(content.listening.parts).toHaveLength(4);
  });

  it('has exactly 2 writing tasks with chart data on task 1', () => {
    expect(content.writing.task1).toBeTruthy();
    expect(content.writing.task2).toBeTruthy();
    expect(['bar', 'line', 'pie']).toContain(content.writing.task1.chart.chartType);
  });

  it('every answer key is consistent with its question group', () => {
    const groups = [...allGroups(content.reading.passages), ...allGroups(content.listening.parts)];
    const ids = groups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of groups) {
      const where = `${g.id} (${g.type})`;
      for (const q of g.questions) {
        const accepted: string[] = q.answer?.accepted ?? [];
        expect(accepted.length, `${where} q${q.number} has no accepted answer`).toBeGreaterThan(0);
        if (g.type === 'true_false_notgiven') expect(['TRUE', 'FALSE', 'NOT GIVEN'], `${where} q${q.number}`).toContain(accepted[0]);
        if (g.type === 'yes_no_notgiven') expect(['YES', 'NO', 'NOT GIVEN'], `${where} q${q.number}`).toContain(accepted[0]);
        if (g.type === 'multiple_choice_single' || g.type === 'multiple_choice_multi') {
          const keys = q.options.map((o: any) => o.key);
          for (const a of accepted) expect(keys, `${where} q${q.number}`).toContain(a);
          if (g.type === 'multiple_choice_multi') expect(accepted.length).toBe(q.selectCount);
        }
        if (BANK_TYPES.has(g.type)) {
          const keys = g.bank.map((b: any) => b.key);
          for (const a of accepted) expect(keys, `${where} q${q.number}`).toContain(a);
        }
        if (GAP_TYPES.has(g.type)) expect(g.stemHtml, `${where} stem missing {{q${q.number}}}`).toContain(`{{q${q.number}}}`);
      }
    }
  });

  it('the fully seeded document (real audio + rendered chart) has no blocking validation errors', () => {
    const issues = validateTest(toSeededDoc(content) as any);
    const errors = issues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.error(errors);
    }
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  it('seed script computes the same Mock eligibility as the validator', () => {
    const doc = toSeededDoc(content) as any;
    const eligible = checkMockEligibility(doc).filter((i) => i.severity === 'error').length === 0;
    expect(computeMockEligible(doc.sections)).toBe(eligible);
  });

  // Tests 1-4 predate the Mock word-count rule (their reading is ~1,850 words);
  // every test from 5 on is written to full exam length.
  it.skipIf(n < 5)('is eligible for the full Mock exam', () => {
    const errors = checkMockEligibility(toSeededDoc(content) as any).filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('every listening part has transcriptLines with a speaker and voice', () => {
    for (const part of content.listening.parts) {
      expect(Array.isArray(part.transcriptLines)).toBe(true);
      expect(part.transcriptLines.length).toBeGreaterThan(0);
      for (const line of part.transcriptLines) {
        expect(line.text?.length).toBeGreaterThan(0);
        expect(['david', 'zira', 'david2', 'zira2']).toContain(line.voice);
      }
    }
  });
});
