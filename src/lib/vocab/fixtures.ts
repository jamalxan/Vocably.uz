// Faqat testlar uchun: o'yin generatsiyasini sinash uchun namuna so'zlar.
import type { GameWord } from './games';

const W = (
  i: number,
  word: string,
  translations: string[],
  extra: Partial<GameWord> = {}
): GameWord => ({ wordId: `w${i}`, categoryId: 'c1', word, translations, ...extra });

export const SAMPLE_WORDS: GameWord[] = [
  W(1, 'maintain', ['saqlab qolmoq', "qo'llab-quvvatlamoq"], {
    definitionEn: 'to keep something in good condition',
    examples: [{ en: 'You must maintain a healthy diet every day.', uz: "Har kuni sog'lom ovqatlanishni davom ettirishingiz kerak." }],
    synonymsEn: ['preserve', 'sustain'],
    antonyms: ['neglect'],
  }),
  W(2, 'significant', ['muhim', "sezilarli"], {
    definitionEn: 'important enough to have an effect',
    examples: [{ en: 'There was a significant increase in sales last year.' }],
    synonymsEn: ['considerable', 'notable'],
    antonyms: ['trivial'],
  }),
  W(3, 'abandon', ['tark etmoq', 'tashlab ketmoq'], {
    definitionEn: 'to leave someone or something completely',
    examples: [{ en: 'They had to abandon the car in the snow.' }],
    synonymsEn: ['desert'],
    antonyms: ['keep'],
  }),
  W(4, 'acquire', ['qo\'lga kiritmoq'], {
    definitionEn: 'to get something by buying or working for it',
    examples: [{ en: 'She acquired several new skills during the course.' }],
    synonymsEn: ['obtain', 'gain'],
    antonyms: ['lose'],
  }),
  W(5, 'reluctant', ['istamaydigan', 'ikkilanayotgan'], {
    definitionEn: 'not willing to do something',
    examples: [{ en: 'He was reluctant to share his personal opinion.' }],
    synonymsEn: ['unwilling', 'hesitant'],
    antonyms: ['eager'],
  }),
  W(6, 'generate', ['yaratmoq', 'ishlab chiqarmoq'], {
    definitionEn: 'to produce or create something',
    examples: [{ en: 'Wind turbines generate clean electricity for the town.' }],
    synonymsEn: ['produce', 'create'],
    antonyms: ['destroy'],
  }),
  W(7, 'scarce', ['kam uchraydigan', 'tanqis'], {
    definitionEn: 'not available in large quantities',
    examples: [{ en: 'Fresh water is scarce in many desert regions.' }],
    synonymsEn: ['rare'],
    antonyms: ['plentiful'],
  }),
  W(8, 'diminish', ['kamaytirmoq', 'kamaymoq'], {
    definitionEn: 'to become or make something smaller',
    examples: [{ en: 'The noise began to diminish after midnight.' }],
    synonymsEn: ['reduce', 'decrease'],
    antonyms: ['increase'],
  }),
  W(9, 'crucial', ['hal qiluvchi', 'juda muhim'], {
    definitionEn: 'extremely important for success',
    examples: [{ en: 'A good night of sleep is crucial before an exam.' }],
    synonymsEn: ['vital', 'essential'],
    antonyms: ['minor'],
  }),
  W(10, 'enormous', ['ulkan', 'juda katta'], {
    definitionEn: 'very large in size or amount',
    examples: [{ en: 'The company made an enormous profit this quarter.' }],
    synonymsEn: ['huge', 'vast'],
    antonyms: ['tiny'],
  }),
  W(11, 'remote', ['uzoq', 'chekka'], {
    definitionEn: 'far away from towns or cities',
    examples: [{ en: 'They live in a remote village in the mountains.' }],
    synonymsEn: ['distant'],
    antonyms: ['nearby'],
  }),
  W(12, 'vivid', ['yorqin', "jonli"], {
    definitionEn: 'producing very clear pictures in the mind',
    examples: [{ en: 'She gave a vivid description of the festival.' }],
    synonymsEn: ['bright'],
    antonyms: ['dull'],
  }),
];

/** Faqat tarjima — boyitilmagan so'zlar (ta'rif/misol/sinonimsiz). */
export const BARE_WORDS: GameWord[] = ['apple', 'river', 'window', 'garden', 'bridge', 'candle'].map((w, i) =>
  W(100 + i, w, [`tarjima${i}`])
);
