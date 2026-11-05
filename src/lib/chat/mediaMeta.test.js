import { describe, it, expect } from 'vitest';
import { cleanAlbumId, cleanFileName, cleanWaveform, buildWaveform, formatBytes, fileExtension } from './mediaMeta';

describe('media meta validators', () => {
  it('album ids', () => {
    expect(cleanAlbumId('abc123_X-9')).toBe('abc123_X-9');
    for (const bad of ['', 'abc', 'a'.repeat(41), 'has space', { $ne: 1 }, null]) expect(cleanAlbumId(bad)).toBeNull();
  });
  it('file names lose control chars and paths', () => {
    expect(cleanFileName('  report.pdf ')).toBe('report.pdf');
    expect(cleanFileName('../../etc/passwd')).toBe('..-..-etc-passwd');
    expect(cleanFileName('a\u0000b.txt')).toBe('ab.txt');
    expect(cleanFileName('..')).toBe('');
    expect(cleanFileName('x'.repeat(200)).length).toBe(120);
  });
  it('waveforms are clamped ints', () => {
    expect(cleanWaveform([0, 5.6, 40, -3, 'x'])).toEqual([0, 6, 31, 0, 0]);
    expect(cleanWaveform([])).toBeUndefined();
    expect(cleanWaveform('nope')).toBeUndefined();
    expect(cleanWaveform(new Array(150).fill(1)).length).toBe(100);
  });
  it('buildWaveform reduces and normalises', () => {
    const samples = Array.from({ length: 600 }, (_, i) => (i % 100 === 0 ? 0.5 : 0.1));
    const w = buildWaveform(samples, 6);
    expect(w).toHaveLength(6);
    expect(Math.max(...w)).toBe(31);
    expect(buildWaveform([])).toBeUndefined();
  });
  it('bytes and extensions', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB');
    expect(fileExtension('Report.PDF')).toBe('pdf');
    expect(fileExtension('', 'application/zip')).toBe('zip');
    expect(fileExtension('', 'application/x-msvideo')).toBe('msvide');
  });
});
