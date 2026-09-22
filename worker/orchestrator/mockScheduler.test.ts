import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  examTestFindMock: vi.fn((..._args: any[]) => ({ select: () => ({ lean: () => Promise.resolve([]) }) })),
  examTestCreateMock: vi.fn((doc: any) => Promise.resolve({ ...doc, _id: `composite-${Math.random().toString(36).slice(2, 8)}` })),
  agentActionCreateMock: vi.fn((..._args: any[]) => Promise.resolve({})),
  automationPolicyFindOneMock: vi.fn((..._args: any[]) => ({ lean: () => Promise.resolve(null) })),
}));

vi.mock('@/lib/models', () => ({
  ExamTest: { find: mocks.examTestFindMock, create: mocks.examTestCreateMock },
  AgentAction: { create: mocks.agentActionCreateMock },
  AutomationPolicy: { findOne: mocks.automationPolicyFindOneMock },
}));

import { auditMockInventory, tryComposeMixedMock, runMockScheduler } from './mockScheduler';

const { examTestFindMock, examTestCreateMock, agentActionCreateMock, automationPolicyFindOneMock } = mocks;

function selectLean(list: any[]) {
  return { select: () => ({ lean: () => Promise.resolve(list) }) };
}

describe('auditMockInventory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts fullMock tests per module and computes the gap against the minimum', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        { module: 'academic', availability: { fullMock: true } },
        { module: 'academic', availability: { fullMock: true } },
        { module: 'academic', availability: { fullMock: false } },
        { module: 'general', availability: { fullMock: true } },
      ])
    );

    const report = await auditMockInventory();
    const academic = report.find((r) => r.module === 'academic')!;
    const general = report.find((r) => r.module === 'general')!;

    expect(academic.fullMockCount).toBe(2);
    expect(academic.gap).toBe(1); // MIN 3 - 2 = 1
    expect(general.fullMockCount).toBe(1);
    expect(general.gap).toBe(2); // MIN 3 - 1 = 2
  });

  it('returns gap 0 when a module already has enough full mocks', async () => {
    examTestFindMock.mockReturnValue(selectLean(Array.from({ length: 5 }, () => ({ module: 'academic', availability: { fullMock: true } }))));
    const report = await auditMockInventory();
    expect(report[0].gap).toBe(0);
  });
});

describe('tryComposeMixedMock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuses when a required section has no candidate at all', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([{ _id: 'a', sections: { reading: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' }])
    );
    const result = await tryComposeMixedMock('academic', 'autopilot');
    expect(result.created).toBe(false);
    expect(result.reason).toMatch(/listening/);
    expect(examTestCreateMock).not.toHaveBeenCalled();
  });

  it('composes from three distinct candidates, preferring non-overlapping sources', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        { _id: 'r1', sections: { reading: { passages: [] } }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'l1', sections: { listening: { parts: [] } }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'w1', sections: { writing: { tasks: [] } }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
      ])
    );

    const result = await tryComposeMixedMock('academic', 'autopilot');

    expect(result.created).toBe(true);
    expect(examTestCreateMock).toHaveBeenCalledTimes(1);
    const created = examTestCreateMock.mock.calls[0][0];
    expect(created.source.composedFrom).toEqual([
      { testId: 'r1', sectionKey: 'reading' },
      { testId: 'l1', sectionKey: 'listening' },
      { testId: 'w1', sectionKey: 'writing' },
    ]);
    expect(created.isPublished).toBe(true); // own/public content, autopilot level -> gate allows
    expect(created.availability.fullMock).toBe(true);
    expect(agentActionCreateMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'auto_mock_create' }));
  });

  it('falls back to reusing the same candidate for two sections when no fresh source exists', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        { _id: 'rw', sections: { reading: {}, writing: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'l1', sections: { listening: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
      ])
    );
    const result = await tryComposeMixedMock('academic', 'autopilot');
    expect(result.created).toBe(true);
    const created = examTestCreateMock.mock.calls[0][0];
    expect(created.source.composedFrom.map((c: any) => c.testId)).toEqual(['rw', 'l1', 'rw']);
  });

  it('LEGAL-01: composite inherits the most restrictive rights and is NOT auto-published when that combination is third_party_copyright + public', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        { _id: 'r1', sections: { reading: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'l1', sections: { listening: {} }, rights: { sourceType: 'third_party_copyright', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'w1', sections: { writing: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
      ])
    );

    const result = await tryComposeMixedMock('academic', 'autopilot');

    expect(result.created).toBe(true);
    const created = examTestCreateMock.mock.calls[0][0];
    expect(created.rights.sourceType).toBe('third_party_copyright');
    expect(created.isPublished).toBe(false); // LEGAL-01 gate blocks it despite autopilot level
    expect(created.publishedBy).toBe('admin');
    expect(result.reason).toMatch(/third_party_copyright/);
  });

  it('does not auto-publish when automationLevel is manual, even with fully-clean rights', async () => {
    examTestFindMock.mockReturnValue(
      selectLean([
        { _id: 'r1', sections: { reading: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'l1', sections: { listening: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
        { _id: 'w1', sections: { writing: {} }, rights: { sourceType: 'own', publishScope: 'public' }, createdBy: 'u1' },
      ])
    );
    const result = await tryComposeMixedMock('academic', 'manual');
    const created = examTestCreateMock.mock.calls[0][0];
    expect(created.isPublished).toBe(false);
  });
});

describe('runMockScheduler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when the global AutomationPolicy level is manual', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve({ level: 'manual' }) });
    examTestFindMock.mockReturnValue(selectLean([])); // inventory audit still runs
    const summary = await runMockScheduler();
    expect(summary.composed).toEqual([]);
    expect(summary.gapsDetected).toEqual([]);
    expect(examTestCreateMock).not.toHaveBeenCalled();
  });

  it('defaults to manual (safe default) when no global policy document exists', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve(null) });
    examTestFindMock.mockReturnValue(selectLean([{ module: 'academic', availability: { fullMock: false } }]));
    const summary = await runMockScheduler();
    expect(examTestCreateMock).not.toHaveBeenCalled();
    expect(summary.gapsDetected).toEqual([]);
  });

  it('records a content_gap_detected AgentAction and stops trying once composition fails for a module, without fabricating content', async () => {
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve({ level: 'autopilot' }) });
    // Inventory query (audit) then candidate query (compose attempt) both hit examTestFindMock —
    // first call returns the inventory list, subsequent calls return no usable candidates.
    let call = 0;
    examTestFindMock.mockImplementation(() => {
      call += 1;
      if (call === 1) return selectLean([{ module: 'academic', availability: { fullMock: false } }]); // gap = 3
      return selectLean([]); // no candidates for any section
    });

    const summary = await runMockScheduler();

    expect(summary.gapsDetected).toHaveLength(1); // stops after the first failure for that module
    expect(summary.gapsDetected[0].module).toBe('academic');
    expect(agentActionCreateMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'content_gap_detected' }));
    expect(examTestCreateMock).not.toHaveBeenCalled();
  });
});
