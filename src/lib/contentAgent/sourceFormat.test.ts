import { describe, it, expect } from 'vitest';
import { detectSourceFormat } from './sourceFormat';

describe('detectSourceFormat', () => {
  it('detects PDF by exact MIME type', () => {
    expect(detectSourceFormat({ mimeType: 'application/pdf' })).toBe('pdf');
  });

  it('detects DOCX by exact MIME type', () => {
    expect(detectSourceFormat({ mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toBe('docx');
  });

  it('is case-insensitive and ignores MIME parameters', () => {
    expect(detectSourceFormat({ mimeType: 'APPLICATION/PDF' })).toBe('pdf');
    expect(detectSourceFormat({ mimeType: 'application/pdf; charset=binary' })).toBe('pdf');
  });

  it('falls back to filename extension when MIME type is missing or generic', () => {
    expect(detectSourceFormat({ mimeType: '', filename: 'IELTS Book 15.pdf' })).toBe('pdf');
    expect(detectSourceFormat({ mimeType: 'application/octet-stream', filename: 'answer-key.DOCX' })).toBe('docx');
  });

  it('prefers an exact MIME match over a conflicting filename extension', () => {
    // Amalda kamdan-kam bo'ladi, lekin MIME ANIQ mos kelsa — eng ishonchli
    // signal, kengaytmadan ustun turadi.
    expect(detectSourceFormat({ mimeType: 'application/pdf', filename: 'source.docx' })).toBe('pdf');
  });

  it('returns null for unrecognised formats', () => {
    expect(detectSourceFormat({ mimeType: 'application/epub+zip', filename: 'book.epub' })).toBeNull();
    expect(detectSourceFormat({})).toBeNull();
    expect(detectSourceFormat({ mimeType: 'image/png', filename: 'scan.png' })).toBeNull();
  });
});
