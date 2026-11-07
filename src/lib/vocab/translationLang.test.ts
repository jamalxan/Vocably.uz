import { describe, expect, it } from 'vitest';
import { localizeCategories, localizeWord, requestTranslationLang, synsField, wordDocForLang, wordTranslations } from './translationLang';
import { buildPrompt, cleanResults } from './translationFill';
import { termLabel } from '../billingTerms';

const reqWith = (lang?: string) => ({ cookies: { get: (k: string) => (k === 'vocably_lang' && lang ? { value: lang } : undefined) } });

describe('tarjima tili', () => {
  it('cookie: ru -> ru, uz/en/yo‘q -> uz', () => {
    expect(requestTranslationLang(reqWith('ru'))).toBe('ru');
    expect(requestTranslationLang(reqWith('uz'))).toBe('uz');
    expect(requestTranslationLang(reqWith('en'))).toBe('uz');
    expect(requestTranslationLang(reqWith())).toBe('uz');
    expect(requestTranslationLang(undefined)).toBe('uz');
    expect(synsField('ru')).toBe('synsRu');
    expect(synsField('uz')).toBe('syns');
  });

  it('localizeWord: ru bor bo‘lsa ruscha, yo‘q bo‘lsa o‘zbekcha + tlMissing', () => {
    const both = { _id: '1', word: 'apple', syns: ['olma'], synsRu: ['яблоко'] };
    expect(localizeWord(both, 'ru')).toEqual({ _id: '1', word: 'apple', syns: ['яблоко'] });
    expect(localizeWord(both, 'uz')).toEqual({ _id: '1', word: 'apple', syns: ['olma'] });
    expect(localizeWord({ word: 'pear', syns: ['nok'] }, 'ru')).toEqual({ word: 'pear', syns: ['nok'], tlMissing: true });
    // faqat ruscha qo'shilgan so'z uz foydalanuvchida
    expect(localizeWord({ word: 'cat', syns: [], synsRu: ['кот'] }, 'uz')).toEqual({ word: 'cat', syns: ['кот'], tlMissing: true });
    expect(localizeWord({ word: 'dog', syns: [] }, 'uz')).toEqual({ word: 'dog', syns: [] });
  });

  it('localizeCategories mongoose hujjatini ham qabul qiladi va asl obyektni o‘zgartirmaydi', () => {
    const w = { word: 'a', syns: ['x'], synsRu: ['y'] };
    const doc = { toObject: () => ({ name: 'C', words: [w] }) };
    expect(localizeCategories([doc], 'ru')[0].words[0].syns).toEqual(['y']);
    expect(w.synsRu).toEqual(['y']);
  });

  it('wordDocForLang: tarjima foydalanuvchi tilidagi maydonga', () => {
    expect(wordDocForLang({ word: 'a', syns: [' кот ', ''] }, 'ru')).toEqual({ word: 'a', syns: [], synsRu: ['кот'] });
    expect(wordDocForLang({ word: 'a', syns: ['mushuk'] }, 'uz')).toEqual({ word: 'a', syns: ['mushuk'] });
    expect(wordTranslations({ syns: ['a', ''], synsRu: ['б'] }, 'uz')).toEqual(['a']);
  });
});

describe('AI to‘ldirish yordamchilari', () => {
  const items = [
    { id: 'w1', word: 'bank', hint: ['bank', 'qirg‘oq'], hintLang: 'Uzbek (Latin script)' },
    { id: 'w2', word: 'run', hint: [], hintLang: 'Uzbek (Latin script)' },
  ];
  it('prompt id, so‘z va ishora tarjimani o‘z ichiga oladi', () => {
    const p = buildPrompt(items, 'ru');
    expect(p).toContain('into Russian');
    expect(p).toContain('w1 | bank | (Uzbek (Latin script): bank, qirg‘oq)');
    expect(p).toContain('w2 | run\n');
  });
  it('cleanResults: begona id, bo‘sh va takroriy tarjimalar tashlanadi', () => {
    const out = cleanResults(items, [
      { id: 'w1', translations: ['банк', 'банк', ' берег ', ''] },
      { id: 'zz', translations: ['x'] },
      { id: 'w2', translations: [] },
      { id: 'w1', translations: ['дубль'] },
    ]);
    expect(Object.fromEntries(out)).toEqual({ w1: ['банк', 'берег'] });
    expect(cleanResults(items, undefined).size).toBe(0);
  });
});

describe('termLabel ruscha', () => {
  it('ko‘plik shakllari', () => {
    expect(termLabel({ months: 1 }, 'ru')).toBe('1 месяц');
    expect(termLabel({ months: 3 }, 'ru')).toBe('3 месяца');
    expect(termLabel({ months: 12 }, 'ru')).toBe('1 год');
    expect(termLabel({ days: 7 }, 'ru')).toBe('7 дней');
    expect(termLabel({ months: 3 }, 'en')).toBe('3 months');
    expect(termLabel({ months: 3 })).toBe('3 oy');
  });
});
