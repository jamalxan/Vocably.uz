// Vocably Listening 76 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-76',
  title: 'Listening 76: President John Adams',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'john-adams-biography',
        contextText: 'You will hear a talk about John Adams, the second president of the United States.',
        questionGroups: [
          {
            id: 'l76-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'Why did Adams have a vice president who often disagreed with him?', ['He chose Jefferson in order to please his opponents.', 'Under the rules of the time, the runner-up in the election became vice president.', 'Washington had recommended Jefferson for the post.', 'Congress appointed the vice president.'], 'B', 'The speaker says "The person with the second largest number of votes became vice president."'),
              mc(2, 'What do many historians consider to have been a mistake by Adams?', ['He dismissed all of Washington\'s advisers.', 'He kept Washington\'s official advisers as his cabinet.', 'He gave his vice president too much power.', 'He refused to meet his cabinet.'], 'B', 'The speaker says "Adams simply kept Washington\'s official advisers, mostly to satisfy political opponents."'),
              mc(3, 'How did France try to damage American trade?', ['by declaring war on the United States', 'by seizing American ships', 'by refusing to receive American diplomats', 'by forming an alliance with Great Britain'], 'B', 'The speaker says France "tried to interrupt trade by seizing" American ships.'),
            ],
          },
          {
            id: 'l76-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(4, 'Adams later wrote that peace with France was "the greatest ______ in his crown".', 'jewel', 'The speaker says Adams wrote that "the greatest jewel in his crown" was reaching peace with France.'),
              q(5, 'Adams grew up near Boston, where his father worked as a ______.', 'farmer', 'The speaker says "His father was a farmer, as well as a church official and town leader."'),
              q(6, 'More than ______ letters between John and Abigail Adams still exist today.', ['1,000', '1000'], 'The speaker says "More than 1,000 of their letters still survive today."'),
              q(7, 'Unlike many founding families, the Adamses did not own ______.', 'slaves', 'The speaker says "the couple did not own slaves".'),
            ],
          },
          {
            id: 'l76-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>The Alien and Sedition Acts</strong></p><ul><li>made immigrants wait longer before they could become {{q8}}</li><li>allowed the government to detain citizens of enemy nations during wartime</li><li>allowed the president to expel foreigners he thought were {{q9}}</li><li>made criticizing the president or Congress a {{q10}}</li></ul>',
            questions: [
              q(8, null, 'citizens', 'The speaker says the Acts "extended the time that immigrants had to wait before becoming" citizens.'),
              q(9, null, 'dangerous', 'The speaker says the laws "permitted the president to expel foreign citizens he believed were dangerous".'),
              q(10, null, 'crime', 'The speaker says "they made criticizing the president or Congress a crime".'),
            ],
          },
        ],
      }),
    ],
  },
};
