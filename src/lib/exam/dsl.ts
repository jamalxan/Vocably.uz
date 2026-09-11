// TZ-vocably-v2.md §15.1 item 2 / §19 Faza 4 item 21 — "Markdown-ga o'xshash
// DSL — tezkor yozish uchun." Faqat Reading uchun (TZ o'zi ham faqat Reading
// namunasini beradi, §15.1) va faqat "bitta qator = bitta savol" shaklidagi
// oddiy turlar uchun (TFNG/YNG/short_answer/matching_information/
// multiple_choice_single) — summary/table/flowchart/form completion kabi
// umumiy `stemHtml` + `{{qN}}` bo'shliq talab qiladigan guruh turlari DSL'da
// QO'LLAB-QUVVATLANMAYDI (JSON yoki AI import ishlatilsin), chunki ular
// ko'p savolli umumiy karkasga muhtoj — flat qator formatiga sig'maydi.
//
// Namuna (TZ §15.1'dan so'zma-so'z):
//   ## PASSAGE 1
//   ### The history of glass
//
//   [A] Glass has been used by humans...
//
//   ## QUESTIONS 1-6
//   type: true_false_notgiven
//   instruction: Do the following statements agree with the information given in Reading Passage 1?
//
//   1. Glass was first made in Mesopotamia. | TRUE | para:A
//   2. The Romans invented glassblowing. | NOT GIVEN
import type { Passage, PassageParagraph, QuestionGroup, Question, QuestionType, Option } from './types';

export interface DslError {
  line: number;
  message: string;
}

export interface DslResult {
  passages: Passage[];
  errors: DslError[];
}

const SUPPORTED_GROUP_TYPES: ReadonlySet<QuestionType> = new Set([
  'true_false_notgiven',
  'yes_no_notgiven',
  'short_answer',
  'matching_information',
  'multiple_choice_single',
]);

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractParaLocator(seg?: string): string | undefined {
  if (!seg) return undefined;
  const m = /^para:\s*([A-Za-z])$/.exec(seg.trim());
  return m ? m[1] : undefined;
}

function parseOptions(seg: string): Option[] {
  return seg
    .split(';')
    .map((o) => o.trim())
    .filter(Boolean)
    .map((o) => {
      const m = /^([A-Za-z])\)\s*(.*)$/.exec(o);
      return m ? { key: m[1].toUpperCase(), text: m[2] } : { key: o.slice(0, 1).toUpperCase(), text: o };
    });
}

function buildQuestion(
  type: QuestionType,
  number: number,
  promptText: string,
  rest: string[],
  onError: (message: string) => void
): Question {
  const promptHtml = escapeHtml(promptText);

  if (type === 'multiple_choice_single') {
    const optionsSeg = rest[0] || '';
    const answerSeg = (rest[1] || '').trim();
    const options = parseOptions(optionsSeg);
    if (options.length === 0) onError(`Savol ${number}: 'options' topilmadi (masalan "A) matn; B) matn")`);
    if (!answerSeg) onError(`Savol ${number}: javob kaliti (to'g'ri variant harfi) topilmadi`);
    return {
      number,
      promptHtml,
      options,
      answer: { accepted: answerSeg ? [answerSeg.toUpperCase()] : [] },
      locatorParagraph: extractParaLocator(rest[2]),
    };
  }

  const answerSeg = (rest[0] || '').trim();
  if (!answerSeg) onError(`Savol ${number}: javob topilmadi`);
  const accepted = answerSeg
    .split(';')
    .map((a) => a.trim())
    .filter(Boolean);
  return {
    number,
    promptHtml,
    answer: { accepted },
    locatorParagraph: extractParaLocator(rest[1]),
  };
}

export function parseReadingDsl(text: string): DslResult {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const errors: DslError[] = [];
  const passages: Passage[] = [];

  let i = 0;
  let currentPassage: Passage | null = null;
  let currentGroup: QuestionGroup | null = null;

  const pushError = (message: string) => errors.push({ line: i + 1, message });

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith('## PASSAGE')) {
      const m = /## PASSAGE\s+(\d+)/.exec(line);
      const order = m ? Number(m[1]) : passages.length + 1;
      currentPassage = { order: order as 1 | 2 | 3, title: '', paragraphs: [] as PassageParagraph[], questionGroups: [] };
      passages.push(currentPassage);
      currentGroup = null;
      i++;
      while (i < lines.length && !lines[i].trim()) i++;
      if (i < lines.length && lines[i].trim().startsWith('### ')) {
        currentPassage.title = lines[i].trim().slice(4).trim();
        i++;
      } else {
        pushError(`'## PASSAGE ${order}'dan keyin '### Sarlavha' kutilgan edi`);
      }
      continue;
    }

    if (line.startsWith('## QUESTIONS')) {
      if (!currentPassage) {
        pushError("'## QUESTIONS' bloki '## PASSAGE'dan oldin kelmoqda");
        i++;
        continue;
      }
      currentGroup = {
        id: `g${currentPassage.order}-${currentPassage.questionGroups.length + 1}`,
        type: 'short_answer',
        instructionHtml: '',
        questions: [],
      };
      currentPassage.questionGroups.push(currentGroup);
      i++;
      while (i < lines.length && lines[i].trim()) {
        const l = lines[i].trim();
        if (l.startsWith('type:')) {
          const t = l.slice('type:'.length).trim() as QuestionType;
          if (!SUPPORTED_GROUP_TYPES.has(t)) {
            pushError(`DSL '${t}' turini qo'llab-quvvatlamaydi — JSON yoki AI import ishlating`);
          }
          currentGroup.type = t;
        } else if (l.startsWith('instruction:')) {
          currentGroup.instructionHtml = escapeHtml(l.slice('instruction:'.length).trim());
        }
        i++;
      }
      continue;
    }

    const paraMatch = /^\[([A-Za-z])\]\s*(.*)$/.exec(line);
    if (paraMatch && currentPassage) {
      const label = paraMatch[1];
      const textParts = [paraMatch[2]];
      i++;
      while (i < lines.length && lines[i].trim() && !/^\[[A-Za-z]\]/.test(lines[i].trim()) && !lines[i].trim().startsWith('##')) {
        textParts.push(lines[i].trim());
        i++;
      }
      currentPassage.paragraphs.push({ label, html: `<p>${escapeHtml(textParts.join(' '))}</p>` });
      continue;
    }

    const qMatch = /^(\d+)\.\s*(.*)$/.exec(line);
    if (qMatch && currentGroup) {
      const number = Number(qMatch[1]);
      const segments = qMatch[2].split('|').map((s) => s.trim());
      const question = buildQuestion(currentGroup.type, number, segments[0] || '', segments.slice(1), pushError);
      currentGroup.questions.push(question);
      i++;
      continue;
    }

    i++;
  }

  if (passages.length === 0) errors.push({ line: 0, message: "Hech qanday '## PASSAGE' topilmadi" });

  return { passages, errors };
}
