// Mistake notebook (pure, no DB/AI — unit-tested in mistakes.test.ts).
//
// From a graded Reading/Listening attempt: which questions were wrong, what
// the user wrote, what was accepted — and which WORDS are worth drilling.
// The words come from what the question actually tested:
//   1. the accepted answer itself for completion-type questions (the word the
//      user failed to catch or spell — the most direct vocabulary gap);
//   2. long content words of the question prompt (the paraphrase the user
//      had to match against the passage/audio);
//   3. only for Reading and only if 1–2 found nothing: the longest words of
//      the paragraph that holds the answer (the old EDU-03 heuristic).

export type MistakeSkill = 'reading' | 'listening';

export interface MistakeQuestion {
  section: MistakeSkill;
  number: number;
  promptText: string;
  userAnswer: string;
  accepted: string[];
  locatorParagraph?: string;
}

interface Q {
  number: number;
  promptHtml?: string;
  answer?: { accepted?: string[] };
  locatorParagraph?: string;
}
interface Group {
  questions?: Q[];
}
export interface MistakeTestShape {
  sections?: {
    reading?: { passages?: { paragraphs?: { label?: string; html: string }[]; questionGroups?: Group[] }[] };
    listening?: { parts?: { questionGroups?: Group[]; transcript?: string }[] };
  };
}
export interface PerQ {
  number: number;
  correct: boolean;
  userAnswer?: string;
  accepted?: string[];
}

const STOP = new Set(
  (
    'about after again against almost along already although always among another around because become before being below between ' +
    'could during each either every first from further having however into itself least might more most much never often other others ' +
    'ought over perhaps rather same shall should since some still such than that their them then there these they this those though ' +
    'through toward towards under until upon very were what when where whether which while whose with within without would ' +
    'passage paragraph statement following information according writer author questions answer choose correct letter words number ' +
    'complete write below'
  ).split(' ')
);
// Answers that are choices, not vocabulary.
const NON_WORD_ANSWER = /^(true|false|not given|yes|no|[a-h]|[ivx]+|\d+)$/i;

export function stripHtml(html: string | undefined): string {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const tokens = (text: string): string[] => text.toLowerCase().match(/[a-z]+(?:-[a-z]+)?/g) || [];

function* questionsOf(test: MistakeTestShape): Generator<{ section: MistakeSkill; q: Q; paragraphs?: { label?: string; html: string }[] }> {
  for (const p of test?.sections?.reading?.passages || []) {
    for (const g of p.questionGroups || []) for (const q of g.questions || []) yield { section: 'reading', q, paragraphs: p.paragraphs };
  }
  for (const part of test?.sections?.listening?.parts || []) {
    for (const g of part.questionGroups || []) for (const q of g.questions || []) yield { section: 'listening', q };
  }
}

export function wrongQuestions(test: MistakeTestShape | null | undefined, perQuestion: PerQ[] | null | undefined): MistakeQuestion[] {
  if (!test || !Array.isArray(perQuestion)) return [];
  const wrong = new Map(perQuestion.filter((p) => p && p.correct === false).map((p) => [p.number, p]));
  if (!wrong.size) return [];
  const out: MistakeQuestion[] = [];
  for (const { section, q } of questionsOf(test)) {
    const pq = wrong.get(q.number);
    if (!pq) continue;
    out.push({
      section,
      number: q.number,
      promptText: stripHtml(q.promptHtml).slice(0, 240),
      userAnswer: String(pq.userAnswer || ''),
      accepted: pq.accepted?.length ? pq.accepted : q.answer?.accepted || [],
      locatorParagraph: q.locatorParagraph,
    });
  }
  return out;
}

/** True when the answer appears in the source text as a Proper Noun
 * ("Martin Osei", "London") — names are not vocabulary to drill. */
export function isProperNounIn(answer: string, sourceText: string): boolean {
  const a = answer.trim();
  if (!a || !sourceText) return false;
  const i = sourceText.toLowerCase().indexOf(a.toLowerCase());
  if (i < 0) return false;
  const found = sourceText.slice(i, i + a.length);
  return found.split(/\s+/).every((w) => /^[A-Z]/.test(w));
}

const PER_QUESTION = 3;
const PER_ATTEMPT = 12;

export function mistakeVocabulary(
  test: MistakeTestShape | null | undefined,
  perQuestion: PerQ[] | null | undefined
): { word: string; skill: MistakeSkill }[] {
  if (!test || !Array.isArray(perQuestion)) return [];
  const wrong = new Set(perQuestion.filter((p) => p && p.correct === false).map((p) => p.number));
  if (!wrong.size) return [];
  const seen = new Set<string>();
  const out: { word: string; skill: MistakeSkill }[] = [];
  const source: Record<MistakeSkill, string> = {
    reading: (test.sections?.reading?.passages || []).flatMap((p) => (p.paragraphs || []).map((x) => stripHtml(x.html))).join(' '),
    listening: (test.sections?.listening?.parts || []).map((p) => p.transcript || '').join(' '),
  };

  for (const { section, q, paragraphs } of questionsOf(test)) {
    if (!wrong.has(q.number) || out.length >= PER_ATTEMPT) continue;
    const picked: string[] = [];
    const take = (w: string) => {
      if (picked.length < PER_QUESTION && !seen.has(w) && !picked.includes(w)) picked.push(w);
    };

    for (const a of q.answer?.accepted?.slice(0, 1) || []) {
      if (NON_WORD_ANSWER.test(a.trim()) || isProperNounIn(a, source[section])) continue;
      tokens(a)
        .filter((w) => w.length >= 4 && !STOP.has(w))
        .forEach(take);
    }
    [...new Set(tokens(stripHtml(q.promptHtml)))]
      .filter((w) => w.length >= 7 && !STOP.has(w))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .slice(0, 2)
      .forEach(take);

    if (!picked.length && section === 'reading' && q.locatorParagraph) {
      const para = (paragraphs || []).find((p) => p.label === q.locatorParagraph);
      [...new Set(tokens(stripHtml(para?.html)))]
        .filter((w) => w.length >= 5 && !STOP.has(w))
        .sort((a, b) => b.length - a.length || a.localeCompare(b))
        .slice(0, 2)
        .forEach(take);
    }

    for (const w of picked) {
      if (out.length >= PER_ATTEMPT) break;
      seen.add(w);
      out.push({ word: w, skill: section });
    }
  }
  return out;
}
