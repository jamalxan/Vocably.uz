// Vocably Listening 29 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-29',
  title: 'Listening 29: Words of the Year 2023',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'ai-hallucinate-authentic-or-rizz-for-word-of-the-year',
        contextText: 'You will hear a report about the words that four dictionary publishers chose as their word of the year.',
        questionGroups: [
          {
            id: 'l29-match', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which dictionary publisher does each statement describe? Choose the correct letter, <strong>A, B, C or D</strong>.',
            bank: bank(['Collins', 'Cambridge', 'Merriam-Webster', 'Oxford']),
            questions: [
              q(1, 'Its word of the year is a short form of a longer term.', 'A', 'The speaker says "Collins, a British publisher, has named AI as its word of the year for 2023".'),
              q(2, 'Its word describes AI producing false information.', 'B', 'The speaker says "The British dictionary publisher Cambridge chose hallucinate as its word of the year."'),
              q(3, 'It noticed a big increase in people looking up its word.', 'C', 'The speaker says "Merriam-Webster says it has seen a major rise in searches for authentic".'),
              q(4, 'It let the public choose its word.', 'D', 'The speaker says "The editors of the Oxford dictionary left the selection for Word of the Year to language lovers."'),
            ],
          },
          {
            id: 'l29-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Details from the report</strong></p><ul><li>the toy company Mattel uses AI to design new toy {{q5}}</li><li>ChatGPT learns from a large {{q6}} of books and online materials</li><li>other words Merriam-Webster considered: deepfake, coronation, {{q7}} and rizz</li><li>more than {{q8}} people voted in the Oxford selection</li></ul>',
            questions: [
              q(5, null, 'cars', 'The speaker says "The American toy company Mattel now uses AI to design new toy cars."'),
              q(6, null, 'database', 'The speaker says "The program learns from a large database of books, online materials, and other media."'),
              q(7, null, 'indict', 'The speaker says "Other words Merriam-Webster considered include deepfake, coronation, indict and rizz."'),
              q(8, null, ['30,000', '30000'], 'The speaker says "Over 30,000 people voted and selected four finalists for word of the year."'),
            ],
          },
          {
            id: 'l29-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'Which word is "rizz" believed to come from?', ['risk', 'charisma', 'rhythm', 'wizard'], 'B', 'The speaker says "Rizz is believed to come from the word charisma."'),
              mc(10, 'Among which group is "rizz" popular?', ['dictionary editors', 'people born in the late 1990s and early 2000s', 'Taylor Swift fans', 'computer programmers'], 'B', 'The speaker says "The word is popular among Generation Z" and explains that these are people born during the late 1990s and early 2000s.'),
            ],
          },
        ],
      }),
    ],
  },
};
