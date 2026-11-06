import { describe, expect, it, vi } from 'vitest';
import { createPeer } from './peer';

// Minimal soxta RTCPeerConnection: chaqiruvlarni yozib boradi, testga `signalingState`ni boshqarishga
// imkon beradi. setLocalDescription() argumentsiz — holatga qarab offer/answer "yaratadi" (implicit).
class FakePC {
  constructor(config) {
    this.config = config;
    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.localDescription = null;
    this.remoteDescription = null;
    this.calls = [];
    this.added = [];
    this.sendersList = [];
    this.failCandidates = false;
    FakePC.last = this;
  }
  async setLocalDescription(desc) {
    this.calls.push(['setLocal', desc?.type || (this.signalingState === 'have-remote-offer' ? 'answer' : 'offer')]);
    if (desc?.type === 'rollback') {
      this.signalingState = 'stable';
      return;
    }
    if (this.signalingState === 'have-remote-offer') {
      this.localDescription = { type: 'answer', sdp: 'answer-sdp' };
      this.signalingState = 'stable';
    } else {
      this.localDescription = { type: 'offer', sdp: `offer-sdp-${this.calls.length}` };
      this.signalingState = 'have-local-offer';
    }
  }
  async setRemoteDescription(desc) {
    this.calls.push(['setRemote', desc.type, this.signalingState]);
    if (desc.type === 'offer') {
      if (this.signalingState === 'have-local-offer') this.calls.push(['implicit-rollback']);
      this.signalingState = 'have-remote-offer';
    } else {
      this.signalingState = 'stable';
    }
    this.remoteDescription = desc;
  }
  async addIceCandidate(c) {
    this.calls.push(['addIce', c?.candidate ?? null]);
    if (this.failCandidates) throw new Error('bad candidate');
  }
  addTrack(track) {
    const sender = { track, replaceTrack: vi.fn(async (t) => { sender.track = t; }), getParameters: () => ({ encodings: [{}] }), setParameters: vi.fn(async () => {}) };
    this.added.push(track);
    this.sendersList.push(sender);
    return sender;
  }
  getSenders() {
    return this.sendersList;
  }
  getTransceivers() {
    return this.sendersList.map((sender) => ({ sender, receiver: { track: null }, direction: 'sendrecv' }));
  }
  restartIce() {
    this.calls.push(['restartIce']);
  }
  getStats() {
    return Promise.resolve('stats');
  }
  close() {
    this.calls.push(['close']);
  }
}

const mk = (over = {}) => {
  const sent = [];
  const peer = createPeer({ PeerConnection: FakePC, polite: false, send: (m) => sent.push(m), log: () => {}, ...over });
  return { peer, pc: FakePC.last, sent };
};
const track = (kind, id = kind) => ({ kind, id, enabled: true, stop: vi.fn() });

describe('peer.js perfect negotiation', () => {
  it('passes ICE servers and the relay policy to the PC', () => {
    const { pc } = mk({ iceServers: [{ urls: 'stun:x' }], forceRelay: true });
    expect(pc.config).toMatchObject({ iceServers: [{ urls: 'stun:x' }], iceTransportPolicy: 'relay' });
  });

  it('impolite peer ignores a colliding offer', async () => {
    const { peer, pc, sent } = mk({ polite: false, startOpen: true });
    await pc.onnegotiationneeded();
    expect(pc.signalingState).toBe('have-local-offer');
    const before = pc.calls.length;
    await peer.handleSignal({ description: { type: 'offer', sdp: 'their-offer' } });
    expect(pc.calls.length).toBe(before); // setRemoteDescription chaqirilmadi
    expect(sent.map((m) => m.description?.type)).toEqual(['offer']);
  });

  it('polite peer rolls back its own offer and answers', async () => {
    const { peer, pc, sent } = mk({ polite: true, startOpen: true });
    await pc.onnegotiationneeded();
    expect(pc.signalingState).toBe('have-local-offer');
    await peer.handleSignal({ description: { type: 'offer', sdp: 'their-offer' } });
    expect(pc.calls).toContainEqual(['implicit-rollback']);
    expect(pc.calls).toContainEqual(['setRemote', 'offer', 'have-local-offer']);
    expect(sent.at(-1)).toEqual({ description: { type: 'answer', sdp: 'answer-sdp' } });
    expect(pc.signalingState).toBe('stable');
  });

  it('queues candidates until the remote description, then flushes them in order', async () => {
    const { peer, pc } = mk({ polite: true, startOpen: true });
    await peer.handleSignal({ candidate: { candidate: 'c1' } });
    await peer.handleSignal({ candidate: { candidate: 'c2' } });
    expect(pc.calls.filter((c) => c[0] === 'addIce')).toEqual([]);
    await peer.handleSignal({ description: { type: 'offer', sdp: 'o' } });
    expect(pc.calls.filter((c) => c[0] === 'addIce')).toEqual([['addIce', 'c1'], ['addIce', 'c2']]);
    await peer.handleSignal({ candidate: { candidate: 'c3' } });
    expect(pc.calls.filter((c) => c[0] === 'addIce').at(-1)).toEqual(['addIce', 'c3']);
  });

  it('startOpen:false buffers {description} and {candidate} until open(), then flushes descriptions first, in order', async () => {
    const { peer, pc, sent } = mk({ polite: false, startOpen: false });
    pc.onicecandidate({ candidate: { candidate: 'early', sdpMid: '0', sdpMLineIndex: 0 } });
    await pc.onnegotiationneeded();
    pc.onicecandidate({ candidate: { candidate: 'a', sdpMid: '0', sdpMLineIndex: 0, toJSON: () => ({ candidate: 'a' }) } });
    pc.onicecandidate({ candidate: null });
    expect(sent).toEqual([]);
    expect(peer.isOpen).toBe(false);
    peer.open();
    expect(sent.map((m) => (m.description ? `d:${m.description.type}` : `c:${m.candidate?.candidate ?? 'end'}`))).toEqual(['d:offer', 'c:early', 'c:a', 'c:end']);
    peer.open(); // ikkinchi marta — hech narsa qayta yuborilmaydi
    expect(sent).toHaveLength(4);
    pc.onicecandidate({ candidate: { candidate: 'late' } });
    expect(sent.at(-1)).toEqual({ candidate: { candidate: 'late', sdpMid: undefined, sdpMLineIndex: undefined, usernameFragment: undefined } });
  });

  it('addIceCandidate errors are swallowed while ignoring an offer', async () => {
    const log = vi.fn();
    const { peer, pc } = mk({ polite: false, startOpen: true, log });
    await peer.handleSignal({ description: { type: 'answer', sdp: 'a' } }); // remoteDescription bor
    await pc.onnegotiationneeded();
    await peer.handleSignal({ description: { type: 'offer', sdp: 'collide' } }); // ignoreOffer = true
    pc.failCandidates = true;
    await peer.handleSignal({ candidate: { candidate: 'x' } });
    expect(log).not.toHaveBeenCalled();
  });

  it('close() is idempotent and detaches handlers', () => {
    const { peer, pc } = mk();
    peer.close();
    peer.close();
    expect(pc.calls.filter((c) => c[0] === 'close')).toHaveLength(1);
    expect(pc.onicecandidate).toBeNull();
    expect(peer.closed).toBe(true);
  });

  it('camera off stops the old track; camera on replaces into the existing video sender', async () => {
    const { peer, pc } = mk({ startOpen: true });
    const cam = track('video', 'v1');
    peer.addLocalStream({ getTracks: () => [track('audio'), cam] });
    expect(cam.contentHint).toBe('motion');
    await peer.setVideoSending(null);
    expect(cam.stop).toHaveBeenCalled();
    const videoSender = pc.sendersList[1];
    expect(videoSender.track).toBeNull();
    const cam2 = track('video', 'v2');
    await peer.setVideoSending(cam2, {});
    expect(videoSender.track).toBe(cam2);
    expect(pc.added).toHaveLength(2); // yangi addTrack yo'q
  });

  it('an audio call upgrades to video through addTrack (renegotiation)', async () => {
    const { peer, pc } = mk({ startOpen: true });
    peer.addLocalStream({ getTracks: () => [track('audio')] });
    await peer.setVideoSending(track('video', 'v'), {});
    expect(pc.added.map((t) => t.kind)).toEqual(['audio', 'video']);
  });

  it('replaceTrack (camera flip) and mic toggle', async () => {
    const { peer, pc } = mk({ startOpen: true });
    const mic = track('audio');
    peer.addLocalStream({ getTracks: () => [mic, track('video', 'front')] });
    const back = track('video', 'back');
    expect(await peer.replaceTrack('video', back)).toBe(true);
    expect(pc.sendersList[1].track).toBe(back);
    peer.setMicEnabled(false);
    expect(mic.enabled).toBe(false);
    expect(await mk().peer.replaceTrack('video', back)).toBe(false);
  });

  it('ICE: disconnected for 3 s or failed -> the impolite side restarts, at most twice, then onFatal after 15 s', () => {
    vi.useFakeTimers();
    try {
      const onFatal = vi.fn();
      const { pc } = mk({ polite: false, startOpen: true, onFatal });
      pc.iceConnectionState = 'disconnected';
      pc.oniceconnectionstatechange();
      vi.advanceTimersByTime(2999);
      expect(pc.calls.filter((c) => c[0] === 'restartIce')).toHaveLength(0);
      vi.advanceTimersByTime(1);
      expect(pc.calls.filter((c) => c[0] === 'restartIce')).toHaveLength(1);
      pc.iceConnectionState = 'failed';
      pc.oniceconnectionstatechange();
      pc.oniceconnectionstatechange();
      expect(pc.calls.filter((c) => c[0] === 'restartIce')).toHaveLength(2);
      vi.advanceTimersByTime(15000);
      expect(onFatal).toHaveBeenCalledWith('failed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('ICE: the polite side never auto-restarts; reconnecting in time cancels onFatal', () => {
    vi.useFakeTimers();
    try {
      const polite = mk({ polite: true, startOpen: true });
      polite.pc.iceConnectionState = 'failed';
      polite.pc.oniceconnectionstatechange();
      expect(polite.pc.calls.filter((c) => c[0] === 'restartIce')).toHaveLength(0);

      const onFatal = vi.fn();
      const states = [];
      const { pc } = mk({ polite: false, startOpen: true, onFatal, onConnectionState: (s) => states.push(s) });
      pc.iceConnectionState = 'failed';
      pc.oniceconnectionstatechange();
      pc.oniceconnectionstatechange();
      pc.connectionState = 'connected';
      pc.onconnectionstatechange();
      vi.advanceTimersByTime(20000);
      expect(onFatal).not.toHaveBeenCalled();
      expect(states).toEqual(['connected']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('getStats passthrough', async () => {
    const { peer } = mk();
    expect(await peer.getStats()).toBe('stats');
  });
});
