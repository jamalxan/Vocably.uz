import { describe, it, expect } from 'vitest';
import { isValidImageMagicBytes } from './imageMagicBytes';

function bytes(...arr) {
  return new Uint8Array(arr);
}

describe('isValidImageMagicBytes', () => {
  it('accepts a real JPEG signature', () => {
    expect(isValidImageMagicBytes(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toBe(true);
  });

  it('accepts a real PNG signature', () => {
    expect(isValidImageMagicBytes(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00))).toBe(true);
  });

  it('accepts GIF87a and GIF89a', () => {
    expect(isValidImageMagicBytes(bytes(0x47, 0x49, 0x46, 0x38, 0x37, 0x61))).toBe(true);
    expect(isValidImageMagicBytes(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe(true);
  });

  it('accepts BMP signature', () => {
    expect(isValidImageMagicBytes(bytes(0x42, 0x4d, 0x00, 0x00))).toBe(true);
  });

  it('accepts WEBP (RIFF....WEBP)', () => {
    expect(
      isValidImageMagicBytes(bytes(0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50))
    ).toBe(true);
  });

  it('rejects an HTML file renamed/mislabeled as an image', () => {
    const html = '<!DOCTYPE html><script>alert(1)</script>';
    const encoded = new TextEncoder().encode(html);
    expect(isValidImageMagicBytes(encoded)).toBe(false);
  });

  it('rejects a RIFF file that is not WEBP (e.g. a WAV file)', () => {
    expect(
      isValidImageMagicBytes(bytes(0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45))
    ).toBe(false);
  });

  it('rejects empty/too-short input', () => {
    expect(isValidImageMagicBytes(bytes())).toBe(false);
    expect(isValidImageMagicBytes(bytes(0xff, 0xd8))).toBe(false);
    expect(isValidImageMagicBytes(null)).toBe(false);
    expect(isValidImageMagicBytes(undefined)).toBe(false);
  });

  it('accepts a Node Buffer as input (not just Uint8Array)', () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    expect(isValidImageMagicBytes(buf)).toBe(true);
  });
});
