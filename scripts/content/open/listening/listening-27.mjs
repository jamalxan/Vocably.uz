// Vocably Listening 27 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart, table } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-27',
  title: 'Listening 27: The White House Gardens',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-white-house-gardens-say-about-america',
        contextText: 'You will hear a report about the history of the gardens around the home of the American president.',
        questionGroups: [
          {
            id: 'l27-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to Marta McDowell, what led President Kennedy to expand the gardens?', ['advice from the National Park Service', 'a visit to Buckingham Palace', 'a request from his wife', 'a book about European gardens'], 'B', 'The speaker says "a visit to the home of the British royal family, Buckingham Palace, caused President John Kennedy to expand the White House gardens".'),
              mc(2, 'What have the choices of presidents and their families usually reflected?', ['the cost of maintaining the grounds', 'their values and the traditions of their time', 'the wishes of the public', 'the latest European fashions'], 'B', 'The speaker says "Their choices often showed their values and traditions of their day."'),
              mc(3, 'Who is responsible for looking after the gardens?', ['the National Park Service', 'the city of Washington', 'the first lady', 'a private gardening company'], 'A', 'The speaker says "The National Park Service oversees the gardens."'),
            ],
          },
          {
            id: 'l27-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['President or first lady', 'What they did'],
              [
                ['John Quincy Adams', '{{q4}} in the garden himself'],
                ['Theodore Roosevelt', 'removed the {{q5}} built by James Buchanan'],
                ['John Kennedy', 'redesigned the {{q6}} Garden'],
                ['Michelle Obama', 'created a {{q7}} garden with plants from Jefferson\'s home'],
                ['Thomas Jefferson', 'cut the grounds down to only {{q8}} hectares'],
              ],
              'Presidents and the gardens',
            ),
            questions: [
              q(4, null, 'worked', 'The speaker says "John Quincy Adams, America\'s sixth president, worked in the garden."'),
              q(5, null, 'greenhouses', 'The speaker says Roosevelt "took down glass structures called greenhouses that were first built by James Buchanan".'),
              q(6, null, 'Rose', 'The speaker says Kennedy "redesigned one garden called the Rose Garden".'),
              q(7, null, 'food', 'The speaker says Michelle Obama "built a food garden using plants and seeds from the home of Thomas Jefferson".'),
              q(8, null, '2', 'The speaker says "Jefferson reduced the White House grounds to just 2 hectares".'),
            ],
          },
          {
            id: 'l27-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'The grounds were open to the public until ______, when President Coolidge closed them.', '1923', 'The speaker says "The White house grounds were open to the public up until 1923."'),
              q(10, 'Today, planned public visits to the gardens usually happen ______ a year.', 'twice', 'The speaker says the visits "are usually available for the public twice a year".'),
            ],
          },
        ],
      }),
    ],
  },
};
