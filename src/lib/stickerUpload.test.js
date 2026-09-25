import { describe, it, expect } from 'vitest';
import { buildStickerKey, stickerMagicMatches, STICKER_MIME_EXT } from './s3';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50];
const HTML = Array.from('<html><body>').map((c) => c.charCodeAt(0));

describe('stiker yuklash tekshiruvi', () => {
  it('faqat PNG/WEBP/GIF — SVG yo\'q', () => {
    expect(Object.keys(STICKER_MIME_EXT).sort()).toEqual(['image/gif', 'image/png', 'image/webp']);
    expect(() => buildStickerKey('p', 's', 'image/svg+xml')).toThrow();
  });

  it('kalit tuzilmasi', () => {
    expect(buildStickerKey('aaa', 'bbb', 'image/webp')).toBe('stickers/aaa/bbb.webp');
  });

  it('magic bytes e\'lon qilingan formatga mos bo\'lishi shart', () => {
    expect(stickerMagicMatches('image/png', PNG)).toBe(true);
    expect(stickerMagicMatches('image/gif', GIF)).toBe(true);
    expect(stickerMagicMatches('image/webp', WEBP)).toBe(true);
    expect(stickerMagicMatches('image/png', GIF)).toBe(false);
    expect(stickerMagicMatches('image/webp', PNG)).toBe(false);
    expect(stickerMagicMatches('image/png', HTML)).toBe(false);
    expect(stickerMagicMatches('image/png', null)).toBe(false);
  });
});
