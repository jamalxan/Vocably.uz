import { describe, expect, it } from 'vitest';
import { callBubbleLabelKey, callIconName, formatCallDuration, isMissedForViewer } from './callLabels';

describe('callBubbleLabelKey: 6 outcomes x 2 viewers', () => {
  it.each([
    ['ended', true, 'mb.callOut'],
    ['ended', false, 'mb.callIn'],
    ['cancelled', true, 'mb.callCancelled'],
    ['cancelled', false, 'mb.callMissed'],
    ['missed', true, 'mb.callNoAnswer'],
    ['missed', false, 'mb.callMissed'],
    ['declined', true, 'mb.callDeclined'],
    ['declined', false, 'mb.callDeclined'],
    ['busy', true, 'mb.callBusy'],
    ['busy', false, 'mb.callMissed'],
    ['failed', true, 'mb.callFailed'],
    ['failed', false, 'mb.callFailed'],
  ])('%s (mine=%s) -> %s', (outcome, mine, key) => {
    expect(callBubbleLabelKey(outcome, mine)).toBe(key);
  });
  it('unknown outcome falls back to failed', () => {
    expect(callBubbleLabelKey('weird', true)).toBe('mb.callFailed');
  });
});

describe('isMissedForViewer', () => {
  it.each([
    ['missed', false, true],
    ['cancelled', false, true],
    ['busy', false, true],
    ['declined', false, false],
    ['ended', false, false],
    ['failed', false, false],
    ['missed', true, false],
    ['busy', true, false],
  ])('%s (mine=%s) -> %s', (outcome, mine, expected) => {
    expect(isMissedForViewer(outcome, mine)).toBe(expected);
  });
});

describe('callIconName', () => {
  it.each([
    ['audio', 'ended', true, 'PhoneOutgoing'],
    ['audio', 'ended', false, 'PhoneIncoming'],
    ['audio', 'missed', false, 'PhoneMissed'],
    ['audio', 'missed', true, 'PhoneOutgoing'],
    ['audio', 'declined', false, 'PhoneIncoming'],
    ['audio', 'busy', false, 'PhoneMissed'],
    ['video', 'ended', true, 'Video'],
    ['video', 'ended', false, 'Video'],
    ['video', 'missed', true, 'VideoOff'],
    ['video', 'declined', false, 'VideoOff'],
    ['video', 'cancelled', false, 'VideoOff'],
    ['video', 'failed', true, 'Video'],
  ])('%s %s (mine=%s) -> %s', (kind, outcome, mine, icon) => {
    expect(callIconName(kind, outcome, mine)).toBe(icon);
  });
});

it('re-exports formatCallDuration', () => {
  expect(formatCallDuration(133)).toBe('2:13');
});
