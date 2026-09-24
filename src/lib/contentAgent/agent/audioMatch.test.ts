import { describe, it, expect } from 'vitest';
import { answerHitRate, rareWordOverlap, scoreTranscriptAgainstPart, rankCandidates, decideAudioAttachment, MATCH_STRONG, MATCH_WEAK } from './audioMatch';

const TRANSCRIPT =
  'Good morning, Sunshine Hotel reception. I would like to book a double room for three nights starting on the fifteenth of June. The total price is 240 pounds and breakfast is included. My surname is Patterson, that is P-A-T-T-E-R-S-O-N.';

function candidate(overrides = {}) {
  return {
    testId: 't1',
    testTitle: 'Cambridge 19 — Test 1',
    partOrder: 1,
    hasAudio: false,
    answers: [
      { number: 1, accepted: ['double room'] },
      { number: 2, accepted: ['three nights'] },
      { number: 3, accepted: ['240 pounds'] },
      { number: 4, accepted: ['Patterson'] },
    ],
    questionText: 'Complete the booking form: room type, number of nights, total price, surname',
    ...overrides,
  };
}

describe('answerHitRate', () => {
  it('audioda aytilgan javoblarni topadi', () => {
    const { hits, total, rate } = answerHitRate(TRANSCRIPT, candidate().answers);
    expect(total).toBe(4);
    expect(hits).toBe(4);
    expect(rate).toBe(1);
  });

  it('mos kelmaydigan javob kaliti uchun 0 beradi', () => {
    const { rate } = answerHitRate(TRANSCRIPT, [{ number: 1, accepted: ['library card'] }, { number: 2, accepted: ['engineering'] }]);
    expect(rate).toBe(0);
  });

  it("TRUE/FALSE kabi 'javob harflari' hisobga olinmaydi", () => {
    const { total } = answerHitRate(TRANSCRIPT, [{ number: 1, accepted: ['TRUE'] }, { number: 2, accepted: ['double room'] }]);
    // TRUE audioda uchramasligi normal — u hisobdan chiqadi, aks holda
    // moslik foizi asossiz pasayardi.
    expect(total).toBe(2);
    const { hits } = answerHitRate(TRANSCRIPT, [{ number: 1, accepted: ['TRUE'] }, { number: 2, accepted: ['double room'] }]);
    expect(hits).toBe(1);
  });

  it("bo'sh transkript uchun 0", () => {
    expect(answerHitRate('', candidate().answers).rate).toBe(0);
  });
});

describe('rareWordOverlap', () => {
  it("bir xil matn uchun yuqori, boshqa matn uchun past", () => {
    expect(rareWordOverlap(TRANSCRIPT, TRANSCRIPT)).toBe(1);
    expect(rareWordOverlap(TRANSCRIPT, 'The lecture today is about volcanic activity in Iceland.')).toBeLessThan(0.2);
  });
});

describe('scoreTranscriptAgainstPart', () => {
  it("to'g'ri part uchun MATCH_STRONG dan yuqori ball beradi", () => {
    const score = scoreTranscriptAgainstPart(TRANSCRIPT, candidate());
    expect(score.score).toBeGreaterThanOrEqual(MATCH_STRONG);
    expect(score.answerHits).toBe(4);
  });

  it("umuman boshqa part uchun MATCH_WEAK dan past ball beradi", () => {
    const wrong = candidate({
      answers: [{ number: 1, accepted: ['volcanic ash'] }, { number: 2, accepted: ['geology department'] }],
      questionText: 'Lecture about volcanoes in Iceland, geology department seminar',
    });
    expect(scoreTranscriptAgainstPart(TRANSCRIPT, wrong).score).toBeLessThan(MATCH_WEAK);
  });

  it('audioscript mavjud bo\'lsa undan ham dalil oladi', () => {
    const withScript = candidate({ transcript: TRANSCRIPT, answers: [] });
    expect(scoreTranscriptAgainstPart(TRANSCRIPT, withScript).transcriptOverlap).toBe(1);
  });
});

describe('rankCandidates', () => {
  it("eng mos nomzodni birinchi qo'yadi", () => {
    const wrong = candidate({
      testId: 't2',
      partOrder: 3,
      answers: [{ number: 1, accepted: ['volcanic ash'] }],
      questionText: 'volcano lecture',
    });
    const ranked = rankCandidates(TRANSCRIPT, [wrong, candidate()]);
    expect(ranked[0].testId).toBe('t1');
    expect(ranked[0].partOrder).toBe(1);
  });
});

describe('decideAudioAttachment', () => {
  const strong = { testId: 't1', partOrder: 1, testTitle: 'T', score: 0.9, answerHits: 9, answerTotal: 10, transcriptOverlap: 0.8 };
  const weak = { testId: 't1', partOrder: 1, testTitle: 'T', score: 0.05, answerHits: 0, answerTotal: 10, transcriptOverlap: 0 };
  const middling = { testId: 't1', partOrder: 1, testTitle: 'T', score: 0.35, answerHits: 4, answerTotal: 10, transcriptOverlap: 0.2 };

  it("transkript yo'q bo'lsa biriktiradi, lekin tekshirilmaganini AYTADI", () => {
    const d = decideAudioAttachment({ hasTranscript: false, evidence: null, ai: null, candidateHasReference: true });
    expect(d.allow).toBe(true);
    expect(d.verified).toBe(false);
    expect(d.note).toContain('tekshirib');
  });

  it("solishtirish uchun manba (javob kaliti/audioscript) bo'lmasa — biriktiradi, lekin ochiq aytadi", () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: weak, ai: null, candidateHasReference: false });
    expect(d.allow).toBe(true);
    expect(d.verified).toBe(false);
  });

  it('kuchli dalil bo\'lsa biriktiradi', () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: strong, ai: { matches: true }, candidateHasReference: true });
    expect(d.allow).toBe(true);
    expect(d.verified).toBe(true);
    expect(d.note).toContain('tasdiqlandi');
  });

  it("kuchli dalil AI shubhasidan ustun turadi, lekin kelishmovchilik aytiladi", () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: strong, ai: { matches: false, reason: 'Mavzu boshqa' }, candidateHasReference: true });
    expect(d.allow).toBe(true);
    expect(d.note).toContain('AI shubha');
  });

  it("AI 'yo'q' desa va dalil kuchsiz bo'lsa — BIRIKTIRMAYDI", () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: middling, ai: { matches: false, reason: 'Boshqa mavzu' }, candidateHasReference: true });
    expect(d.allow).toBe(false);
    expect(d.note).toContain('Mos kelmadi');
  });

  it('dalil juda kuchsiz bo\'lsa AI jim bo\'lsa ham biriktirmaydi', () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: weak, ai: null, candidateHasReference: true });
    expect(d.allow).toBe(false);
  });

  it("o'rtacha dalil + AI tasdig'i bilan biriktiradi (qisman)", () => {
    const d = decideAudioAttachment({ hasTranscript: true, evidence: middling, ai: { matches: true }, candidateHasReference: true });
    expect(d.allow).toBe(true);
    expect(d.note).toContain('qisman');
  });
});
