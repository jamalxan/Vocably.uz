import { describe, expect, it } from 'vitest';
import { detectImageType, safeImageFilename } from './imageUpload';

const bytes = (...n: number[]) => Uint8Array.from(n);

describe('detectImageType', () => {
  it('PNG / JPEG / WEBP / GIF ni baytlardan taniydi', () => {
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe('image/png');
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
    expect(detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe('image/webp');
    expect(detectImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe('image/gif');
  });
  it('HTML/SVG/matn va qisqa/bo‘sh baytlarni rad etadi (nomi .png bo‘lsa ham)', () => {
    const enc = (s: string) => new TextEncoder().encode(s);
    expect(detectImageType(enc('<html><script>alert(1)</script>'))).toBeNull();
    expect(detectImageType(enc('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectImageType(bytes())).toBeNull();
    expect(detectImageType(bytes(0x89, 0x50))).toBeNull();
    expect(detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45))).toBeNull(); // RIFF/WAVE
  });
});

describe('safeImageFilename', () => {
  it('kengaytma aniqlangan turdan, nom tozalanadi', () => {
    expect(safeImageFilename('My Photo (1).exe', 'image/png')).toBe('vocab-My-Photo-1.png');
    // yo'l o'tish urinishi: natijada "/" va ".." bo'lmaydi, kengaytma faqat aniqlangan turdan
    expect(safeImageFilename('../../etc/passwd', 'image/jpeg')).toMatch(/^vocab-[a-zA-Z0-9_-]+\.jpg$/);
    expect(safeImageFilename('a/../b.html', 'image/png')).toMatch(/^vocab-[a-zA-Z0-9_-]+\.png$/);
    expect(safeImageFilename('', 'image/webp')).toBe('vocab-image.webp');
  });
});
