import { describe, expect, it } from 'vitest';
import {
  canTransition,
  csvToInputs,
  entriesToCsv,
  normalizeEntry,
  parseCsv,
  publishProblems,
  toUserWord,
} from './library';

describe('normalizeEntry', () => {
  it('tozalaydi va standart qiymatlar beradi', () => {
    const { entry, errors } = normalizeEntry({ word: '  Significant ', cefr: 'b2', pos: 'Adjective', translationUz: 'muhim', topicTags: ['Science', 'science'] });
    expect(errors).toEqual([]);
    expect(entry.word).toBe('Significant');
    expect(entry.normalizedWord).toBe('significant');
    expect(entry.cefr).toBe('B2');
    expect(entry.pos).toBe('adjective');
    expect(entry.lemma).toBe('Significant');
    expect(entry.topicTags).toEqual(['science']);
  });

  it("noto'g'ri qiymatlarni xato sifatida qaytaradi", () => {
    const { errors } = normalizeEntry({ word: '', cefr: 'Z9', pos: 'blah', ieltsRelevance: 7 });
    expect(errors.length).toBe(4);
  });

  it("xavfli URL'larni (javascript:) rad etadi", () => {
    const { entry } = normalizeEntry({ word: 'x', imageUrl: 'javascript:alert(1)', audioUk: '/audio/x.mp3' });
    expect(entry.imageUrl).toBe('');
    expect(entry.audioUk).toBe('/audio/x.mp3');
  });
});

describe('normalizeEntry — exercises', () => {
  const gap = { type: 'fill_gap', prompt: 'We must _____ the risk.', answer: 'mitigate', explanationUz: 'Mos.' };
  it('yaroqli mashqni saqlaydi; holat noma‘lum bo‘lsa AI_GENERATED', () => {
    const { entry } = normalizeEntry({ word: 'mitigate', exercises: [gap as any, { ...gap, status: 'APPROVED' } as any, { ...gap, status: 'hack' } as any] });
    expect(entry.exercises.map((e) => e.status)).toEqual(['AI_GENERATED', 'APPROVED', 'AI_GENERATED']);
  });
  it('yaroqsizlarini tashlaydi: "_____"siz gap, 4 variantsiz MC, noma‘lum tur, izohsiz', () => {
    const { entry } = normalizeEntry({
      word: 'x',
      exercises: [
        { ...gap, prompt: 'no blank' },
        { type: 'multiple_choice', prompt: 'q', answer: 'a', options: ['a', 'b'], explanationUz: 'e' },
        { ...gap, type: 'riddle' },
        { ...gap, explanationUz: '' },
        gap,
      ] as any,
    });
    expect(entry.exercises).toHaveLength(1);
  });
  it('12 tadan ko‘pini kesadi; mashqsiz yozuvda bo‘sh ro‘yxat', () => {
    expect(normalizeEntry({ word: 'x', exercises: Array(20).fill(gap) as any }).entry.exercises).toHaveLength(12);
    expect(normalizeEntry({ word: 'x' }).entry.exercises).toEqual([]);
  });
});

describe('publishProblems', () => {
  const base = { word: 'a', translationUz: 'b', shortDefinition: 'c', examples: [{ en: 'x' }], cefr: 'B1' };
  it('to‘liq yozuv muammosiz', () => expect(publishProblems(base)).toEqual([]));
  it('AI kontent tasdiqlanmaguncha nashr qilinmaydi (TZ §4.3)', () => {
    expect(publishProblems(base, { aiGenerated: true, verifiedByAdmin: false })).toHaveLength(1);
    expect(publishProblems(base, { aiGenerated: true, verifiedByAdmin: true })).toEqual([]);
  });
  it('yetishmayotgan maydonlarni sanaydi', () => {
    expect(publishProblems({ word: 'a', translationUz: '', shortDefinition: '', examples: [], cefr: '' }).length).toBe(4);
  });
});

describe('status machine', () => {
  it('ruxsat etilgan va taqiqlangan o‘tishlar', () => {
    expect(canTransition('AI_GENERATED', 'UNDER_REVIEW')).toBe(true);
    expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true);
    expect(canTransition('AI_GENERATED', 'PUBLISHED')).toBe(false); // review'siz nashr yo'q
    expect(canTransition('DRAFT', 'PUBLISHED')).toBe(false);
    expect(canTransition('PUBLISHED', 'DRAFT')).toBe(false);
  });
});

describe('CSV', () => {
  it('qo‘shtirnoq, vergul va yangi qatorlarni to‘g‘ri o‘qiydi', () => {
    const rows = parseCsv('﻿a,b\r\n"x,1","he said ""hi"""\n"multi\nline",z\n');
    expect(rows).toEqual([['a', 'b'], ['x,1', 'he said "hi"'], ['multi\nline', 'z']]);
  });

  it('csvToInputs: ustunlar, ro‘yxatlar va misollar', () => {
    const csv = 'word,cefr,translationUz,synonyms,examples,unknown\nabandon,B2,tark etmoq,leave;desert,"He abandoned it.|U tashladi.;Another one.",zzz\n';
    const { rows, errors } = csvToInputs(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].line).toBe(2);
    expect(rows[0].input.synonyms).toEqual(['leave', 'desert']);
    expect(rows[0].input.examples).toEqual([{ en: 'He abandoned it.', uz: 'U tashladi.' }, { en: 'Another one.', uz: '' }]);
    expect((rows[0].input as any).unknown).toBeUndefined();
  });

  it("'word' ustunisiz CSV rad etiladi", () => {
    expect(csvToInputs('a,b\n1,2').errors).toHaveLength(1);
  });

  it('export -> import aylanishi ma’lumotni saqlaydi va CSV-injection’ni zararsizlantiradi', () => {
    const { entry } = normalizeEntry({ word: 'maintain', cefr: 'B1', translationUz: 'saqlamoq', shortDefinition: 'to keep, with "quotes"', examples: [{ en: 'Maintain it.', uz: 'Saqla.' }], synonyms: ['keep', 'preserve'] });
    const csv = entriesToCsv([entry, { ...entry, word: '=cmd()', translationUz: '+1' }]);
    const back = csvToInputs(csv).rows;
    expect(back[0].input.shortDefinition).toBe('to keep, with "quotes"');
    expect(back[0].input.synonyms).toEqual(['keep', 'preserve']);
    expect(back[0].input.examples).toEqual([{ en: 'Maintain it.', uz: 'Saqla.' }]);
    expect(back[1].input.word).toBe("'=cmd()");
  });
});

describe('toUserWord', () => {
  it('WordSchema shakliga aylantiradi', () => {
    const { entry } = normalizeEntry({ word: 'maintain', pos: 'verb', cefr: 'B1', translationUz: 'saqlamoq; davom ettirmoq', ipaUk: '/meɪnˈteɪn/', synonyms: ['keep'], examples: [{ en: 'x' }] });
    const w = toUserWord(entry);
    expect(w.syns).toEqual(['saqlamoq', 'davom ettirmoq']);
    expect(w.pronunciation).toBe('/meɪnˈteɪn/');
    expect(w.enrichment.pos).toBe('verb');
    expect(w.enrichment.synonymsEn).toEqual(['keep']);
    expect(w.enrichment.cefr).toBe('B1');
  });
});
