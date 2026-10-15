// Vocably Listening 75 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-75',
  title: 'Listening 75: President James K. Polk',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-james-polk',
        contextText: 'You will hear a talk about the life and presidency of James K. Polk, the 11th president of the United States.',
        questionGroups: [
          {
            id: 'l75-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>James K. Polk: the early years</strong></p><ul><li>became the 11th president in {{q1}}</li><li>was an unexpected candidate: at the party convention he finally received all {{q2}} votes</li><li>born in North Carolina; the family moved west to {{q3}} when he was a child</li><li>was the oldest of his mother\'s {{q4}} children</li><li>went to college and then studied {{q5}}</li></ul>',
            questions: [
              q(1, null, '1845', 'The speaker says Polk "moved into the White House as the 11th president of the United States in 1845".'),
              q(2, null, '266', 'The speaker says "This time, Polk received all 266 votes."'),
              q(3, null, 'Tennessee', 'The speaker says "When he was a child, his family moved west, to Tennessee."'),
              q(4, null, '10', 'The speaker says his mother "gave her 10 children a good education".'),
              q(5, null, 'law', 'The speaker says "He went to college, then studied law."'),
            ],
          },
          {
            id: 'l75-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why was Polk known as "Young Hickory"?', ['He was the youngest member of Congress.', 'He had a close relationship with President Andrew Jackson.', 'He was born in a town called Hickory.', 'He was famous for his physical strength.'], 'B', 'The speaker says "he developed a close relationship with President Andrew Jackson".'),
              mc(7, 'According to historian Robert Merry, one reason Polk won the 1844 election was', ['his record as governor of Tennessee.', 'his position on Texas.', 'his support for banking reforms.', 'his promise of peace with Mexico.'], 'B', 'The speaker says "Merry says one reason Polk won the election was the issue of Texas."'),
              mc(8, 'Why, according to Merry, did Polk promise to serve only one term?', ['He was in poor health.', 'He wanted to return to his plantations.', 'He thought other party leaders would then help him win.', 'The Constitution required it.'], 'C', 'The speaker says Polk thought "other party leaders might help him win".'),
            ],
          },
          {
            id: 'l75-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'In which year was the treaty signed that ended the war with Mexico?', '1848', 'The speaker says "in the 1848 treaty that ended the war, Polk got the land he had wanted".'),
              q(10, 'How long after leaving the White House did Polk die?', ['three months', '3 months'], 'The speaker says "Only three months after he left the White House, Polk died."'),
            ],
          },
        ],
      }),
    ],
  },
};
