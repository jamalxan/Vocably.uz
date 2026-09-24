import { describe, it, expect } from 'vitest';
import { slugify, uniqueSlug, buildSections, summarizeSections, attachAudioToPart, SECTION_DURATIONS } from './buildTest';

describe('slugify', () => {
  it('IELTS sarlavhasini slug qiladi', () => {
    expect(slugify('Cambridge IELTS 19 — Test 2')).toBe('cambridge-ielts-19-test-2');
  });

  it("apostrof va ortiqcha belgilarni tashlaydi", () => {
    expect(slugify("O'quvchi's Test #1!!")).toBe('oquvchis-test-1');
  });

  it("bo'sh kirish uchun ham yaroqli slug qaytaradi", () => {
    expect(slugify('')).toBe('test');
    expect(slugify('***')).toBe('test');
  });
});

describe('uniqueSlug', () => {
  it('band bo\'lmasa o\'zini qaytaradi', () => {
    expect(uniqueSlug('test-1', ['boshqa'])).toBe('test-1');
  });

  it('band bo\'lsa keyingi bo\'sh raqamni topadi', () => {
    expect(uniqueSlug('test-1', ['test-1', 'test-1-2'])).toBe('test-1-3');
  });
});

describe('buildSections', () => {
  const passage = { order: 1 as const, title: 'Glass', paragraphs: [{ html: '<p>x</p>' }], questionGroups: [{ id: 'g1', type: 'short_answer' as const, instructionHtml: '', questions: [{ number: 1, promptHtml: 'q', answer: { accepted: ['a'] } }] }] };

  it("faqat mavjud bo'limlarni qo'shadi", () => {
    const sections = buildSections({ reading: [passage] });
    expect(Object.keys(sections)).toEqual(['reading']);
    expect(sections.reading?.durationSec).toBe(SECTION_DURATIONS.reading);
  });

  it("Listening part'lari audiosiz yaratiladi (audioUrl bo'sh) — yolg'on 'to'liq' test emas", () => {
    const sections = buildSections({
      listening: [{ order: 1, contextText: 'ctx', questionGroups: [] }],
      transcripts: { 1: 'PART 1 transcript' },
    });
    expect(sections.listening?.parts[0].audioUrl).toBe('');
    expect(sections.listening?.parts[0].transcript).toBe('PART 1 transcript');
    expect(sections.listening?.checkTimeSec).toBe(SECTION_DURATIONS.listeningCheckTime);
  });

  it("bo'sh Speaking yozilmaydi", () => {
    const sections = buildSections({
      speaking: { part1Questions: [], part3Questions: [], part2CueCard: { topic: '', bulletPoints: [], prepSec: 60, speakSec: 120 } },
    });
    expect(sections.speaking).toBeUndefined();
  });

  it("Writing task'larini order bo'yicha tartiblaydi", () => {
    const sections = buildSections({
      writing: [
        { order: 2, minWords: 250, recommendedMin: 40, promptHtml: '<p>b</p>', hasVisual: false },
        { order: 1, minWords: 150, recommendedMin: 20, promptHtml: '<p>a</p>', hasVisual: true },
      ],
    });
    expect(sections.writing?.tasks.map((t) => t.order)).toEqual([1, 2]);
  });
});

describe('summarizeSections', () => {
  it("audiosiz part'lar sonini ko'rsatadi", () => {
    const sections = buildSections({ listening: [{ order: 1, contextText: '', questionGroups: [] }] });
    const summary = summarizeSections(sections);
    expect(summary[0].detail).toContain('1 part audiosiz');
  });
});

describe('attachAudioToPart', () => {
  const sections = {
    listening: { durationSec: 1800, checkTimeSec: 120, parts: [{ order: 1, audioUrl: '', durationSec: 0 }, { order: 2, audioUrl: '', durationSec: 0 }] },
  };

  it("ko'rsatilgan part'ga biriktiradi va asl obyektni o'zgartirmaydi", () => {
    const result = attachAudioToPart(sections, 2, { audioUrl: '/api/exam/audio/abc', durationSec: 300 });
    expect(result.attached).toBe(true);
    expect(result.sections.listening.parts[1].audioUrl).toBe('/api/exam/audio/abc');
    expect(result.sections.listening.parts[0].audioUrl).toBe('');
    expect(sections.listening.parts[1].audioUrl).toBe(''); // mutatsiya yo'q
  });

  it("mavjud bo'lmagan part uchun attached=false", () => {
    expect(attachAudioToPart(sections, 4, { audioUrl: '/x' }).attached).toBe(false);
  });

  it("Listening bo'limi yo'q testda yiqilmaydi", () => {
    expect(attachAudioToPart({ reading: {} }, 1, { audioUrl: '/x' }).attached).toBe(false);
  });
});
