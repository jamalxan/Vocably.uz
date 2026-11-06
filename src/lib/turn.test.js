import { describe, it, expect } from 'vitest';
import { buildTurnCredentials, buildIceServers, DEFAULT_TURN_TTL_SEC } from './turn';

const UID = '64e2e0000000000000000001';

describe('buildTurnCredentials', () => {
  it('matches the pinned vector (coturn use-auth-secret)', () => {
    expect(buildTurnCredentials('test-secret', UID, 3600, 1700000000)).toEqual({
      username: `1700003600:${UID}`,
      credential: 'zw16hwVv/P3iWBzRlq8yBjG9Brw=',
    });
  });

  it('credential is base64 of a 20-byte HMAC-SHA1', () => {
    const { credential } = buildTurnCredentials('s', UID, 10, 1);
    expect(Buffer.from(credential, 'base64')).toHaveLength(20);
  });
});

describe('buildIceServers', () => {
  it('falls back to STUN only without TURN_SECRET', () => {
    const out = buildIceServers(UID, {}, 1000);
    expect(out.turn).toBe(false);
    expect(out.iceServers).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
    expect(out.ttlSec).toBe(DEFAULT_TURN_TTL_SEC);
  });

  it('builds STUN + TURN (udp, tcp) on the default host with a 600 s TTL', () => {
    const out = buildIceServers(UID, { TURN_SECRET: 'x' }, 1000);
    expect(out.turn).toBe(true);
    expect(out.ttlSec).toBe(600);
    expect(out.iceServers[0]).toEqual({ urls: ['stun:turn.vocably.uz:3478'] });
    expect(out.iceServers[1].urls).toEqual(['turn:turn.vocably.uz:3478?transport=udp', 'turn:turn.vocably.uz:3478?transport=tcp']);
    expect(out.iceServers[1].username).toBe(`1600:${UID}`);
    expect(out.iceServers[1].credential).toBe(buildTurnCredentials('x', UID, 600, 1000).credential);
  });

  it('honours TURN_HOST and TURN_TTL_SEC', () => {
    const out = buildIceServers(UID, { TURN_SECRET: 'x', TURN_HOST: 'turn.example.com', TURN_TTL_SEC: '3600' }, 0);
    expect(out.ttlSec).toBe(3600);
    expect(out.iceServers[0].urls).toEqual(['stun:turn.example.com:3478']);
    expect(out.iceServers[1].username).toBe(`3600:${UID}`);
  });

  it('ignores an invalid TTL', () => {
    expect(buildIceServers(UID, { TURN_SECRET: 'x', TURN_TTL_SEC: 'abc' }, 0).ttlSec).toBe(600);
    expect(buildIceServers(UID, { TURN_SECRET: 'x', TURN_TTL_SEC: '-5' }, 0).ttlSec).toBe(600);
  });

  it('parses comma lists with spaces for TURN_URLS / STUN_URLS', () => {
    const out = buildIceServers(UID, { TURN_SECRET: 'x', TURN_URLS: ' turn:a:1 , turn:b:2,, ', STUN_URLS: 'stun:c:3 ,stun:d:4' }, 0);
    expect(out.iceServers[0].urls).toEqual(['stun:c:3', 'stun:d:4']);
    expect(out.iceServers[1].urls).toEqual(['turn:a:1', 'turn:b:2']);
  });
});
