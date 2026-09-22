import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  runMockSchedulerMock: vi.fn((..._args: any[]) => Promise.resolve({ inventory: [], composed: [], gapsDetected: [] })),
  runContentGapScanMock: vi.fn((..._args: any[]) => Promise.resolve({ ran: true, totalDimensions: 0, gaps: [] })),
}));

vi.mock('./mockScheduler', () => ({ runMockScheduler: mocks.runMockSchedulerMock }));
vi.mock('./contentGapScan', () => ({ runContentGapScan: mocks.runContentGapScanMock }));

import { runMaintenanceSweep } from './maintenanceSweep';

const { runMockSchedulerMock, runContentGapScanMock } = mocks;

describe('runMaintenanceSweep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('runs both the mock scheduler and the content gap scan, and returns both summaries', async () => {
    runMockSchedulerMock.mockResolvedValue({ inventory: [{ module: 'academic', fullMockCount: 1, gap: 2 }], composed: [], gapsDetected: [] });
    runContentGapScanMock.mockResolvedValue({ ran: true, totalDimensions: 5, gaps: [{ module: 'academic', dimension: 'reading.passage', count: 0, minimumTarget: 10 }] });

    const summary = await runMaintenanceSweep();

    expect(runMockSchedulerMock).toHaveBeenCalledTimes(1);
    expect(runContentGapScanMock).toHaveBeenCalledTimes(1);
    expect(summary.mockScheduler.inventory).toHaveLength(1);
    expect(summary.contentGapScan.gaps).toHaveLength(1);
  });

  it('runs the content gap scan even when the mock scheduler finds nothing to do', async () => {
    await runMaintenanceSweep();
    expect(runContentGapScanMock).toHaveBeenCalledTimes(1);
  });
});
