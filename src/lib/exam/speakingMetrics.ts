// Objective Speaking fluency measures from what we already store per answer
// (Whisper transcript + recording length) — no AI, deterministic, tested in
// speakingMetrics.test.ts. They complement the AI band with numbers the
// learner can act on: speech rate, fillers, Part 2 length, answer length,
// vocabulary variety. (Whisper tends to drop some "um"s, so the filler count
// is a lower bound — the UI says so.)
import type { SpeakingRecording } from './types';

export interface SpeakingMetrics {
  totalWords: number;
  speakingSec: number;
  wordsPerMinute: number | null;
  fillers: { total: number; per100: number; top: { word: string; count: number }[] };
  part2Sec: number | null;
  avgPart1Words: number | null;
  avgPart3Words: number | null;
  lexicalVariety: number | null; // distinct / total content words, 0..1
  tipsUz: string[];
}

const FILLERS = ['um', 'uh', 'er', 'erm', 'ah', 'hmm', 'like', 'you know', 'i mean', 'actually', 'basically', 'kind of', 'sort of'];
const FUNCTION = new Set(
  'a an the and or but so of to in on at for with is are was were be been it this that i you he she we they my your me him her us them do does did not no yes very really'.split(' ')
);

const words = (t: string): string[] => t.toLowerCase().match(/[a-z']+/g) || [];

function countPhrase(text: string, phrase: string): number {
  const re = new RegExp(`\\b${phrase.replace(/ /g, '\\s+')}\\b`, 'gi');
  return (text.match(re) || []).length;
}

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export function computeSpeakingMetrics(recordings: SpeakingRecording[]): SpeakingMetrics {
  const answered = recordings.filter((r) => r.transcript?.trim());
  const allText = answered.map((r) => r.transcript).join(' ');
  const all = words(allText);
  const totalWords = all.length;
  const speakingSec = Math.round(answered.reduce((s, r) => s + (r.durationSec || 0), 0));
  const wordsPerMinute = speakingSec >= 10 ? Math.round((totalWords / speakingSec) * 60) : null;

  const counts = FILLERS.map((f) => ({ word: f, count: countPhrase(allText, f) })).filter((f) => f.count > 0);
  const fillerTotal = counts.reduce((s, f) => s + f.count, 0);
  const per100 = totalWords ? Math.round((fillerTotal / totalWords) * 1000) / 10 : 0;

  const part2 = answered.find((r) => r.part === 2);
  const part2Sec = part2 ? Math.round(part2.durationSec || 0) : null;
  const avgPart1Words = avg(answered.filter((r) => r.part === 1).map((r) => words(r.transcript).length));
  const avgPart3Words = avg(answered.filter((r) => r.part === 3).map((r) => words(r.transcript).length));

  const content = all.filter((w) => w.length > 2 && !FUNCTION.has(w));
  const lexicalVariety = content.length >= 20 ? Math.round((new Set(content).size / content.length) * 100) / 100 : null;

  const tipsUz: string[] = [];
  if (wordsPerMinute != null && wordsPerMinute < 100)
    tipsUz.push(`Nutq tezligi ${wordsPerMinute} so‘z/daqiqa — sekin. Band 7 uchun odatda ~120–160: pauzalarni qisqartiring, fikrni gapira turib davom ettiring.`);
  if (wordsPerMinute != null && wordsPerMinute > 185)
    tipsUz.push(`Nutq tezligi ${wordsPerMinute} so‘z/daqiqa — juda tez. Sekinroq va aniqroq gapirsangiz, talaffuz bahosi oshadi.`);
  if (per100 > 5)
    tipsUz.push(
      `To‘ldiruvchi so‘zlar ko‘p (${counts
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((f) => `"${f.word}" ×${f.count}`)
        .join(', ')}). Ularni "Well, let me think…" kabi tabiiy iboralar bilan almashtiring.`
    );
  if (part2Sec != null && part2Sec < 90)
    tipsUz.push(`Part 2 javobingiz ${Math.floor(part2Sec / 60)}:${String(part2Sec % 60).padStart(2, '0')} davom etdi — kamida 1:45–2:00 gapiring, cue card’dagi barcha bandlarni yoriting.`);
  if (avgPart1Words != null && avgPart1Words < 20) tipsUz.push('Part 1 javoblari qisqa — har biriga javob + sabab + misol (2–3 gap) qo‘shing.');
  if (avgPart3Words != null && avgPart3Words < 40) tipsUz.push('Part 3 javoblari qisqa — fikringizni asoslang, taqqoslang, misol keltiring.');
  if (lexicalVariety != null && lexicalVariety < 0.45) tipsUz.push('Bir xil so‘zlar ko‘p takrorlanmoqda — sinonim va aniqroq so‘zlardan foydalaning (Lexical Resource).');

  return {
    totalWords,
    speakingSec,
    wordsPerMinute,
    fillers: { total: fillerTotal, per100, top: counts.sort((a, b) => b.count - a.count).slice(0, 5) },
    part2Sec,
    avgPart1Words,
    avgPart3Words,
    lexicalVariety,
    tipsUz,
  };
}

/** One-line summary handed to the AI grader as extra, objective evidence. */
export function metricsForPrompt(m: SpeakingMetrics): string {
  return [
    m.wordsPerMinute != null ? `speech rate ${m.wordsPerMinute} wpm` : null,
    `fillers ${m.fillers.total} (${m.fillers.per100} per 100 words)`,
    m.part2Sec != null ? `Part 2 length ${m.part2Sec}s` : null,
    m.lexicalVariety != null ? `lexical variety ${m.lexicalVariety}` : null,
  ]
    .filter(Boolean)
    .join('; ');
}
