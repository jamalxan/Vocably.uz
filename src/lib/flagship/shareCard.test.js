import { describe, it, expect } from 'vitest';
import { cardModel, drawCard, CARD_W } from './shareCard';

const run = { score: 2340, correct: 18, accuracy: 86, maxCombo: 9, seconds: 90 };
const speak = { seconds: 60, survived: true, stopped: false, pauses: 2, longestPauseSec: 2.4, asr: true, fillers: { total: 3 }, wpm: 112, pausesList: [{ startMs: 12_000, endMs: 14_400 }, { startMs: 40_000, endMs: 41_200 }] };

/** Minimal 2D context: records text draws; measureText ≈ 0.6em per char. */
function fakeCtx() {
  const texts = [];
  let size = 10;
  const noop = () => {};
  const grad = { addColorStop: noop };
  return {
    texts,
    set font(f) {
      size = Number(/(\d+)px/.exec(f)[1]);
    },
    get font() {
      return `${size}px`;
    },
    measureText: (t) => ({ width: String(t).length * size * 0.6 }),
    fillText: (t, x) => texts.push({ t, x, w: String(t).length * size * 0.6 }),
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    fillRect: noop, beginPath: noop, roundRect: noop, fill: noop, moveTo: noop, lineTo: noop, stroke: noop,
    save: noop, restore: noop, drawImage: noop, arc: noop,
  };
}

describe('share card', () => {
  it('builds the Run card in both languages', () => {
    const uz = cardModel('run', run, 'uz');
    expect(uz).toMatchObject({ title: 'Vocably Run', big: '2340', unit: 'ball', url: 'vocably.uz/games/run', fileName: 'vocably-run-2340.png', badge: null, pauses: null });
    expect(uz.stats).toEqual([["To'g'ri", '18'], ['Aniqlik', '86%'], ['Kombo', '×9'], ['Soniya', '90']]);
    expect(cardModel('run', run, 'en').unit).toBe('points');
    expect(cardModel('run', run, 'xx').unit).toBe('ball'); // unknown locale → Uzbek
  });

  it('builds the Speak card with a badge and the pause strip', () => {
    const m = cardModel('speak', speak, 'en');
    expect(m).toMatchObject({ title: 'Speak or Fall', big: '60', badge: 'Made it!', url: 'vocably.uz/games/speak' });
    expect(m.pauses).toEqual([[0.2, 0.24], [40_000 / 60_000, 41_200 / 60_000]]);
    expect(cardModel('speak', { ...speak, survived: false, stopped: false }, 'uz').badge).toBe('Yiqildim');
    expect(cardModel('speak', { ...speak, survived: false, stopped: true }, 'uz').badge).toBe("To'xtatdim");
    // without a transcript, filler/wpm are unknown — not zero
    expect(cardModel('speak', { ...speak, asr: false }, 'en').stats.slice(2).map((s) => s[1])).toEqual(['—', '—']);
  });

  it('builds the Tunnel card', () => {
    const r = { score: 1880, correct: 11, accuracy: 79, maxCombo: 6, cpm: 142 };
    const uz = cardModel('tunnel', r, 'uz');
    expect(uz).toMatchObject({ title: "So'z tunneli", big: '1880', unit: 'ball', url: 'vocably.uz/games/tunnel', fileName: 'vocably-tunnel-1880.png', badge: null, badgeGood: false, pauses: null });
    expect(uz.stats).toEqual([["To'g'ri", '11'], ['Aniqlik', '79%'], ['Kombo', '×6'], ['Harf/daq', '142']]);
    expect(cardModel('tunnel', r, 'en').title).toBe('Word Tunnel');
    // a missing field reads as zero, never "undefined"
    expect(cardModel('tunnel', { score: 5 }, 'en').stats.map((s) => s[1])).toEqual(['0', '0%', '×0', '0']);
  });

  it('builds the Defense card with a base-held or base-fell badge', () => {
    const r = { score: 3120, kills: 17, accuracy: 85, maxCombo: 8, hp: 2 };
    const en = cardModel('defense', r, 'en');
    expect(en).toMatchObject({ title: 'Word Defense', big: '3120', badge: 'Base held', badgeGood: true, url: 'vocably.uz/games/defense', fileName: 'vocably-defense-3120.png' });
    expect(en.stats).toEqual([['Destroyed', '17'], ['Accuracy', '85%'], ['Combo', '×8'], ['HP left', '2']]);
    expect(cardModel('defense', { ...r, hp: 0 }, 'uz')).toMatchObject({ badge: 'Baza quladi', badgeGood: false });
    // ended by the player (or an expired session): neither held nor fell
    expect(cardModel('defense', { ...r, why: 'stopped' }, 'en')).toMatchObject({ badge: 'Stopped', badgeGood: false });
    expect(cardModel('defense', { ...r, hp: 0, why: 'expired' }, 'uz')).toMatchObject({ badge: "To'xtatdim", badgeGood: false });
    expect(cardModel('defense', { ...r, why: 'time' }, 'en')).toMatchObject({ badge: 'Base held' });
    expect(cardModel('speak', speak, 'en').badgeGood).toBe(true);
    expect(cardModel('speak', { ...speak, survived: false }, 'en').badgeGood).toBe(false);
  });

  it('rejects an unknown game', () => {
    expect(() => cardModel('chess', {}, 'uz')).toThrow();
    expect(() => cardModel('toString', {}, 'uz')).toThrow(); // no prototype keys
  });

  it('draws every text inside the card, even with huge numbers', () => {
    const models = [
      cardModel('run', { ...run, score: 123456789012 }, 'uz'),
      cardModel('speak', speak, 'uz'),
      cardModel('tunnel', { score: 987654321098, correct: 15, accuracy: 100, maxCombo: 15, cpm: 999 }, 'uz'),
      cardModel('defense', { score: 4, kills: 0, accuracy: 0, maxCombo: 0, hp: 0 }, 'uz'),
    ];
    for (const model of models) {
      const ctx = fakeCtx();
      drawCard(ctx, model);
      expect(ctx.texts.map((x) => x.t)).toEqual(expect.arrayContaining([model.big, model.cta, model.url]));
      for (const x of ctx.texts) expect(x.x + x.w).toBeLessThanOrEqual(CARD_W);
    }
  });
});
