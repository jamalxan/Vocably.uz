import { describe, expect, it } from 'vitest';
import { CALL_STATUSES, endReasonLabelKey, initialCallState, isInCallStatus, isLiveStatus, reduceCall } from './callMachine';

const PEER = { id: 'p1', username: 'friend', name: 'Friend', nickname: null, photoId: null };
const run = (events, state = initialCallState) => events.reduce((s, e) => reduceCall(s, e), state);
const at = (status, over = {}) => ({ ...initialCallState, status, callId: 'c-1', conversationId: 'conv', peer: PEER, ...over });

const started = () => run([{ type: 'START', conversationId: 'conv', kind: 'audio', peer: PEER }]);
const outgoing = () => run([{ type: 'GRANT_OK', callId: 'c-1' }, { type: 'ACK_OK', expiresAt: 'x' }], started());
const incoming = (kind = 'video') =>
  run([{ type: 'INVITE_RECEIVED', callId: 'c-2', conversationId: 'conv', kind, from: { userId: 'u9', username: 'caller', name: 'C', photoId: 'ph' }, expiresAt: 'x' }]);

describe('callMachine: caller flow', () => {
  it('idle -> START -> starting (role caller, camera for video)', () => {
    const s = reduceCall(initialCallState, { type: 'START', conversationId: 'conv', kind: 'video', peer: PEER });
    expect(s).toMatchObject({ status: 'starting', role: 'caller', conversationId: 'conv', kind: 'video', camera: true, peer: PEER });
    expect(reduceCall(initialCallState, { type: 'START', conversationId: 'conv', kind: 'audio', peer: PEER }).camera).toBe(false);
  });

  it('starting -> MEDIA_FAILED -> idle with a media error (and the retry payload)', () => {
    const retry = { conversationId: 'conv', kind: 'audio', peer: PEER };
    const s = reduceCall(started(), { type: 'MEDIA_FAILED', error: { name: 'NotAllowedError', message: 'denied', retry } });
    expect(s.status).toBe('idle');
    expect(s.error).toMatchObject({ kind: 'media', name: 'NotAllowedError', code: 'NotAllowedError', retry });
  });

  it.each(['blocked', 'callee_unavailable', 'rate_limited', 'not_configured', 'network'])('starting -> GRANT_FAILED %s -> ended', (code) => {
    const s = reduceCall(started(), { type: 'GRANT_FAILED', code });
    expect(s).toMatchObject({ status: 'ended', endReason: code });
  });

  it('starting -> GRANT_OK -> inviting (callId, peer merged with the grant peer)', () => {
    const s = reduceCall(started(), { type: 'GRANT_OK', callId: 'c-1', peer: { nickname: 'Do‘st' } });
    expect(s).toMatchObject({ status: 'inviting', callId: 'c-1', peer: { ...PEER, nickname: 'Do‘st' } });
  });

  it('inviting -> ACK_OK -> outgoing (not ringing yet)', () => {
    expect(outgoing()).toMatchObject({ status: 'outgoing', ringing: false });
  });

  it.each([
    ['busy', 'call.endedBusy'],
    ['callee_offline', 'call.endedOffline'],
    ['bad_grant', 'call.endedUnavailable'],
    ['self_call', 'call.endedUnavailable'],
    ['already_in_call', 'call.busyToast'],
    ['rate_limited', 'call.endedRateLimited'],
    ['failed', 'call.endedFailed'],
  ])('inviting -> ACK_FAIL %s -> ended (%s)', (code, key) => {
    const s = run([{ type: 'GRANT_OK', callId: 'c-1' }, { type: 'ACK_FAIL', code }], started());
    expect(s).toMatchObject({ status: 'ended', endReason: code });
    expect(endReasonLabelKey(s.endReason, s.role, s.durationSec)).toBe(key);
  });

  it('outgoing -> REMOTE_RINGING keeps outgoing with ringing=true; a second one is a no-op', () => {
    const s = reduceCall(outgoing(), { type: 'REMOTE_RINGING', callId: 'c-1' });
    expect(s).toMatchObject({ status: 'outgoing', ringing: true });
    expect(reduceCall(s, { type: 'REMOTE_RINGING', callId: 'c-1' })).toBe(s);
  });

  it('outgoing -> REMOTE_ACCEPT -> connecting', () => {
    expect(reduceCall(outgoing(), { type: 'REMOTE_ACCEPT', callId: 'c-1' }).status).toBe('connecting');
  });

  it('events for another callId are ignored', () => {
    const s = outgoing();
    expect(reduceCall(s, { type: 'REMOTE_ACCEPT', callId: 'other' })).toBe(s);
    expect(reduceCall(s, { type: 'END', callId: 'other', reason: 'hangup' })).toBe(s);
  });
});

describe('callMachine: callee flow', () => {
  it('idle -> INVITE_RECEIVED -> incoming (role callee, peer from `from`)', () => {
    expect(incoming()).toMatchObject({ status: 'incoming', role: 'callee', callId: 'c-2', kind: 'video', peer: { id: 'u9', username: 'caller', name: 'C', photoId: 'ph' } });
  });

  it('elsewhere -> INVITE_RECEIVED with a different callId -> incoming; with the same callId ignored', () => {
    const elsewhere = reduceCall(initialCallState, { type: 'SERVER_STATE', onThisDevice: false, callId: 'c-2', conversationId: 'conv', state: 'active' });
    expect(reduceCall(elsewhere, { type: 'INVITE_RECEIVED', callId: 'c-2', from: {} })).toBe(elsewhere);
    expect(reduceCall(elsewhere, { type: 'INVITE_RECEIVED', callId: 'c-3', from: {} }).status).toBe('incoming');
  });

  it('a busy client does not enter incoming (provider auto-rejects)', () => {
    const s = outgoing();
    expect(reduceCall(s, { type: 'INVITE_RECEIVED', callId: 'c-9', from: {} })).toBe(s);
  });

  it('incoming -> ACCEPT -> accepting (camera = video && !videoOff)', () => {
    expect(reduceCall(incoming('video'), { type: 'ACCEPT', videoOff: false })).toMatchObject({ status: 'accepting', camera: true });
    expect(reduceCall(incoming('video'), { type: 'ACCEPT', videoOff: true })).toMatchObject({ status: 'accepting', camera: false });
    expect(reduceCall(incoming('audio'), { type: 'ACCEPT' }).camera).toBe(false);
  });

  it('incoming -> REJECT -> idle', () => {
    expect(reduceCall(incoming(), { type: 'REJECT' })).toMatchObject({ status: 'idle', callId: null });
  });

  it('accepting -> ACCEPT_MEDIA_READY -> connecting', () => {
    const s = run([{ type: 'ACCEPT' }, { type: 'ACCEPT_MEDIA_READY' }], incoming());
    expect(s.status).toBe('connecting');
  });

  it('accepting -> ACCEPT_MEDIA_FAILED -> ended(media_error) with the error sheet', () => {
    const s = run([{ type: 'ACCEPT' }, { type: 'ACCEPT_MEDIA_FAILED', error: { name: 'NotAllowedError' } }], incoming());
    expect(s).toMatchObject({ status: 'ended', endReason: 'media_error', error: { kind: 'media', name: 'NotAllowedError' } });
    expect(endReasonLabelKey(s.endReason)).toBe('call.endedFailed');
  });
});

describe('callMachine: connection', () => {
  it('connecting -> SERVER_ACTIVE sets `since` (ISO or ms)', () => {
    const s = reduceCall(at('connecting'), { type: 'SERVER_ACTIVE', callId: 'c-1', since: '2026-11-06T10:00:00.000Z' });
    expect(s).toMatchObject({ status: 'active', since: Date.parse('2026-11-06T10:00:00.000Z') });
    expect(reduceCall(at('connecting'), { type: 'SERVER_ACTIVE', since: 123 }).since).toBe(123);
  });

  it('reconnecting -> SERVER_ACTIVE -> active; active -> SERVER_ACTIVE ignored', () => {
    expect(reduceCall(at('reconnecting', { resumeTo: 'connecting' }), { type: 'SERVER_ACTIVE', since: 5 })).toMatchObject({ status: 'active', resumeTo: null });
    const active = at('active', { since: 1 });
    expect(reduceCall(active, { type: 'SERVER_ACTIVE', since: 9 })).toBe(active);
  });

  it.each(['connecting', 'active'])('%s -> CONNECTION_LOST -> reconnecting -> CONNECTION_RESTORED -> back', (from) => {
    const lost = reduceCall(at(from), { type: 'CONNECTION_LOST' });
    expect(lost).toMatchObject({ status: 'reconnecting', resumeTo: from });
    expect(reduceCall(lost, { type: 'CONNECTION_RESTORED' })).toMatchObject({ status: from, resumeTo: null });
  });

  it('CONNECTION_LOST outside connecting/active is ignored', () => {
    const s = outgoing();
    expect(reduceCall(s, { type: 'CONNECTION_LOST' })).toBe(s);
  });

  it('REMOTE_MEDIA updates remote mic/camera in any non-idle state', () => {
    const s = reduceCall(at('active'), { type: 'REMOTE_MEDIA', audio: false, video: true });
    expect(s).toMatchObject({ remoteMic: false, remoteCamera: true });
    expect(reduceCall(s, { type: 'REMOTE_MEDIA', audio: false, video: true })).toBe(s);
    expect(reduceCall(initialCallState, { type: 'REMOTE_MEDIA', audio: false, video: true })).toBe(initialCallState);
  });
});

describe('callMachine: controls', () => {
  it.each(['starting', 'inviting', 'outgoing', 'incoming', 'accepting', 'connecting', 'active', 'reconnecting'])('TOGGLE_MIC / TOGGLE_CAMERA / SET_FACING work in %s', (status) => {
    const s = at(status, { camera: false });
    expect(reduceCall(s, { type: 'TOGGLE_MIC' }).mic).toBe(false);
    expect(reduceCall(s, { type: 'TOGGLE_CAMERA' }).camera).toBe(true);
    expect(reduceCall(s, { type: 'TOGGLE_CAMERA', value: false })).toBe(s);
    expect(reduceCall(s, { type: 'SET_FACING', facing: 'environment' }).facing).toBe('environment');
  });

  it.each(['idle', 'ended', 'elsewhere'])('controls are ignored in %s', (status) => {
    const s = at(status);
    expect(reduceCall(s, { type: 'TOGGLE_MIC' })).toBe(s);
    expect(reduceCall(s, { type: 'TOGGLE_CAMERA' })).toBe(s);
    expect(reduceCall(s, { type: 'SET_FACING', facing: 'environment' })).toBe(s);
    expect(reduceCall(s, { type: 'MINIMIZE' })).toBe(s);
  });

  it.each(['outgoing', 'incoming', 'accepting', 'connecting', 'active', 'reconnecting'])('MINIMIZE / RESTORE in %s', (status) => {
    const min = reduceCall(at(status), { type: 'MINIMIZE' });
    expect(min.minimized).toBe(true);
    expect(reduceCall(min, { type: 'MINIMIZE' })).toBe(min);
    expect(reduceCall(min, { type: 'RESTORE' }).minimized).toBe(false);
  });

  it('AUDIO_BLOCKED in any state', () => {
    const s = reduceCall(initialCallState, { type: 'AUDIO_BLOCKED', blocked: true });
    expect(s.audioBlocked).toBe(true);
    expect(reduceCall(s, { type: 'AUDIO_BLOCKED', blocked: true })).toBe(s);
    expect(reduceCall(s, { type: 'AUDIO_BLOCKED', blocked: false }).audioBlocked).toBe(false);
  });

  it('SET_ERROR shows the sheet without changing the status; CLEAR_ERROR clears it', () => {
    const s = reduceCall(at('active'), { type: 'SET_ERROR', error: { name: 'NotReadableError' } });
    expect(s).toMatchObject({ status: 'active', error: { kind: 'media', name: 'NotReadableError' } });
    const cleared = reduceCall(s, { type: 'CLEAR_ERROR' });
    expect(cleared.error).toBeNull();
    expect(reduceCall(cleared, { type: 'CLEAR_ERROR' })).toBe(cleared);
  });
});

describe('callMachine: other devices', () => {
  it('idle -> SERVER_STATE(onThisDevice:false) -> elsewhere; updates state; END for it -> idle', () => {
    const e = reduceCall(initialCallState, { type: 'SERVER_STATE', onThisDevice: false, callId: 'c-5', conversationId: 'conv', state: 'connecting' });
    expect(e).toMatchObject({ status: 'elsewhere', elsewhere: { callId: 'c-5', conversationId: 'conv', state: 'connecting' } });
    const updated = reduceCall(e, { type: 'SERVER_STATE', onThisDevice: false, callId: 'c-5', conversationId: 'conv', state: 'active' });
    expect(updated.elsewhere.state).toBe('active');
    expect(reduceCall(updated, { type: 'SERVER_STATE', onThisDevice: false, callId: 'c-5', conversationId: 'conv', state: 'active' })).toBe(updated);
    expect(reduceCall(updated, { type: 'END', callId: 'other' })).toBe(updated);
    expect(reduceCall(updated, { type: 'END', callId: 'c-5', reason: 'hangup' })).toMatchObject({ status: 'idle', elsewhere: null });
  });

  it('SERVER_STATE with onThisDevice:true while idle is ignored', () => {
    expect(reduceCall(initialCallState, { type: 'SERVER_STATE', onThisDevice: true, callId: 'c', state: 'active' })).toBe(initialCallState);
  });

  it('answered elsewhere: silent END -> idle without an ended screen', () => {
    expect(reduceCall(incoming(), { type: 'END', callId: 'c-2', reason: 'answered_elsewhere', silent: true })).toMatchObject({ status: 'idle' });
  });
});

describe('callMachine: endings', () => {
  it('END -> ended with reason and duration; a second END keeps the first reason', () => {
    const s = reduceCall(at('active'), { type: 'END', callId: 'c-1', reason: 'hangup', durationSec: 133 });
    expect(s).toMatchObject({ status: 'ended', endReason: 'hangup', durationSec: 133 });
    expect(reduceCall(s, { type: 'END', reason: 'disconnected' })).toBe(s);
    expect(reduceCall(initialCallState, { type: 'END', reason: 'hangup' })).toBe(initialCallState);
  });

  it.each([
    ['ring', 'outgoing', 'ended', 'timeout'],
    ['incoming', 'incoming', 'idle', null],
    ['connect', 'connecting', 'ended', 'failed'],
    ['reconnect', 'reconnecting', 'ended', 'disconnected'],
  ])('TIMEOUT %s in %s -> %s', (which, from, to, reason) => {
    const s = reduceCall(at(from), { type: 'TIMEOUT', which });
    expect(s.status).toBe(to);
    expect(s.endReason).toBe(reason);
  });

  it('TIMEOUT of the wrong kind is ignored', () => {
    const s = at('active');
    expect(reduceCall(s, { type: 'TIMEOUT', which: 'ring' })).toBe(s);
  });

  it('ERROR in a non-idle state -> ended(code); ignored when idle or ended', () => {
    expect(reduceCall(at('connecting'), { type: 'ERROR', callId: 'c-1', code: 'not_in_call' })).toMatchObject({ status: 'ended', endReason: 'not_in_call' });
    expect(reduceCall(initialCallState, { type: 'ERROR', code: 'x' })).toBe(initialCallState);
  });

  it('ended -> RESET -> idle (elsewhere cleared, a media error kept for the sheet)', () => {
    const s = run([{ type: 'ACCEPT' }, { type: 'ACCEPT_MEDIA_FAILED', error: { name: 'NotAllowedError' } }, { type: 'RESET' }], incoming());
    expect(s).toMatchObject({ ...initialCallState, error: { kind: 'media', name: 'NotAllowedError' } });
    const idle = at('idle');
    expect(reduceCall(idle, { type: 'RESET' })).toBe(idle);
  });

  it('unknown events return the same object', () => {
    const s = at('active');
    expect(reduceCall(s, { type: 'NOPE' })).toBe(s);
    expect(reduceCall(s, null)).toBe(s);
  });
});

describe('endReasonLabelKey', () => {
  it.each([
    ['hangup', 133, 'call.endedWithDuration'],
    ['hangup', 0, 'call.endedWithDuration'],
    ['hangup', null, 'call.endedCancelled'],
    ['timeout', null, 'call.endedNoAnswer'],
    ['rejected', null, 'call.endedDeclined'],
    ['busy', null, 'call.endedBusy'],
    ['cancel', null, 'call.endedCancelled'],
    ['callee_offline', null, 'call.endedOffline'],
    ['offline', null, 'call.endedOffline'],
    ['failed', null, 'call.endedFailed'],
    ['media_error', null, 'call.endedFailed'],
    ['bad_payload', null, 'call.endedFailed'],
    ['disconnected', 12, 'call.endedLost'],
    ['not_in_call', null, 'call.endedLost'],
    ['server_shutdown', null, 'call.endedLost'],
    ['blocked', null, 'call.endedUnavailable'],
    ['banned', null, 'call.endedUnavailable'],
    ['admin', null, 'call.endedUnavailable'],
    ['callee_unavailable', null, 'call.endedUnavailable'],
    ['bad_grant', null, 'call.endedUnavailable'],
    ['self_call', null, 'call.endedUnavailable'],
    ['not_configured', null, 'call.endedUnavailable'],
    ['rate_limited', null, 'call.endedRateLimited'],
    ['already_in_call', null, 'call.busyToast'],
    ['network', null, 'call.endedFailed'],
    ['whatever', null, 'call.endedFailed'],
  ])('%s (%s) -> %s', (reason, d, key) => {
    expect(endReasonLabelKey(reason, 'caller', d)).toBe(key);
  });
});

describe('status helpers', () => {
  it('statuses list and groupings', () => {
    expect(CALL_STATUSES).toContain('elsewhere');
    expect(['connecting', 'active', 'reconnecting'].every(isLiveStatus)).toBe(true);
    expect(isLiveStatus('outgoing')).toBe(false);
    expect(isInCallStatus('ended')).toBe(true);
    expect(isInCallStatus('incoming')).toBe(false);
  });
});
