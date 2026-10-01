import { describe, it, expect } from 'vitest';
import {
  GAME_CATALOG,
  acceptedForWord,
  availabilityFor,
  blankSentence,
  buildGameSession,
  findWordInSentence,
  getGame,
  tierAllows,
  toClientQuestion,
  type GameKey,
} from './games';
import { DIFFICULTIES } from './config';
import { seededRandom } from './rng';
import { BARE_WORDS, SAMPLE_WORDS } from './fixtures';

const build = (gameKey: GameKey, difficulty: (typeof DIFFICULTIES)[number] = 'medium', seed = 'seed') =>
  buildGameSession({ gameKey, difficulty, words: SAMPLE_WORDS, rand: seededRandom(seed) });

describe('katalog (TZ §9)', () => {
  it("barcha o'yinlar noyob kalitga va to'liq parametrlarga ega", () => {
    const keys = GAME_CATALOG.map((g) => g.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const g of GAME_CATALOG) {
      for (const d of DIFFICULTIES) {
        expect(g.questionCount[d]).toBeGreaterThan(0);
        expect(d in g.timePerQuestionSec).toBe(true);
      }
      expect(g.title.length).toBeGreaterThan(2);
    }
  });
  it('P0 o\'yinlar mavjud', () => {
    for (const k of ['word_match', 'multiple_choice', 'fill_gap', 'listen_choose', 'listen_type']) {
      expect(getGame(k)?.priority).toBe('P0');
    }
  });
  it('tierAllows tartibi', () => {
    expect(tierAllows('free', 'free')).toBe(true);
    expect(tierAllows('free', 'standard')).toBe(false);
    expect(tierAllows('premium', 'standard')).toBe(true);
    expect(tierAllows('standard', 'premium')).toBe(false);
  });
});

describe('gapdagi so\'zni topish', () => {
  it('turli shakllarni topadi', () => {
    expect(findWordInSentence('He maintained his calm.', 'maintain')?.surface).toBe('maintained');
    expect(findWordInSentence('They are studying hard.', 'study')?.surface).toBe('studying');
    expect(findWordInSentence('She studies every day.', 'study')?.surface).toBe('studies');
    expect(findWordInSentence('He was reluctant to go.', 'reluctant')?.surface).toBe('reluctant');
    expect(findWordInSentence('We plan to generate power.', 'generate')?.surface).toBe('generate');
  });
  it("so'z bo'lagi emas, butun so'zni qidiradi", () => {
    expect(findWordInSentence('He hesitated.', 'sit')).toBeNull();
    expect(findWordInSentence('Unmaintained roads.', 'maintain')).toBeNull();
  });
  it('bo\'sh joy qo\'yadi', () => {
    const f = findWordInSentence('You must maintain a healthy diet.', 'maintain')!;
    expect(blankSentence('You must maintain a healthy diet.', f)).toBe('You must _____ a healthy diet.');
  });
  it('qabul qilinadigan shakllar normallashgan', () => {
    expect(acceptedForWord('Maintain', 'Maintained')).toEqual(['maintain', 'maintained']);
  });
});

describe('savol generatsiyasi', () => {
  it.each(GAME_CATALOG.map((g) => g.key))('%s: savollar tuziladi va javobsiz ko\'rinish sir saqlaydi', (key) => {
    const s = build(key as GameKey);
    expect(s.questions.length).toBeGreaterThan(0);
    for (const q of s.questions) {
      const client = toClientQuestion(q) as Record<string, unknown>;
      expect(client.answer).toBeUndefined();
      expect(client.accepted).toBeUndefined();
      expect(client.answerTokens).toBeUndefined();
      expect(client.answerMap).toBeUndefined();
      expect(client.correctDisplay).toBeUndefined();
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });

  it("qiyinlik bo'yicha savollar soni katalogga mos", () => {
    for (const d of DIFFICULTIES) {
      const s = build('multiple_choice', d);
      expect(s.questions.length).toBe(getGame('multiple_choice')!.questionCount[d]);
    }
  });

  it("qid lar noyob va ketma-ket", () => {
    const s = build('multiple_choice');
    expect(s.questions.map((q) => q.qid)).toEqual(s.questions.map((_, i) => `q${i + 1}`));
  });

  it('bir xil seed — bir xil sessiya (qayta tiklash uchun)', () => {
    const a = build('fill_gap', 'medium', 'same');
    const b = build('fill_gap', 'medium', 'same');
    expect(JSON.stringify(a.questions)).toBe(JSON.stringify(b.questions));
    const c = build('fill_gap', 'medium', 'different');
    expect(JSON.stringify(c.questions)).not.toBe(JSON.stringify(a.questions));
  });

  it("choice savolida to'g'ri variant mavjud va variantlar noyob", () => {
    for (const key of ['multiple_choice', 'listen_choose', 'definition_challenge', 'synonym_antonym'] as GameKey[]) {
      const s = build(key);
      for (const q of s.questions) {
        expect(q.inputType).toBe('choice');
        const ids = (q.options || []).map((o) => o.id);
        expect(ids).toContain(q.answer);
        const texts = (q.options || []).map((o) => o.text.toLowerCase());
        expect(new Set(texts).size).toBe(texts.length);
        expect(q.options!.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("image_to_word: savolda rasm bor, variantlar so'z, to'g'ri variant so'zning o'zi", () => {
    const s = build('image_to_word');
    expect(s.questions.length).toBeGreaterThan(0);
    for (const q of s.questions) {
      const w = SAMPLE_WORDS.find((x) => x.wordId === q.wordId)!;
      expect(q.kind).toBe('image_word');
      expect(q.imageUrl).toBe(w.imageUrl);
      expect(q.options!.find((o) => o.id === q.answer)!.text).toBe(w.word);
    }
  });

  it("word_to_image: variantlar rasm, to'g'ri variant so'zning rasmi, rasmlar noyob", () => {
    const s = build('word_to_image');
    expect(s.questions.length).toBeGreaterThan(0);
    for (const q of s.questions) {
      const w = SAMPLE_WORDS.find((x) => x.wordId === q.wordId)!;
      expect(q.kind).toBe('word_image');
      const urls = q.options!.map((o) => o.imageUrl);
      expect(new Set(urls).size).toBe(urls.length);
      expect(q.options!.find((o) => o.id === q.answer)!.imageUrl).toBe(w.imageUrl);
      expect(q.options!.find((o) => o.id === q.answer)!.text).toBe(q.correctDisplay);
    }
  });

  it("rasm o'yinlari: kamida 4 ta rasmli so'z talab qilinadi", () => {
    expect(availabilityFor(getGame('image_to_word')!, SAMPLE_WORDS).available).toBe(true);
    expect(availabilityFor(getGame('word_to_image')!, BARE_WORDS).available).toBe(false);
    const three = SAMPLE_WORDS.map((w, i) => (i < 3 ? w : { ...w, imageUrl: '' }));
    expect(availabilityFor(getGame('image_to_word')!, three).available).toBe(false);
  });

  it("mc_meaning: to'g'ri javob so'zning o'z tarjimalaridan, distraktorlar boshqa so'zlarniki", () => {
    const s = build('multiple_choice', 'hard');
    for (const q of s.questions.filter((x) => x.kind === 'mc_meaning')) {
      const w = SAMPLE_WORDS.find((x) => x.wordId === q.wordId)!;
      const correct = q.options!.find((o) => o.id === q.answer)!.text;
      expect(w.translations).toContain(correct);
      for (const o of q.options!) {
        if (o.id === q.answer) continue;
        expect(w.translations).not.toContain(o.text);
      }
    }
  });

  it("fill_gap: easy/medium — variantli, hard/expert — yozma", () => {
    expect(build('fill_gap', 'easy').questions.every((q) => q.inputType === 'choice')).toBe(true);
    expect(build('fill_gap', 'hard').questions.every((q) => q.inputType === 'typed')).toBe(true);
    const q = build('fill_gap', 'hard').questions[0];
    expect(q.prompt).toContain('_____');
    expect(q.accepted!.length).toBeGreaterThan(0);
  });

  it('listen_type: audio matn so\'zning o\'zi, yozma javob', () => {
    const q = build('listen_type').questions[0];
    expect(q.inputType).toBe('typed');
    expect(q.audioText).toBe(q.word);
    expect(q.accepted).toContain(q.word.toLowerCase());
    expect(q.skill).toBe('spelling');
    expect(q.secondarySkill).toBe('listening');
  });

  it("sentence_builder: tokenlar aralashgan, javob asl tartibda", () => {
    const s = build('sentence_builder');
    for (const q of s.questions) {
      expect(q.tokens!.slice().sort()).toEqual(q.answerTokens!.slice().sort());
      expect(q.tokens!.join(' ')).not.toBe(q.answerTokens!.join(' '));
    }
  });

  it("word_match: har raundda juftliklar, o'ng id lar chap id lardan farqli", () => {
    const s = build('word_match', 'medium');
    expect(s.questions.length).toBe(3);
    for (const q of s.questions) {
      expect(q.inputType).toBe('match');
      expect(q.lefts!.length).toBe(q.rights!.length);
      expect(Object.keys(q.answerMap!).length).toBe(q.lefts!.length);
      for (const l of q.lefts!) expect(q.rights!.some((r) => r.id === l.id)).toBe(false);
    }
  });

  it('memory o\'yini memory_pairs turini ishlatadi', () => {
    expect(build('memory').questions.every((q) => q.kind === 'memory_pairs')).toBe(true);
    const q = build('memory').questions[0];
    expect(toClientQuestion(q).memoryMap).toEqual(q.answerMap); // faqat memory uchun mijozga beriladi
    expect((toClientQuestion(build('word_match').questions[0]) as Record<string, unknown>).memoryMap).toBeUndefined();
  });

  it("vocabulary_boss: 5 bo'lim, har qiyinlikda 10 tadan (50 ta)", () => {
    const s = build('vocabulary_boss', 'medium');
    expect(s.questions.length).toBe(50);
    const kinds = new Set(s.questions.map((q) => q.kind));
    expect(kinds.has('listen_choose')).toBe(true);
    expect(kinds.has('syn_ant') || kinds.has('definition')).toBe(true);
  });

  it("word_drop: yozma, vaqt chegarali", () => {
    const s = build('word_drop', 'hard');
    expect(s.questions.every((q) => q.inputType === 'typed' && q.timeLimitSec === 8)).toBe(true);
  });

  it("kam so'z bilan ham sessiya tuziladi (so'zlar aylanadi), lekin ketma-ket takrorlanmaydi", () => {
    const words = SAMPLE_WORDS.slice(0, 5);
    const s = buildGameSession({ gameKey: 'multiple_choice', difficulty: 'medium', words, rand: seededRandom('x') });
    expect(s.questions.length).toBe(10);
    for (let i = 1; i < s.questions.length; i++) {
      // bir so'z ketma-ket ikki savolda kelmasin
      if (words.length > 1) expect(s.questions[i].wordId === s.questions[i - 1].wordId).toBe(false);
    }
  });

  it("ma'lumot yetmasa shortfall ko'rsatiladi", () => {
    const s = buildGameSession({ gameKey: 'definition_challenge', difficulty: 'medium', words: BARE_WORDS, rand: seededRandom('y') });
    expect(s.questions.length).toBe(0);
    const s2 = buildGameSession({ gameKey: 'fill_gap', difficulty: 'easy', words: [], rand: seededRandom('z') });
    expect(s2.questions.length).toBe(0);
  });
});

describe('availabilityFor', () => {
  it("yetarli so'z va ma'lumot bo'lsa mavjud", () => {
    for (const g of GAME_CATALOG) {
      expect(availabilityFor(g, SAMPLE_WORDS).available).toBe(true);
    }
  });
  it("kam so'z — mavjud emas va sabab ko'rsatiladi", () => {
    const r = availabilityFor(getGame('word_match')!, SAMPLE_WORDS.slice(0, 2));
    expect(r.available).toBe(false);
    expect(r.reason).toContain('Kamida');
  });
  it("boyitilmagan so'zlar uchun ta'rif/misol talab qiladigan o'yinlar yopiq", () => {
    expect(availabilityFor(getGame('definition_challenge')!, BARE_WORDS).available).toBe(false);
    expect(availabilityFor(getGame('synonym_antonym')!, BARE_WORDS).available).toBe(false);
    expect(availabilityFor(getGame('sentence_builder')!, BARE_WORDS).available).toBe(false);
    expect(availabilityFor(getGame('fill_gap')!, BARE_WORDS).available).toBe(false);
    expect(availabilityFor(getGame('listen_choose')!, BARE_WORDS).available).toBe(true);
    expect(availabilityFor(getGame('word_match')!, BARE_WORDS).available).toBe(true);
  });
});
