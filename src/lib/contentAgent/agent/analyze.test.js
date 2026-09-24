import { describe, it, expect } from 'vitest';
import { splitAudioscriptByPart, splitByHeadings } from './analyze';

// `analyze.js`ning qolgan qismi AI chaqiruvlari (generateJson) — ular shu
// yerda mock qilinmaydi (aiJson.js allaqachon o'z testlariga ega); bu fayl
// faqat SOF, deterministik bo'lakni qoplaydi.
describe('splitAudioscriptByPart', () => {
  const script = `PART 1
You will hear a conversation about hotel booking.

PART 2
Now you will hear a talk about the city museum.

PART 3
A tutorial discussion between two students.

PART 4
A lecture on marine biology.`;

  it("har part uchun alohida transkript qaytaradi", () => {
    const parts = splitAudioscriptByPart(script);
    expect(Object.keys(parts).sort()).toEqual(['1', '2', '3', '4']);
    expect(parts[2]).toContain('city museum');
    expect(parts[2]).not.toContain('marine biology');
  });

  it("SECTION sarlavhasini ham tanadi (eski kitoblarda shunday)", () => {
    const parts = splitAudioscriptByPart('SECTION 1\nHello.\n\nSECTION 2\nGoodbye.');
    expect(parts[1]).toContain('Hello');
    expect(parts[2]).toContain('Goodbye');
  });

  it("bir xil part bir necha marta uchrasa eng uzun bo'lagini oladi (mundarija qatori emas)", () => {
    const withToc = `PART 1 ........ 12\n\nPART 1\nThis is the real, much longer transcript of part one with plenty of words.`;
    expect(splitAudioscriptByPart(withToc)[1]).toContain('real, much longer transcript');
  });

  it("sarlavhasiz matn uchun bo'sh obyekt qaytaradi — noto'g'ri transkript biriktirmaslik uchun", () => {
    expect(splitAudioscriptByPart('Just some text without markers')).toEqual({});
    expect(splitAudioscriptByPart('')).toEqual({});
  });
});

// Bu funksiya HAQIQIY smoke-testda topilgan xato uchun qo'shilgan: bitta
// sahifali (yoki qisqa) hujjatda AI sahifa-xaritasi bo'sh qaytadi va
// avvalgi kodda hech narsa joylashmay qolardi.
describe('splitByHeadings', () => {
  const doc = `Test 1

LISTENING

SECTION 1 Questions 1-4
Complete the form below.

READING PASSAGE 1
The Return of the Urban Bee
Questions 5-8

WRITING TASK 1
The chart below shows...

WRITING TASK 2
Some people believe...

SPEAKING

PART 1
Where do you live?

ANSWER KEY
1 Marsden

AUDIOSCRIPTS
SECTION 1
WOMAN: Good morning.`;

  it("har bo'limni sarlavhasi bo'yicha ajratadi", () => {
    const parts = splitByHeadings(doc);
    expect(parts.listening).toContain('Complete the form');
    expect(parts.reading).toContain('Urban Bee');
    expect(parts.speaking).toContain('Where do you live');
    expect(parts.answerKey).toContain('Marsden');
    expect(parts.audioscript).toContain('Good morning');
  });

  it("bir bo'lim bir necha marta uchrasa bo'laklarni BIRLASHTIRADI (Writing Task 1 + 2)", () => {
    const parts = splitByHeadings(doc);
    expect(parts.writing).toContain('The chart below');
    expect(parts.writing).toContain('Some people believe');
  });

  it("bo'lim matni keyingi sarlavhada tugaydi (aralashib ketmaydi)", () => {
    const parts = splitByHeadings(doc);
    expect(parts.reading).not.toContain('The chart below');
    expect(parts.listening).not.toContain('Urban Bee');
  });

  it("sarlavhasiz matn uchun bo'sh obyekt qaytaradi (AI klassifikatsiyasiga o'tiladi)", () => {
    expect(splitByHeadings('Just a paragraph about bees with no headings at all.')).toEqual({});
    expect(splitByHeadings('')).toEqual({});
  });
});
