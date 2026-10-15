// Vocably Listening 69 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-69',
  title: 'Listening 69: John Quincy Adams',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-john-quincy-adams',
        contextText: 'You will hear a talk about John Quincy Adams, the sixth president of the United States.',
        questionGroups: [
          {
            id: 'l69-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Stage of life', 'Details'],
              [
                ['Childhood', 'learned to speak at least {{q1}} languages; read Greek and Latin'],
                ['Age {{q2}}', 'travelled to Europe with his father'],
                ['Age 23', 'working as a {{q3}} in Boston'],
                ['Early career', 'ambassador to the Netherlands, Germany, {{q4}} and Britain'],
              ],
              'The early life of John Quincy Adams',
            ),
            questions: [
              q(1, null, ['four', '4'], 'The speaker says "he learned to speak at least four languages and read Greek and Latin".'),
              q(2, null, ['10', 'ten'], 'The speaker says "At age 10, he traveled with his father to Europe."'),
              q(3, null, 'lawyer', 'The speaker says "He was working as a lawyer by the age of 23."'),
              q(4, null, 'Russia', 'The speaker says "he served as the American ambassador to the Netherlands, Germany, Russia and Britain".'),
            ],
          },
          {
            id: 'l69-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'As secretary of state, how did Quincy Adams choose the people he appointed?', ['He chose only members of his own party.', 'He chose people he believed were capable.', 'He let Congress choose them.', 'He chose mainly Southerners.'], 'B', 'The speaker says "he appointed people whom he thought were capable, even if they did not support his political party".'),
              mc(6, 'What did President Adams propose in his first message to Congress?', ['lower taxes for farmers', 'a national program of roads and canals', 'the immediate end of slavery', 'the purchase of more land from Spain'], 'B', 'The speaker says "he offered a national program of building roads and canals".'),
              mc(7, 'Why did many representatives from the West and South reject his proposals?', ['They were too expensive.', 'They believed the states should have these powers.', 'They wanted a war with Britain instead.', 'They disliked his cabinet.'], 'B', 'The speaker says "They believed these powers belonged to the states."'),
            ],
          },
          {
            id: 'l69-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>After the presidency</strong></p><p>Quincy Adams returned to Massachusetts with his wife Louisa, who had been born in {{q8}} and was the first foreign-born first lady. Soon he became restless, and his neighbours asked him to represent them in Congress. Voters sent him to the House of Representatives {{q9}} times. He died at the age of {{q10}}, a few days after suffering a stroke in the House.</p>',
            questions: [
              q(8, null, 'England', 'The speaker says "She was an American, but was born in England."'),
              q(9, null, ['nine', '9'], 'The speaker says "voters elected Quincy Adams to the House of Representatives nine times".'),
              q(10, null, '88', 'The speaker says "He died at the age of 88, a few days after suffering a stroke on the floor of the House of Representatives."'),
            ],
          },
        ],
      }),
    ],
  },
};
