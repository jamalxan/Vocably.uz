import { describe, expect, it } from 'vitest';
import { clampDuration, detectAudioType, mediaResponseHeaders, safeServedContentType } from './mediaSafety';

const pad = (...b: number[]) => Uint8Array.from([...b, ...Array(16).fill(0)]);
const enc = (s: string) => new TextEncoder().encode(s.padEnd(32, ' '));

describe('detectAudioType', () => {
  it('haqiqiy audio konteynerlarini tanidi', () => {
    expect(detectAudioType(pad(0x1a, 0x45, 0xdf, 0xa3))).toBe('audio/webm');
    expect(detectAudioType(pad(0x4f, 0x67, 0x67, 0x53))).toBe('audio/ogg');
    expect(detectAudioType(pad(0x49, 0x44, 0x33, 3))).toBe('audio/mpeg'); // ID3
    expect(detectAudioType(pad(0xff, 0xfb, 0x90, 0))).toBe('audio/mpeg'); // MP3 kadr
    expect(detectAudioType(pad(0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70))).toBe('audio/mp4');
    expect(detectAudioType(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45, 0, 0, 0, 0]))).toBe('audio/wav');
  });
  it('HTML/SVG/skript/PDF/rasm "audio" sifatida rad etiladi', () => {
    for (const s of ['<!doctype html><script>alert(1)</script>', '<svg xmlns="http://www.w3.org/2000/svg"/>', '<html><body>', '%PDF-1.7 ....', 'GIF89a......']) {
      expect(detectAudioType(enc(s))).toBeNull();
    }
    expect(detectAudioType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toBeNull(); // PNG
  });
  it('qisqa kirish null', () => {
    expect(detectAudioType(Uint8Array.from([0x1a, 0x45]))).toBeNull();
  });
});

describe('safeServedContentType', () => {
  it('xavfsiz audio turlari qoladi (parametrlarsiz); xavfli/noma‘lum octet-stream', () => {
    expect(safeServedContentType('audio/webm;codecs=opus', 'audio')).toBe('audio/webm');
    expect(safeServedContentType('AUDIO/MPEG', 'audio')).toBe('audio/mpeg');
    expect(safeServedContentType('text/html', 'audio')).toBe('application/octet-stream');
    expect(safeServedContentType('text/html; charset=utf-8', 'audio')).toBe('application/octet-stream');
    expect(safeServedContentType('image/svg+xml', 'audio')).toBe('application/octet-stream');
    expect(safeServedContentType(undefined, 'audio')).toBe('application/octet-stream');
  });
  it('rasm uchun faqat png/jpeg/webp/gif (SVG emas)', () => {
    expect(safeServedContentType('image/png', 'image')).toBe('image/png');
    expect(safeServedContentType('image/svg+xml', 'image')).toBe('application/octet-stream');
    expect(safeServedContentType('text/html', 'image')).toBe('application/octet-stream');
  });
});

describe('mediaResponseHeaders', () => {
  it('nosniff + sandbox CSP har doim; octet-stream bo‘lsa attachment', () => {
    const h = mediaResponseHeaders('audio/webm');
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['Content-Security-Policy']).toContain('sandbox');
    expect(h['Content-Disposition']).toBeUndefined();
    expect(mediaResponseHeaders('application/octet-stream')['Content-Disposition']).toBe('attachment');
  });
});

describe('clampDuration', () => {
  it('0..900 oralig‘ida, noto‘g‘ri qiymat 0', () => {
    expect(clampDuration(12.4)).toBe(12);
    expect(clampDuration(99999)).toBe(900);
    expect(clampDuration(-5)).toBe(0);
    expect(clampDuration('x')).toBe(0);
    expect(clampDuration(undefined)).toBe(0);
  });
});
