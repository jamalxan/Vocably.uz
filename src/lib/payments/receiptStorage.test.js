import { describe, it, expect } from 'vitest';
import { receiptMagicMatches } from './receiptStorage';

describe('receiptMagicMatches', () => {
  it('accepts real signatures and rejects a disguised file', () => {
    expect(receiptMagicMatches('image/jpeg', [0xff, 0xd8, 0xff, 0xe0])).toBe(true);
    expect(receiptMagicMatches('image/png', [0x89, 0x50, 0x4e, 0x47])).toBe(true);
    expect(receiptMagicMatches('application/pdf', [...Buffer.from('%PDF-1.7')])).toBe(true);
    expect(receiptMagicMatches('image/png', [...Buffer.from('<html>')])).toBe(false);
    expect(receiptMagicMatches('text/html', [...Buffer.from('<html>')])).toBe(false);
  });
});
