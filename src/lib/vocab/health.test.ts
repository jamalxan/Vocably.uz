import { describe, it, expect } from 'vitest';
import { evaluateVocabHealth } from './health';

describe('evaluateVocabHealth (TZ §62)', () => {
  it("sessiya kam bo'lsa alert bermaydi", () => {
    expect(evaluateVocabHealth({ games: { started: 10, completionRate: 5 }, integrity: { flaggedSessions: 9 } })).toEqual([]);
  });

  it("sog'lom ko'rsatkichlarda alert yo'q", () => {
    expect(evaluateVocabHealth({ games: { started: 200, completionRate: 80 }, integrity: { flaggedSessions: 2, usersNearDailyXpCap: 1 } })).toEqual([]);
  });

  it('past tugatish ulushi: warning, juda past: critical', () => {
    const w = evaluateVocabHealth({ games: { started: 100, completionRate: 45 } });
    expect(w).toMatchObject([{ code: 'low_completion', level: 'warning' }]);
    const c = evaluateVocabHealth({ games: { started: 100, completionRate: 20 } });
    expect(c).toMatchObject([{ code: 'low_completion', level: 'critical' }]);
  });

  it('shubhali sessiyalar ulushi va XP anomaliyasi', () => {
    const r = evaluateVocabHealth({ games: { started: 100, completionRate: 90 }, integrity: { flaggedSessions: 20, usersNearDailyXpCap: 7 } });
    expect(r.map((x) => x.code).sort()).toEqual(['high_flagged', 'xp_anomaly']);
    expect(r.find((x) => x.code === 'high_flagged')!.level).toBe('critical');
  });
});
