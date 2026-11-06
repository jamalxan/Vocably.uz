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
  typedAcceptedForWord,
  type GameKey,
  type GameWord,
} from './games';
import { validateAnswer } from './answering';
import { minPlausibleMs } from './antiCheat';
import { normalizeForCompare } from '../textCompare';
import { typedFloorMs } from '../flagship/typing';
import { DIFFICULTIES, type Difficulty } from './config';
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
      expect(client.word).toBeUndefined();
      expect(client.wordId).toBeUndefined();
      expect(client.explanation).toBeUndefined();
      // no field other than the option list may contain the right option's text
      // (listen_choose is the exception by design: browser TTS needs audioText = the word)
      const right = q.options?.find((o) => o.id === q.answer)?.text;
      if (right && q.kind !== 'listen_choose') {
        const { options, ...rest } = client;
        void options;
        expect(JSON.stringify(rest).toLowerCase()).not.toContain(`"${right.toLowerCase()}"`);
      }
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

describe('vocably_run (TZ 2.0 flagship)', () => {
  it('always has 3 lanes with one right word; keeps the chosen difficulty', () => {
    for (const d of DIFFICULTIES) {
      const s = build('vocably_run', d, `run-${d}`);
      expect(s.questions.length).toBe(30);
      for (const q of s.questions) {
        expect(q.options).toHaveLength(3);
        expect(['mc_word', 'definition']).toContain(q.kind);
        expect(q.difficulty).toBe(d);
        expect(q.options!.find((o) => o.id === q.answer)?.text).toBe(q.word);
      }
    }
  });
  it('easy asks Uzbek meanings; harder levels mix in definitions', () => {
    expect(build('vocably_run', 'easy').questions.every((q) => q.kind === 'mc_word')).toBe(true);
    expect(new Set(build('vocably_run', 'hard').questions.map((q) => q.kind))).toEqual(new Set(['mc_word', 'definition']));
  });
});

describe('typing flagship games (word_tunnel, word_defense)', () => {
  const TYPED_KEYS: GameKey[] = ['word_tunnel', 'word_defense'];
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  it.each(TYPED_KEYS)('%s: typed questions, one per word, hints by difficulty, no answer in the client view', (key) => {
    for (const d of DIFFICULTIES) {
      const s = build(key, d, `${key}-${d}`);
      expect(s.questions.length).toBeGreaterThanOrEqual(Math.min(SAMPLE_WORDS.length, getGame(key)!.minWords));
      expect(s.questions.length).toBeLessThanOrEqual(getGame(key)!.questionCount[d]);
      expect(new Set(s.questions.map((q) => q.wordId)).size).toBe(s.questions.length);
      expect(s.shortfall).toBeUndefined();
      for (const q of s.questions) {
        expect(q.inputType).toBe('typed');
        expect(['spell_drop', 'type_definition']).toContain(q.kind);
        expect(q.secondarySkill).toBe('recall');
        expect(validateAnswer(q, q.correctDisplay).isCorrect).toBe(true);
        const c = toClientQuestion(q) as Record<string, unknown>;
        for (const f of ['answer', 'accepted', 'word', 'wordId', 'correctDisplay', 'explanation', 'categoryId']) expect(c[f]).toBeUndefined();
        const prompt = normalizeForCompare(q.prompt);
        for (const a of q.accepted!) expect(prompt).not.toMatch(new RegExp(`\\b${escape(a)}\\b`));
        if (d === 'easy') {
          expect(c.answerLength).toBe(q.accepted![0].length);
          expect(String(c.hint).charAt(0)).toBe(q.accepted![0].charAt(0));
        } else if (d === 'medium') {
          expect(c.answerLength).toBe(q.accepted![0].length);
          expect(c.hint).toBeUndefined();
        } else {
          expect(c.answerLength).toBeUndefined();
          expect(c.hint).toBeUndefined();
        }
      }
      if (d === 'easy' || d === 'medium') expect(s.questions.every((q) => q.kind === 'spell_drop')).toBe(true);
    }
  });

  it('hard/expert mix in English definitions with the answer masked', () => {
    const kinds = new Set(TYPED_KEYS.flatMap((k) => (['hard', 'expert'] as const).flatMap((d) => build(k, d, `mix-${k}-${d}`).questions.map((q) => q.kind))));
    expect(kinds).toEqual(new Set(['spell_drop', 'type_definition']));
  });

  it('masks a definition that uses the headword itself', () => {
    const words = SAMPLE_WORDS.map((w) => ({ ...w, definitionEn: `the quality of being ${w.word}; ${w.word.toUpperCase()}S and more ${w.word}` }));
    for (const seed of ['m1', 'm2', 'm3']) {
      const s = buildGameSession({ gameKey: 'word_tunnel', difficulty: 'expert', words, rand: seededRandom(seed) });
      for (const q of s.questions.filter((x) => x.kind === 'type_definition')) {
        expect(normalizeForCompare(q.prompt)).not.toMatch(new RegExp(`\\b${escape(q.accepted![0])}`));
        expect(q.prompt).toContain('_____');
      }
    }
  });

  it('accepts fair spellings of the headword', () => {
    expect(typedAcceptedForWord('long-term')).toEqual(['long-term', 'long term', 'longterm']);
    expect(typedAcceptedForWord('look after (sb)')).toEqual(['look after', 'look-after', 'look after sb', 'look after (sb)']);
    expect(typedAcceptedForWord('to improve')).toContain('improve');
    expect(typedAcceptedForWord('affect / influence')).toEqual(expect.arrayContaining(['affect', 'influence']));
    expect(typedAcceptedForWord("Don't")).toEqual(['dont']);
    expect(typedAcceptedForWord('Reliable')).toEqual(['reliable']);
  });

  it('treats sb/sth as placeholders and bracketed parts as optional, never as answers of their own', () => {
    const rely = typedAcceptedForWord('rely on sb/sth');
    expect(rely[0]).toBe('rely on');
    expect(rely).toEqual(expect.arrayContaining(['rely on', 'rely on sb', 'rely on sth', 'rely on sb/sth']));
    expect(rely).not.toContain('sth');
    expect(rely).not.toContain('sb');
    expect(typedAcceptedForWord('in charge (of)')).toEqual(expect.arrayContaining(['in charge', 'in charge of', 'in charge (of)']));
    expect(typedAcceptedForWord('(be) responsible for')).toEqual(expect.arrayContaining(['responsible for', 'be responsible for']));
    expect(typedAcceptedForWord('make (a) decision')).toEqual(expect.arrayContaining(['make decision', 'make a decision']));
    expect(typedAcceptedForWord('colour/color')).toEqual(expect.arrayContaining(['colour', 'color']));
    expect(typedAcceptedForWord('look after/for')).toEqual(expect.arrayContaining(['look after', 'look for']));
    // a slash between numbers or single letters is part of the word, not an alternative
    expect(typedAcceptedForWord('24/7')).toEqual(['24/7']);
    expect(typedAcceptedForWord('w/o')).toEqual(['w/o']);
    // the headword exactly as the verdict shows it is always right, and a typed form is graded by the server
    for (const word of ['rely on sb/sth', 'in charge (of)', '(be) responsible for', 'make (a) decision', 'look after (sb)']) {
      const words = SAMPLE_WORDS.map((w, i) => (i === 0 ? { ...w, word } : w));
      const s = buildGameSession({ gameKey: 'word_tunnel', difficulty: 'hard', words, rand: seededRandom(`ph-${word}`) });
      const q = s.questions.find((x) => x.wordId === words[0].wordId)!;
      expect(q).toBeDefined();
      expect(validateAnswer(q, word).isCorrect).toBe(true);
      expect(validateAnswer(q, typedAcceptedForWord(word)[0]).isCorrect).toBe(true);
    }
    const rq = buildGameSession({ gameKey: 'word_defense', difficulty: 'easy', words: SAMPLE_WORDS.map((w, i) => (i === 0 ? { ...w, word: 'rely on sb/sth' } : w)), rand: seededRandom('rely') }).questions.find((x) => x.wordId === SAMPLE_WORDS[0].wordId)!;
    expect(validateAnswer(rq, 'rely on').isCorrect).toBe(true);
    expect(validateAnswer(rq, 'rely on sth').isCorrect).toBe(true);
    expect(validateAnswer(rq, 'sth').isCorrect).toBe(false);
    expect(toClientQuestion(rq)).toMatchObject({ answerLength: 'rely on'.length });
  });

  it('asks one question per answer: duplicated headwords (two decks, "to x" / "x") are asked once', () => {
    const dupes = [
      ...SAMPLE_WORDS,
      { ...SAMPLE_WORDS[0], wordId: 'dup-a', categoryId: 'deck-b', translations: ['boshqa tarjima'] },
      { ...SAMPLE_WORDS[1], wordId: 'dup-b', word: `to ${SAMPLE_WORDS[1].word}` },
    ];
    for (const key of TYPED_KEYS) {
      for (const seed of ['d1', 'd2', 'd3']) {
        const s = buildGameSession({ gameKey: key, difficulty: 'expert', words: dupes, rand: seededRandom(`${key}-${seed}`) });
        const firstForms = s.questions.map((q) => typedAcceptedForWord(q.correctDisplay));
        for (let i = 0; i < firstForms.length; i++) for (let j = i + 1; j < firstForms.length; j++) expect(firstForms[i].some((f) => firstForms[j].includes(f))).toBe(false);
      }
    }
  });

  it('skips idioms and long phrases instead of asking them as typed recall', () => {
    const words = SAMPLE_WORDS.map((w, i) => (i === 0 ? { ...w, pos: 'idiom' } : i === 1 ? { ...w, word: 'bite off more than you can chew' } : w));
    const s = buildGameSession({ gameKey: 'word_tunnel', difficulty: 'easy', words, rand: seededRandom('idiom') });
    expect(s.questions.map((q) => q.wordId)).not.toContain(words[0].wordId);
    expect(s.questions.map((q) => q.wordId)).not.toContain(words[1].wordId);
  });

  it('skips a word whose typed form does not fit the 40-character answer input', () => {
    // 3 words, so the word count allows it, but 45 characters cannot be typed into the input
    // (TypingInput's maxLength, flagship/typing.js TYPED_MAX). A form that fits is still asked.
    const tooLong = 'internationalisation counterrevolutionaries x';
    const fits = 'internationalisation counterrevolution';
    expect(tooLong.length).toBeGreaterThan(40);
    expect(fits.length).toBeLessThanOrEqual(40);
    for (const [word, asked] of [
      [tooLong, false],
      [fits, true],
    ] as const) {
      const words = SAMPLE_WORDS.map((w, i) => (i === 0 ? { ...w, word, pos: 'noun' } : w));
      for (const seed of ['a', 'b', 'c']) {
        const s = buildGameSession({ gameKey: 'word_tunnel', difficulty: 'easy', words, rand: seededRandom(`fit-${seed}`) });
        if (!asked) expect(s.questions.map((q) => q.wordId)).not.toContain(words[0].wordId);
        else if (s.questions.some((q) => q.wordId === words[0].wordId)) return; // asked at least once: enough
      }
      if (asked) throw new Error('a 40-character typed form should still be asked');
    }
  });

  it('a small deck gives a short round instead of repeating words', () => {
    const words = SAMPLE_WORDS.slice(0, 6);
    const s = buildGameSession({ gameKey: 'word_defense', difficulty: 'expert', words, rand: seededRandom('small') });
    expect(s.questions.length).toBeLessThanOrEqual(6);
    expect(new Set(s.questions.map((q) => q.wordId)).size).toBe(s.questions.length);
  });

  /** SAMPLE_WORDS with the first headword replaced; the question asked for it in one round. */
  const withWord = (word: string): GameWord[] => SAMPLE_WORDS.map((w, i) => (i === 0 ? { ...w, word } : w));
  const questionFor = (key: GameKey, difficulty: Difficulty, words: GameWord[], seed: string) =>
    buildGameSession({ gameKey: key, difficulty, words, rand: seededRandom(seed) }).questions.find((x) => x.wordId === words[0].wordId);

  it('grades both spellings of an optional letter right and hints the bracket-free one', () => {
    for (const [word, short, long] of [
      ['colo(u)r', 'color', 'colour'],
      ['behavio(u)r', 'behavior', 'behaviour'],
      ['judg(e)ment', 'judgment', 'judgement'],
      ['travel(l)er', 'traveler', 'traveller'],
      ['(un)able', 'able', 'unable'],
    ]) {
      const q = questionFor('word_tunnel', 'easy', withWord(word), `opt-${word}`)!;
      expect(q, word).toBeDefined();
      for (const typed of [short, long, word]) expect(validateAnswer(q, typed), typed).toEqual({ isCorrect: true });
      expect(validateAnswer(q, `${short}x`).isCorrect).toBe(false);
      const c = toClientQuestion(q);
      expect(c.answerLength).toBe(short.length);
      expect(String(c.hint).charAt(0)).toBe(short.charAt(0));
    }
    // a [label] is not typed: "ascertain [formal]" is answered "ascertain"
    const label = questionFor('word_defense', 'medium', withWord('ascertain [formal]'), 'label')!;
    expect(validateAnswer(label, 'ascertain').isCorrect).toBe(true);
    expect(validateAnswer(label, 'ascertain [formal]').isCorrect).toBe(true);
    expect(toClientQuestion(label).answerLength).toBe('ascertain'.length);
  });

  it('counts the words a player types: an optional letter is not a word of its own', () => {
    // 4 tokens as written, but "labor force survey" is 3 typed words, so it is asked
    const q = questionFor('word_tunnel', 'easy', withWord('labo(u)r force survey'), 'typed-words')!;
    expect(q).toBeDefined();
    expect(validateAnswer(q, 'labour force survey').isCorrect).toBe(true);
    expect(toClientQuestion(q).answerLength).toBe('labor force survey'.length);
  });

  it('grades each phrase of a multi-word slash alternative right, never a lone word of it', () => {
    for (const [word, a, b] of [
      ['deal with/cope with', 'deal with', 'cope with'],
      ['kind of/sort of', 'kind of', 'sort of'],
      ['get up/wake up', 'get up', 'wake up'],
      ['look for/search for', 'look for', 'search for'],
    ]) {
      const q = questionFor('word_defense', 'medium', withWord(word), `alt-${word}`)!;
      expect(validateAnswer(q, a).isCorrect, a).toBe(true);
      expect(validateAnswer(q, b).isCorrect, b).toBe(true);
      expect(toClientQuestion(q).answerLength).toBe(a.length);
    }
    const look = questionFor('word_tunnel', 'medium', withWord('look after/for'), 'alt-look')!;
    expect(validateAnswer(look, 'look after').isCorrect).toBe(true);
    expect(validateAnswer(look, 'look for').isCorrect).toBe(true);
    expect(validateAnswer(look, 'for').isCorrect).toBe(false);
  });

  it('grades a mid-phrase word alternative and a word bracket by the whole word, never a fragment', () => {
    // [headword, right answers, fragments that stay wrong, primary form (answerLength)]
    const cases: Array<[string, string[], string[], string]> = [
      ['get on/along with', ['get on with', 'get along with'], ['get on', 'along with'], 'get on with'],
      ['a great/good deal', ['a great deal', 'a good deal'], ['a great', 'good deal'], 'a great deal'],
      ['take part/place in', ['take part in', 'take place in'], ['take part', 'place in'], 'take part in'],
      ['put someone/something off', ['put someone off', 'put something off'], ['put someone', 'something off'], 'put someone off'],
      ['organi(s/z)e', ['organise', 'organize'], ['ze', 'organie', 'organis'], 'organise'],
      ['some(one/thing)', ['someone', 'something'], ['some', 'thing'], 'someone'],
      ['look after(sb)', ['look after', 'look after sb'], ['look aftersb'], 'look after'],
      ['interested(in)', ['interested', 'interested in'], [], 'interested'],
      ['make(a) decision', ['make decision', 'make a decision'], [], 'make decision'],
    ];
    for (const [word, right, wrong, primary] of cases) {
      const q = questionFor('word_defense', 'medium', withWord(word), `frag-${word}`)!;
      expect(q, word).toBeDefined();
      for (const typed of right) expect(validateAnswer(q, typed).isCorrect, `${word}: ${typed}`).toBe(true);
      for (const typed of wrong) expect(validateAnswer(q, typed).isCorrect, `${word}: ${typed}`).toBe(false);
      expect(toClientQuestion(q).answerLength, word).toBe(primary.length);
    }
    // typed out in full these are 4 words, so they stay out of the typing games (as before)
    for (const word of ['in the long/short term', 'take someone/something for granted', 'at the end/beginning of', "make up one's/your mind"]) {
      expect(questionFor('word_tunnel', 'easy', withWord(word), `long-${word}`), word).toBeUndefined();
    }
  });

  it('a mid-phrase word alternative does not block a card for one of its fragments', () => {
    const deck: GameWord[] = [
      { wordId: 'g1', categoryId: 'c1', word: 'get on/along with', translations: ['chiqishmoq'] },
      { wordId: 'g2', categoryId: 'c1', word: 'get on', translations: ['muvaffaqiyat qozonmoq'] },
      ...SAMPLE_WORDS,
    ];
    for (const key of TYPED_KEYS) {
      const ids = buildGameSession({ gameKey: key, difficulty: 'medium', words: deck, rand: seededRandom(`frag-overlap-${key}`) }).questions.map((q) => q.wordId);
      expect(ids).toEqual(expect.arrayContaining(['g1', 'g2']));
    }
  });

  it('one question per answer also across optional letters and phrase alternatives', () => {
    const words: GameWord[] = [
      ...SAMPLE_WORDS,
      { ...SAMPLE_WORDS[2], wordId: 'o1', word: 'colo(u)r', translations: ['rang'] },
      { ...SAMPLE_WORDS[3], wordId: 'o2', word: 'colour', translations: ['tus'] },
      { ...SAMPLE_WORDS[4], wordId: 'o3', word: 'deal with/cope with', translations: ['bardosh bermoq'] },
      { ...SAMPLE_WORDS[5], wordId: 'o4', word: 'cope with', translations: ['uddalamoq'] },
    ];
    for (const key of TYPED_KEYS) {
      const ids = buildGameSession({ gameKey: key, difficulty: 'expert', words, rand: seededRandom(`overlap-${key}`) }).questions.map((q) => q.wordId);
      expect(ids.filter((id) => id === 'o1' || id === 'o2')).toHaveLength(1);
      expect(ids.filter((id) => id === 'o3' || id === 'o4')).toHaveLength(1);
    }
  });

  it('skips a huge bracketed headword without parsing it, so starting a round stays fast', () => {
    const words = SAMPLE_WORDS.slice(0, 5).map((w, i) => (i === 0 ? { ...w, word: 'a('.repeat(51_200) } : w)); // 100 KB
    for (const key of TYPED_KEYS) {
      const t0 = performance.now();
      const s = buildGameSession({ gameKey: key, difficulty: 'expert', words, rand: seededRandom(`huge-${key}`) });
      expect(performance.now() - t0).toBeLessThan(250);
      expect(s.questions).toHaveLength(4);
      expect(s.questions.map((q) => q.wordId)).not.toContain(words[0].wordId);
    }
  });

  it("a definition never shows another question's answer, and the client gets the stored prompt", () => {
    // "scarce" is defined as "not available in large quantities"; Defense shows every live prompt at once.
    const deck: GameWord[] = [...SAMPLE_WORDS, { wordId: 'w-av', categoryId: 'c1', word: 'available', translations: ['mavjud'] }];
    let definitions = 0;
    let scarce = 0;
    for (const key of TYPED_KEYS) {
      for (const d of ['hard', 'expert'] as const) {
        for (let seed = 0; seed < 50; seed++) {
          const s = buildGameSession({ gameKey: key, difficulty: d, words: deck, rand: seededRandom(`leak-${key}-${d}-${seed}`) });
          expect(s.questions.map((q) => q.qid)).toEqual(s.questions.map((_, i) => `q${i + 1}`));
          for (const q of s.questions) {
            // the server's plausibility floor counts the stored prompt; the client counts the one it gets
            const client = toClientQuestion(q);
            expect(client.prompt).toBe(q.prompt);
            expect(typedFloorMs(client.prompt)).toBe(minPlausibleMs({ inputType: q.inputType, promptLength: q.prompt.length, units: 1 }));
            if (q.kind !== 'type_definition') continue;
            definitions += 1;
            if (q.wordId === 'w7') {
              scarce += 1;
              expect(q.prompt).toBe('not _____ in large quantities');
            }
            const prompt = normalizeForCompare(q.prompt);
            for (const other of s.questions) {
              if (other === q) continue;
              for (const a of other.accepted!) expect(prompt, `${q.qid} shows "${a}"`).not.toMatch(new RegExp(`\\b${escape(a)}\\b`));
            }
          }
        }
      }
    }
    expect(definitions).toBeGreaterThan(100);
    expect(scarce).toBeGreaterThan(10);
  });

  it('masks an answer written with another apostrophe than the definition uses', () => {
    // AI-written definitions often have a curly apostrophe, headwords a straight one (or the other way
    // round). The literals below use U+2019 (’) and, in the o'clock definition, U+02BC (ʼ).
    for (const [clock, noonDefinition] of [
      ["o'clock", 'twelve o’clock in the middle of the day'],
      ['o’clock', "twelve o'clock in the middle of the day"],
    ]) {
      const deck: GameWord[] = [
        { wordId: 'a1', categoryId: 'c1', word: clock, translations: ['soat'], definitionEn: 'used after a number to say the time: five oʼclock' },
        { wordId: 'a2', categoryId: 'c1', word: 'noon', translations: ['peshin'], definitionEn: noonDefinition },
        ...SAMPLE_WORDS,
      ];
      let own = 0;
      let other = 0;
      for (const key of TYPED_KEYS) {
        for (let seed = 0; seed < 30; seed++) {
          const s = buildGameSession({ gameKey: key, difficulty: 'expert', words: deck, rand: seededRandom(`apos-${key}-${seed}`) });
          const clockAsked = s.questions.some((q) => q.wordId === 'a1');
          for (const q of s.questions) {
            expect(toClientQuestion(q).prompt).toBe(q.prompt);
            if (q.kind !== 'type_definition' || (q.wordId === 'a2' && !clockAsked)) continue;
            if (q.wordId === 'a1') own += 1;
            if (q.wordId === 'a2') other += 1;
            expect(normalizeForCompare(q.prompt), `${clock}: ${q.prompt}`).not.toMatch(/\boclock/);
          }
        }
      }
      expect(own).toBeGreaterThan(5);
      expect(other).toBeGreaterThan(5);
    }
  });

  it('a definition masked (almost) blank falls back to the meaning, or the word is not asked', () => {
    const deck: GameWord[] = [
      // the definition is only other answers: asked by its meaning instead
      { wordId: 'w-keep', categoryId: 'c1', word: 'keep up', translations: ['davom ettirmoq'], definitionEn: 'maintain; generate' },
      // nothing is left and there is no meaning to ask instead: not asked
      { wordId: 'w-bare', categoryId: 'c1', word: 'carry on', translations: [], definitionEn: 'to maintain and generate' },
      ...SAMPLE_WORDS,
    ];
    for (const key of TYPED_KEYS) {
      for (const d of DIFFICULTIES) {
        for (const seed of ['f1', 'f2', 'f3', 'f4']) {
          const s = buildGameSession({ gameKey: key, difficulty: d, words: deck, rand: seededRandom(`${seed}-${key}-${d}`) });
          expect(s.questions.find((q) => q.wordId === 'w-keep')).toMatchObject({ kind: 'spell_drop', prompt: 'davom ettirmoq' });
          expect(s.questions.find((q) => q.wordId === 'w-bare')).toBeUndefined();
          expect(s.questions.map((q) => q.qid)).toEqual(s.questions.map((_, i) => `q${i + 1}`));
        }
      }
    }
  });
});
