// Vocably Listening 74 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-74',
  title: 'Listening 74: Woodrow Wilson',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-president-woodrow-wilson',
        contextText: 'You will hear a talk about Woodrow Wilson, the president who led the United States through the First World War.',
        questionGroups: [
          {
            id: 'l74-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What was Wilson\'s profession before he entered politics?', ['lawyer', 'university professor', 'Christian minister', 'newspaper editor'], 'B', 'The speaker says "He was a university professor before he entered politics."'),
              mc(2, 'What is unusual about Wilson\'s education?', ['He never attended college.', 'He studied in England.', 'He is the only president with a doctorate.', 'He was taught only by his father.'], 'C', 'The speaker says "He remains, so far, the only president with a Ph.D."'),
              mc(3, 'Why did Democratic Party leaders in New Jersey choose Wilson as a candidate?', ['They believed they could control him.', 'He had experience as a governor.', 'He was popular with factory workers.', 'He could pay for his own campaign.'], 'A', 'The speaker says "party officials believed he would be a weak leader whom they could influence".'),
            ],
          },
          {
            id: 'l74-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Measure', 'Purpose'],
              [
                ['Federal Reserve Board', 'regulates banks, credit and the {{q4}} supply'],
                ['Federal Trade Commission', 'ensures fair {{q5}} practices'],
                ['Department of Labor', 'protects the rights of {{q6}}'],
                ['New laws', 'shorter working hours for {{q7}} employees; no child labour; loans for farmers'],
              ],
              'Wilson\'s first-term reforms',
            ),
            questions: [
              q(4, null, 'money', 'The speaker says "It still regulates American banks, credit, and money supply."'),
              q(5, null, 'business', 'The speaker says "He also created the Federal Trade Commission to ensure fair business practices".'),
              q(6, null, 'workers', 'The speaker says he created "the Department of Labor to protect workers\' rights".'),
              q(7, null, 'railroad', 'The speaker says "he supported laws to reduce working hours for railroad employees".'),
            ],
          },
          {
            id: 'l74-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'In 1915 a German submarine sank a British ship called the ______.', 'Lusitania', 'The speaker says "a German submarine sank a British ship called the Lusitania".'),
              q(9, 'To win support for the League of Nations, Wilson gave ______ speeches in 22 days.', '29', 'The speaker says he travelled "in 22 days and gave 29 speeches".'),
              q(10, 'Wilson died in Washington ______ years after leaving office.', ['three', '3'], 'The speaker says "Three years later, the former president died quietly there".'),
            ],
          },
        ],
      }),
    ],
  },
};
