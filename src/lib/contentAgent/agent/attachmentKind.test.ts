import { describe, it, expect } from 'vitest';
import { detectAttachment, exceedsSizeLimit, humanSize, MAX_BYTES } from './attachmentKind';

describe('detectAttachment', () => {
  it('PDF va DOCX hujjat sifatida tanadi (MIME yoki kengaytma bo\'yicha)', () => {
    expect(detectAttachment('Cambridge 19.pdf', 'application/pdf')).toEqual({ kind: 'document', documentFormat: 'pdf' });
    // Ba'zi brauzer/OS kombinatsiyalarida MIME bo'sh keladi — kengaytma yetarli.
    expect(detectAttachment('test.docx', '')).toEqual({ kind: 'document', documentFormat: 'docx' });
  });

  it('audio va rasmni ajratadi', () => {
    expect(detectAttachment('part1.mp3', 'audio/mpeg').kind).toBe('audio');
    expect(detectAttachment('chart.png', 'image/png').kind).toBe('image');
  });

  it("matn faylini alohida tur sifatida oladi", () => {
    expect(detectAttachment('passage.txt', 'text/plain')).toEqual({ kind: 'text', documentFormat: 'text' });
  });

  it('videoni sababi bilan rad etadi (ffmpeg yo\'q)', () => {
    const result = detectAttachment('lesson.mp4', 'video/mp4');
    expect(result.kind).toBe('unsupported');
    expect(result.reason).toContain('audio');
  });

  it('eski .doc uchun aniq yo\'riqnoma beradi', () => {
    expect(detectAttachment('old.doc', 'application/msword').reason).toContain('.docx');
  });

  it("noma'lum tur uchun ham sabab qaytaradi", () => {
    expect(detectAttachment('archive.zip', 'application/zip').kind).toBe('unsupported');
  });

  it("webm audio sifatida qabul qilinadi (brauzer yozuvlari)", () => {
    expect(detectAttachment('recording.webm', 'audio/webm').kind).toBe('audio');
  });
});

describe('exceedsSizeLimit', () => {
  it('chegaradan katta faylni rad etadi', () => {
    expect(exceedsSizeLimit('image', MAX_BYTES.image + 1)).toBe(true);
    expect(exceedsSizeLimit('image', MAX_BYTES.image)).toBe(false);
  });
});

describe('humanSize', () => {
  it('MB va KB ni to\'g\'ri formatlaydi', () => {
    expect(humanSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(humanSize(2048)).toBe('2 KB');
  });
});
