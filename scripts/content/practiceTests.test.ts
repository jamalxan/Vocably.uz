// Regression test: the 4 original Vocably Practice Test content modules (used by
// scripts/seed-practice-tests.mjs to seed real Reading/Listening/Writing content,
// replacing the placeholder demo test from scripts/seed-exam-test.mjs) must always
// pass the same admin-authoring validator real content goes through (TZ §15.2).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateTest, hasBlockingErrors } from '../../src/lib/exam/contentValidator';
import { buildListeningSection, buildWritingSection } from '../seed-practice-tests.mjs';
import test1 from './practice-test-1.mjs';
import test2 from './practice-test-2.mjs';
import test3 from './practice-test-3.mjs';
import test4 from './practice-test-4.mjs';

const DURATIONS = JSON.parse(readFileSync(path.join(__dirname, '..', 'tts', 'out', 'durations.json'), 'utf-8'));
const PARTS = JSON.parse(readFileSync(path.join(__dirname, '..', 'tts', 'out', 'parts.json'), 'utf-8'));

/** The document shape actually inserted into Mongo by scripts/seed-practice-tests.mjs
 * — includes the real synthesized audioUrl/durationSec and the rendered chart
 * imageUrl, which the plain content module (toTestDoc above) does not have yet. */
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

describe.each([
  ['practice-test-1', test1],
  ['practice-test-2', test2],
  ['practice-test-3', test3],
  ['practice-test-4', test4],
])('%s content', (_name, content) => {
  it('has exactly 40 reading questions numbered 1-40', () => {
    const passages = content.reading.passages;
    let total = 0;
    for (const p of passages) total += countQuestions(p.questionGroups);
    expect(total).toBe(40);
  });

  it('has exactly 40 listening questions numbered 1-40', () => {
    const parts = content.listening.parts;
    let total = 0;
    for (const p of parts) total += countQuestions(p.questionGroups);
    expect(total).toBe(40);
  });

  it('has exactly 4 reading passages and 4 listening parts', () => {
    expect(content.reading.passages).toHaveLength(3);
    expect(content.listening.parts).toHaveLength(4);
  });

  it('has exactly 2 writing tasks with chart data on task 1', () => {
    expect(content.writing.task1).toBeTruthy();
    expect(content.writing.task2).toBeTruthy();
    expect(['bar', 'line', 'pie']).toContain(content.writing.task1.chart.chartType);
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

  it('every listening part has transcriptLines with a speaker and voice', () => {
    for (const part of content.listening.parts) {
      expect(Array.isArray(part.transcriptLines)).toBe(true);
      expect(part.transcriptLines.length).toBeGreaterThan(0);
      for (const line of part.transcriptLines) {
        expect(line.text?.length).toBeGreaterThan(0);
        expect(['david', 'zira']).toContain(line.voice);
      }
    }
  });
});
