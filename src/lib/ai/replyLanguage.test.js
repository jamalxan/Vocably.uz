import { describe, it, expect } from 'vitest';
import { chooseReplyLanguage, detectMessageLanguage, explicitLanguageRequest } from './replyLanguage';

describe('detectMessageLanguage', () => {
  it.each([
    ["resilient so'zining ma'nosi nima?", 'uz'],
    ['Present perfect qachon ishlatiladi, tushuntirib bering', 'uz'],
    ['salom, menga yordam bering', 'uz'],
    ['бу сўз нимани англатади', 'uz'],
    ['What does "resilient" mean?', 'en'],
    ['Can you explain the difference between affect and effect?', 'en'],
  ])('%s -> %s', (text, lang) => {
    expect(detectMessageLanguage(text)).toBe(lang);
  });

  it('a single English word is ambiguous', () => {
    expect(detectMessageLanguage('resilient')).toBeNull();
  });
});

describe('explicitLanguageRequest', () => {
  it.each([
    ["o'zbekcha gapir", 'uz'],
    ['ozbekcha yoz iltimos', 'uz'],
    ['o‘zbek tilida tushuntir', 'uz'],
    ['please answer in Uzbek', 'uz'],
    ['inglizcha gapir', 'en'],
    ['reply in English please', 'en'],
    ['what is a noun', null],
  ])('%s -> %s', (text, lang) => {
    expect(explicitLanguageRequest(text)).toBe(lang);
  });
});

describe('chooseReplyLanguage', () => {
  it('defaults to English', () => {
    expect(chooseReplyLanguage('resilient')).toBe('en');
    expect(chooseReplyLanguage('How do I use "although"?')).toBe('en');
  });

  it('answers in Uzbek when the user writes in Uzbek', () => {
    expect(chooseReplyLanguage("although so'zini qanday ishlatamiz?")).toBe('uz');
  });

  it('an explicit Uzbek request sticks for later ambiguous or English messages', () => {
    const history = ["o'zbekcha gapir"];
    expect(chooseReplyLanguage('resilient', history)).toBe('uz');
    expect(chooseReplyLanguage('What does it mean?', history)).toBe('uz');
  });

  it('asking for English again switches back', () => {
    expect(chooseReplyLanguage('inglizcha gapir', ["o'zbekcha gapir"])).toBe('en');
    expect(chooseReplyLanguage('resilient', ["o'zbekcha gapir", 'now in English please'])).toBe('en');
  });

  it('writing in Uzbek after asking for English still gets Uzbek', () => {
    expect(chooseReplyLanguage("bu so'z nimani anglatadi?", ['reply in English please'])).toBe('uz');
  });

  it('an ambiguous message keeps the language of the last clear message', () => {
    expect(chooseReplyLanguage('resilient', ["salom, menga so'z tarjima qilib bering"])).toBe('uz');
    expect(chooseReplyLanguage('resilient', ['Can you translate words for me?'])).toBe('en');
  });
});
