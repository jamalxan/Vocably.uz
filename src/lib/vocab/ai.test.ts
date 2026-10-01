import { describe, it, expect } from 'vitest';
import { buildCoachMessage, buildExercisesPrompt, buildStoryPrompt, validateExercises, validateStory, AI_PROMPT_VERSIONS } from './ai';

const base = { dueCount: 0, overdueCount: 0, weakCount: 0, recentMistakes: [], streak: 0, streakAtRisk: false, dailyDone: 0, dailyTotal: 4, newAvailable: 0 };

describe('AI Coach (real ma\'lumotga asoslangan)', () => {
  it("due va yaqindagi xatolar haqida aniq xabar", () => {
    const c = buildCoachMessage({ ...base, name: 'Ali', dueCount: 18, overdueCount: 5, recentMistakes: ['significant', 'maintain'], hourLocal: 9 });
    expect(c.message).toContain('Xayrli tong, Ali!');
    expect(c.message).toContain('18 ta');
    expect(c.message).toContain('"significant" va "maintain"');
    expect(c.action.href).toContain('mode=weak');
  });
  it('xato yo\'q — takrorlashga yo\'naltiradi', () => {
    const c = buildCoachMessage({ ...base, dueCount: 6 });
    expect(c.action.href).toBe('/app/lugat/takrorlash');
  });
  it("hammasi bo'sh — yangi so'zlar yoki o'yin", () => {
    expect(buildCoachMessage({ ...base, newAvailable: 4 }).action.href).toBe('/app/lugat/kartochka');
    expect(buildCoachMessage(base).action.href).toBe('/app/oyinlar');
  });
  it('kunlik vazifalar bajarilsa — tabrik', () => {
    const c = buildCoachMessage({ ...base, dailyDone: 4 });
    expect(c.tone).toBe('celebrate');
    expect(c.message).toContain('Ajoyib');
  });
  it('seriya xavfda — yumshoq eslatma, jazolamaydi', () => {
    const c = buildCoachMessage({ ...base, streak: 12, streakAtRisk: true });
    expect(c.tone).toBe('nudge');
    expect(c.message).toContain('12 kunlik');
    expect(c.message.toLowerCase()).not.toContain('yo\'qot');
  });
});

describe('AI hikoya (TZ §27.3)', () => {
  const words = ['maintain', 'significant', 'reluctant'];
  const story = 'Anna was **reluctant** to start the project. She knew it would make a **significant** difference to her team, so she decided to **maintain** a regular schedule. Every morning she wrote a short plan and checked it in the evening. After two weeks, her colleagues noticed that the work was calmer and better organised than before, and they asked how she did it.';
  it("prompt versiyasi va so'zlar ro'yxati", () => {
    expect(AI_PROMPT_VERSIONS.story).toBe('vocab_story_v1');
    expect(buildStoryPrompt(words, 'B2')).toContain('"maintain", "significant", "reluctant"');
  });
  it("yaroqli hikoya qabul qilinadi", () => {
    const v = validateStory({ title: 'A plan', story, summaryUz: 'x', question: 'y' }, words);
    expect(v.ok).toBe(true);
    expect(v.usedWords.length).toBe(3);
    expect(v.missingWords).toEqual([]);
  });
  it("so'zlar yetishmasa yoki juda qisqa bo'lsa rad", () => {
    const short = validateStory({ title: 't', story: 'Too short story.', summaryUz: '', question: '' }, words);
    expect(short.ok).toBe(false);
    expect(short.reason).toBe('length');
    const missing = validateStory({ title: 't', story: story.replace(/reluctant|significant|maintain/g, 'foo'), summaryUz: '', question: '' }, words);
    expect(missing.ok).toBe(false);
    expect(missing.reason).toBe('missing_words');
    expect(validateStory(null, words).reason).toBe('empty');
  });
});

describe('AI mashqlar (TZ §27.2) — qat\'iy tekshiruv', () => {
  const allowed = ['maintain', 'significant'];
  const good = [
    { word: 'maintain', type: 'multiple_choice', prompt: 'Choose the synonym of maintain', options: ['keep', 'break', 'lose', 'forget'], answer: 'keep', explanationUz: "maintain = saqlab qolmoq" },
    { word: 'significant', type: 'fill_gap', prompt: 'There was a _____ rise in prices.', answer: 'significant', explanationUz: 'muhim' },
  ];
  it("to'g'ri mashqlar qabul qilinadi va AI_GENERATED deb belgilanadi", () => {
    const r = validateExercises({ exercises: good }, allowed);
    expect(r.valid.length).toBe(2);
    expect(r.rejected).toBe(0);
    expect(r.valid.every((e) => e.status === 'AI_GENERATED')).toBe(true);
  });
  it("yaroqsizlari tashlanadi", () => {
    const bad = [
      { ...good[0], options: ['keep', 'keep', 'lose', 'forget'] }, // takroriy variant
      { ...good[0], options: ['a', 'b', 'c', 'd'] }, // javob variantlarda yo'q
      { ...good[1], prompt: 'No gap here.' }, // bo'sh joy yo'q
      { ...good[0], word: 'hacker' }, // ruxsat etilmagan so'z
      { ...good[0], explanationUz: '' },
      { ...good[0], type: 'essay' },
      null,
    ];
    const r = validateExercises({ exercises: [...bad, good[0]] }, allowed);
    expect(r.valid.length).toBe(1);
    expect(r.rejected).toBe(7);
  });
  it("noto'g'ri shakldagi javob xavfsiz", () => {
    expect(validateExercises(null, allowed)).toEqual({ valid: [], rejected: 0 });
    expect(validateExercises({ exercises: 'x' }, allowed)).toEqual({ valid: [], rejected: 0 });
  });
  it('prompt tarjimalar bilan', () => {
    expect(buildExercisesPrompt([{ word: 'maintain', translations: ['saqlamoq'] }], 3)).toContain('3 tadan');
  });
});
