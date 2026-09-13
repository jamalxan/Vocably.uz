import { describe, it, expect } from 'vitest';
import { canAutoPublish, canAutoAccept, canContinueAutonomous } from './autopilotGuards';

// docs/ai-content-agent-tz-avtopilot.md §3.3/§10 kickoff item 6 — bu
// qoidalar policy'dan mustaqil, hardcoded bo'lishi SHART. Har bir "hech
// qachon" jumlasi shu yerda alohida test.
describe('canAutoPublish', () => {
  const base = { blockers: 0, qaScore: 0.97, licence: 'own', publishScope: 'private', level: 'autopilot', autoPublishMinQaScore: 0.95 };

  it('allows when every condition is satisfied', () => {
    expect(canAutoPublish(base)).toEqual({ allowed: true, reason: '' });
  });

  it('never allows when blockers > 0, no matter the level or score', () => {
    const result = canAutoPublish({ ...base, blockers: 1, qaScore: 1, level: 'autopilot' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/blocker/);
  });

  it('never allows third_party_copyright + public, even with a perfect score and autopilot level', () => {
    const result = canAutoPublish({ ...base, licence: 'third_party_copyright', publishScope: 'public', qaScore: 1, level: 'autopilot' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/third_party_copyright/);
  });

  it('allows third_party_copyright when publishScope is not public', () => {
    expect(canAutoPublish({ ...base, licence: 'third_party_copyright', publishScope: 'private' }).allowed).toBe(true);
  });

  it('rejects level: manual even if everything else qualifies', () => {
    const result = canAutoPublish({ ...base, level: 'manual' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/manual/);
  });

  it('rejects a qaScore below the threshold', () => {
    const result = canAutoPublish({ ...base, qaScore: 0.8 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/qa\.score/);
  });

  it('rejects a missing (null/undefined) qaScore', () => {
    expect(canAutoPublish({ ...base, qaScore: null }).allowed).toBe(false);
    expect(canAutoPublish({ ...base, qaScore: undefined }).allowed).toBe(false);
  });

  it('uses the default 0.95 threshold when autoPublishMinQaScore is not given', () => {
    expect(canAutoPublish({ ...base, qaScore: 0.94, autoPublishMinQaScore: undefined }).allowed).toBe(false);
    expect(canAutoPublish({ ...base, qaScore: 0.96, autoPublishMinQaScore: undefined }).allowed).toBe(true);
  });
});

describe('canAutoAccept', () => {
  it('never allows a blocker, regardless of confidence', () => {
    const result = canAutoAccept({ severity: 'blocker', confidence: 0.99, autoAcceptConfidence: 0.93 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/blocker/);
  });

  it('allows a warning at or above the threshold', () => {
    expect(canAutoAccept({ severity: 'warning', confidence: 0.93, autoAcceptConfidence: 0.93 }).allowed).toBe(true);
  });

  it('rejects a warning below the threshold', () => {
    expect(canAutoAccept({ severity: 'warning', confidence: 0.9, autoAcceptConfidence: 0.93 }).allowed).toBe(false);
  });

  it('uses the default 0.93 threshold when not given', () => {
    expect(canAutoAccept({ severity: 'warning', confidence: 0.92 }).allowed).toBe(false);
    expect(canAutoAccept({ severity: 'warning', confidence: 0.94 }).allowed).toBe(true);
  });
});

describe('canContinueAutonomous', () => {
  it('allows while under the daily cap', () => {
    expect(canContinueAutonomous({ costUsdToday: 4.5, maxAutonomousCostUsdPerDay: 15 }).allowed).toBe(true);
  });

  it('stops exactly at the cap (>=, not >)', () => {
    const result = canContinueAutonomous({ costUsdToday: 15, maxAutonomousCostUsdPerDay: 15 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/chegaradan/);
  });

  it('stops above the cap', () => {
    expect(canContinueAutonomous({ costUsdToday: 20, maxAutonomousCostUsdPerDay: 15 }).allowed).toBe(false);
  });

  it('uses the default $15 cap when not given', () => {
    expect(canContinueAutonomous({ costUsdToday: 10 }).allowed).toBe(true);
    expect(canContinueAutonomous({ costUsdToday: 15 }).allowed).toBe(false);
  });
});
