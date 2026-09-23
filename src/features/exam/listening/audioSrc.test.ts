import { describe, it, expect } from 'vitest';
import { resolveListeningAudioSrc } from './audioSrc';

describe('resolveListeningAudioSrc', () => {
  it('prefers the compressed derivative when present', () => {
    expect(
      resolveListeningAudioSrc({ audioUrl: '/audio/exam/test-1-l1.wav', audioDerivativeId: 'abc123' })
    ).toBe('/api/exam/audio/abc123');
  });

  it('falls back to the original audioUrl when no derivative id is set (pre-PERF-03 content)', () => {
    expect(resolveListeningAudioSrc({ audioUrl: '/api/exam/audio/orig1' })).toBe('/api/exam/audio/orig1');
    expect(resolveListeningAudioSrc({ audioUrl: '/audio/exam/test-1-l1.wav', audioDerivativeId: '' })).toBe(
      '/audio/exam/test-1-l1.wav'
    );
  });
});
