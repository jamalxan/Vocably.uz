// Onboarding diagnostic (TZ §63–64): qisqa, bosqichma-bosqich qiyinlashadigan lug'at testi.
// Natija: taxminiy CEFR daraja + ball. Test holatsiz (stateless): savollar foydalanuvchi ID'sidan
// seed bilan hosil bo'ladi, javoblar serverda bank bo'yicha tekshiriladi (javob klientga berilmaydi).
import { seededRandom, shuffle } from './rng';

export type DiagLevel = 'A2' | 'B1' | 'B2' | 'C1';
export const DIAG_LEVELS: DiagLevel[] = ['A2', 'B1', 'B2', 'C1'];

interface BankItem {
  word: string;
  level: DiagLevel;
  meaning: string;
}

export const DIAGNOSTIC_BANK: BankItem[] = [
  // A2
  { word: 'borrow', level: 'A2', meaning: 'to take something and give it back later' },
  { word: 'invite', level: 'A2', meaning: 'to ask someone to come to an event' },
  { word: 'repair', level: 'A2', meaning: 'to fix something that is broken' },
  { word: 'crowded', level: 'A2', meaning: 'full of many people' },
  { word: 'ticket', level: 'A2', meaning: 'a piece of paper that lets you travel or enter a place' },
  { word: 'cheap', level: 'A2', meaning: 'not costing much money' },
  // B1
  { word: 'improve', level: 'B1', meaning: 'to become or make something better' },
  { word: 'reliable', level: 'B1', meaning: 'able to be trusted to do what is expected' },
  { word: 'decrease', level: 'B1', meaning: 'to become smaller in amount or number' },
  { word: 'suggest', level: 'B1', meaning: 'to offer an idea for someone to consider' },
  { word: 'nervous', level: 'B1', meaning: 'worried or a little afraid about something' },
  { word: 'achieve', level: 'B1', meaning: 'to succeed in reaching a goal' },
  // B2
  { word: 'reluctant', level: 'B2', meaning: 'not willing to do something' },
  { word: 'consequence', level: 'B2', meaning: 'a result of an action or situation' },
  { word: 'obtain', level: 'B2', meaning: 'to get something, often with effort' },
  { word: 'adequate', level: 'B2', meaning: 'enough in quantity or quality for a purpose' },
  { word: 'ambiguous', level: 'B2', meaning: 'having more than one possible meaning' },
  { word: 'sustain', level: 'B2', meaning: 'to keep something going over a long time' },
  // C1
  { word: 'meticulous', level: 'C1', meaning: 'showing great attention to small details' },
  { word: 'mitigate', level: 'C1', meaning: 'to make something less harmful or severe' },
  { word: 'ubiquitous', level: 'C1', meaning: 'seeming to be present everywhere' },
  { word: 'scrutinize', level: 'C1', meaning: 'to examine something very carefully' },
  { word: 'pragmatic', level: 'C1', meaning: 'dealing with things in a practical, realistic way' },
  { word: 'exacerbate', level: 'C1', meaning: 'to make a problem or bad situation worse' },
];

export const DIAG_QUESTIONS_PER_LEVEL = 4;

export interface DiagQuestion {
  id: string;
  word: string;
  level: DiagLevel;
  options: string[];
}

/** Test savollari (javobsiz): har daraja bo'yicha DIAG_QUESTIONS_PER_LEVEL ta, oson -> qiyin tartibda. */
export function buildDiagnostic(seed: string): DiagQuestion[] {
  const rand = seededRandom(`diag:${seed}`);
  const out: DiagQuestion[] = [];
  for (const level of DIAG_LEVELS) {
    const pool = DIAGNOSTIC_BANK.filter((b) => b.level === level);
    for (const item of shuffle(pool, rand).slice(0, DIAG_QUESTIONS_PER_LEVEL)) {
      const distractors = shuffle(
        pool.filter((b) => b.word !== item.word).map((b) => b.meaning),
        rand
      ).slice(0, 3);
      out.push({ id: item.word, word: item.word, level, options: shuffle([item.meaning, ...distractors], rand) });
    }
  }
  return out;
}

export interface DiagAnswer {
  id: string;
  /** Tanlangan variant matni; null = "Bilmayman". */
  choice: string | null;
}

export interface DiagResult {
  level: DiagLevel | 'A1';
  score: number; // 0..100
  correct: number;
  total: number;
  byLevel: Record<DiagLevel, { correct: number; total: number }>;
}

/**
 * Baholash: darajada kamida 75% (4 tadan 3) to'g'ri bo'lgan eng yuqori ketma-ket daraja = taxminiy CEFR.
 * Ketma-ketlik talabi tasodifan topilgan yuqori darajalarni chetlatadi; "Bilmayman" 0 ball.
 */
export function scoreDiagnostic(seed: string, answers: DiagAnswer[]): DiagResult {
  const questions = buildDiagnostic(seed);
  const byId = new Map(answers.map((a) => [a.id, a.choice]));
  const byLevel = Object.fromEntries(DIAG_LEVELS.map((l) => [l, { correct: 0, total: 0 }])) as DiagResult['byLevel'];
  let correct = 0;
  for (const q of questions) {
    const bank = DIAGNOSTIC_BANK.find((b) => b.word === q.id)!;
    byLevel[q.level].total += 1;
    if (byId.get(q.id) === bank.meaning) {
      byLevel[q.level].correct += 1;
      correct += 1;
    }
  }
  let level: DiagResult['level'] = 'A1';
  for (const l of DIAG_LEVELS) {
    const b = byLevel[l];
    if (b.total > 0 && b.correct / b.total >= 0.75) level = l;
    else break;
  }
  const total = questions.length;
  return { level, score: total ? Math.round((correct / total) * 100) : 0, correct, total, byLevel };
}
