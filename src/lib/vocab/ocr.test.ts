import { describe, expect, it } from 'vitest';
import { OCR_PAGES_PER_CHUNK, buildOcrPrompt, cleanOcrText, looksLikeRefusal, planOcrRanges } from './ocr';

describe('planOcrRanges', () => {
  it('sahifalarni ketma-ket oraliqlarga bo‘ladi (oxirgisi qisqa bo‘lishi mumkin)', () => {
    expect(planOcrRanges(7)).toEqual([{ from: 1, to: 3 }, { from: 4, to: 6 }, { from: 7, to: 7 }]);
    expect(planOcrRanges(3)).toEqual([{ from: 1, to: 3 }]);
    expect(planOcrRanges(1, 5)).toEqual([{ from: 1, to: 1 }]);
  });
  it('bo‘sh/noto‘g‘ri sonda bo‘sh ro‘yxat', () => {
    expect(planOcrRanges(0)).toEqual([]);
    expect(planOcrRanges(-4)).toEqual([]);
    expect(planOcrRanges(Number.NaN)).toEqual([]);
  });
  it('har sahifa roppa-rosa bir marta qoplanadi', () => {
    const r = planOcrRanges(100);
    const covered = r.flatMap((x) => Array.from({ length: x.to - x.from + 1 }, (_, i) => x.from + i));
    expect(covered).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
    expect(r.every((x) => x.to - x.from + 1 <= OCR_PAGES_PER_CHUNK)).toBe(true);
  });
});

describe('buildOcrPrompt', () => {
  it('sahifa oralig‘ini ko‘rsatadi', () => {
    expect(buildOcrPrompt(4, 6)).toContain('pages 4 to 6');
    expect(buildOcrPrompt(2, 2)).toContain('page 2');
    expect(buildOcrPrompt(2, 2)).not.toContain('pages 2');
  });
});

describe('cleanOcrText', () => {
  it('kod-blok o‘rami va kirish gapini olib tashlaydi', () => {
    expect(cleanOcrText('```text\nHello world.\n\nSecond.\n```')).toBe('Hello world.\n\nSecond.');
    expect(cleanOcrText('Here is the transcription:\n\nThe cat sat.')).toBe('The cat sat.');
  });
  it('ortiqcha bo‘sh qatorlarni siqadi; matn emasni bo‘sh qaytaradi', () => {
    expect(cleanOcrText('A\n\n\n\nB   \nC')).toBe('A\n\nB\nC');
    expect(cleanOcrText(undefined)).toBe('');
    expect(cleanOcrText(42)).toBe('');
  });
  it('oddiy matnga tegmaydi', () => {
    const t = 'Climate policy has shifted.\n\nGovernments must act.';
    expect(cleanOcrText(t)).toBe(t);
  });
});

describe('looksLikeRefusal', () => {
  it('uzr/rad javobini aniqlaydi, oddiy (hatto qisqa) matnni emas', () => {
    expect(looksLikeRefusal("I'm sorry, but I can't read this page.")).toBe(true);
    expect(looksLikeRefusal('I am unable to transcribe the text.')).toBe(true);
    expect(looksLikeRefusal('The committee was sorry to announce the delay.')).toBe(false);
    expect(looksLikeRefusal('')).toBe(false);
    expect(looksLikeRefusal(`I'm sorry. ${'x'.repeat(500)}`)).toBe(false); // uzun — haqiqiy matn bo'lishi mumkin
  });
});
