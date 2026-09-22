import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  examTestFindMock: vi.fn((..._args: any[]) => ({ select: () => ({ lean: () => Promise.resolve([]) }) })),
  agentActionCreateMock: vi.fn((..._args: any[]) => Promise.resolve({})),
  automationPolicyFindOneMock: vi.fn((..._args: any[]) => ({ lean: () => Promise.resolve(null) })),
}));

vi.mock('@/lib/models', () => ({
  ExamTest: { find: mocks.examTestFindMock },
  AgentAction: { create: mocks.agentActionCreateMock },
  AutomationPolicy: { findOne: mocks.automationPolicyFindOneMock },
}));

import { auditContentInventory, detectGaps, runContentGapScan } from './contentGapScan';

const { examTestFindMock, agentActionCreateMock, automationPolicyFindOneMock } = mocks;

function selectLean(list: any[]) {
  return { select: () => ({ lean: () => Promise.resolve(list) }) };
}

describe('auditContentInventory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('seeds every known dimension at 0, so a never-used question type still shows up in the audit', async () => {
    examTestFindMock.mockReturnValue(selectLean([]));
    const counts = await auditContentInventory();
    const matchingHeadings = counts.find((c) => c.module === 'academic' && c.dimension === 'reading.type.matching_headings');
    expect(matchingHeadings).toBeDefined();
    expect(matchingHeadings!.count).toBe(0);
  });

  it('counts passages, question-group types, listening parts, and writing task orders from published tests', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        {
          module: 'academic',
          sections: {
            reading: { passages: [{ questionGroups: [{ type: 'true_false_notgiven' }, { type: 'true_false_notgiven' }] }] },
            listening: { parts: [{ order: 4, questionGroups: [{ type: 'form_completion' }] }] },
            writing: { tasks: [{ order: 1 }, { order: 2 }] },
            speaking: { part1Questions: ['x'] },
          },
        },
      ])
    );

    const counts = await auditContentInventory();
    const byDim = (module: string, dimension: string) => counts.find((c) => c.module === module && c.dimension === dimension)!.count;

    expect(byDim('academic', 'reading.passage')).toBe(1);
    expect(byDim('academic', 'reading.type.true_false_notgiven')).toBe(2);
    expect(byDim('academic', 'listening.part.4')).toBe(1);
    expect(byDim('academic', 'listening.type.form_completion')).toBe(1);
    expect(byDim('academic', 'writing.task.1')).toBe(1);
    expect(byDim('academic', 'writing.task.2')).toBe(1);
    expect(byDim('academic', 'speaking.section')).toBe(1);
    // A different module's count must stay untouched (0) by this test's data.
    expect(byDim('general', 'reading.passage')).toBe(0);
  });

  it('assigns an unrecognised module value to "academic" rather than dropping the test silently', async () => {
    examTestFindMock.mockReturnValue(selectLean([{ module: 'unexpected', sections: { reading: { passages: [{ questionGroups: [] }] } } }]));
    const counts = await auditContentInventory();
    const academicPassages = counts.find((c) => c.module === 'academic' && c.dimension === 'reading.passage')!;
    expect(academicPassages.count).toBe(1);
  });
});

describe('detectGaps', () => {
  it('flags dimensions below their minimum target and leaves the rest out', () => {
    const gaps = detectGaps([
      { module: 'academic', dimension: 'reading.passage', count: 2, minimumTarget: 10 },
      { module: 'academic', dimension: 'speaking.section', count: 20, minimumTarget: 5 },
    ]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].dimension).toBe('reading.passage');
  });
});

describe('runContentGapScan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not run at all when autoContentGapScan is not explicitly enabled (safe default)', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve({ autoContentGapScan: false, level: 'autopilot' }) });
    const summary = await runContentGapScan();
    expect(summary.ran).toBe(false);
    expect(examTestFindMock).not.toHaveBeenCalled();
    expect(agentActionCreateMock).not.toHaveBeenCalled();
  });

  it('does not run when there is no global AutomationPolicy document at all', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve(null) });
    const summary = await runContentGapScan();
    expect(summary.ran).toBe(false);
  });

  it('runs and logs one aggregated content_gap_detected AgentAction when autoContentGapScan is true and gaps exist', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve({ autoContentGapScan: true }) });
    examTestFindMock.mockReturnValue(selectLean([])); // nothing published -> every seeded dimension is a gap

    const summary = await runContentGapScan();

    expect(summary.ran).toBe(true);
    expect(summary.gaps.length).toBeGreaterThan(0);
    expect(agentActionCreateMock).toHaveBeenCalledTimes(1);
    expect(agentActionCreateMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'content_gap_detected' }));
  });
});
