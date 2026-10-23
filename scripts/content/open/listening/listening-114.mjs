// Vocably Listening 114 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-114',
  title: 'Listening 114: American and British English',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'words-and-their-stories-american-versus-british-english',
        contextText: 'You will hear a talk about differences between American and British English.',
        questionGroups: [
          {
            id: 'l114-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['American English', 'British English'],
              [
                ['apartments', '{{q1}}'],
                ['elevators', 'lifts'],
                ['diapers', '{{q2}}'],
                ['strollers', 'prams'],
                ['gas', '{{q3}}'],
                ['flashlight', '{{q4}}'],
                ['trunk', 'boot'],
              ],
              'Different words for the same thing',
            ),
            questions: [
              q(1, null, 'flats', 'The speaker says "Over there, they live in flats with lifts."'),
              q(2, null, 'nappies', 'The speaker says "they use nappies and prams instead".'),
              q(3, null, 'petrol', 'The speaker says "We power our cars with gas. They use petrol."'),
              q(4, null, 'torch', 'The speaker says "They would use a torch to search their dark boot."'),
            ],
          },
          {
            id: 'l114-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which British expression has the same meaning as each American expression? Choose the correct letter, <strong>A-F</strong>.',
            bank: bank(['put in your tuppence worth', 'flog a dead horse', 'skeletons in the cupboard', 'a chin-wag', 'gobsmacked', 'Bob\'s your uncle']),
            questions: [
              q(5, 'put in your two cents', 'A', 'The speaker says "In the U.K., they put in their tuppence (or two pence) worth."'),
              q(6, 'beat a dead horse', 'B', 'The speaker says "The British, on the other hand, advise against flogging one."'),
              q(7, 'skeletons in the closet', 'C', 'The speaker says "In Great Britain, your skeletons would be hiding in a cupboard."'),
              q(8, 'chit-chat', 'D', 'The speaker says "The British would call it a" chin-wag.'),
            ],
          },
          {
            id: 'l114-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'What does a British person mean by "I\'ve got the hump"?', ['I feel ill.', 'I am a little annoyed.', 'I am very surprised.', 'I am grateful.'], 'B', 'The speaker says "when Brits say they have a hump, it means they are mildly annoyed or upset".'),
              mc(10, 'How do the British use the word "cheers"?', ['to wish someone good health', 'to congratulate someone', 'to say thank you', 'to say goodbye'], 'C', 'The speaker says "The British use cheers to mean thank you."'),
            ],
          },
        ],
      }),
    ],
  },
};
