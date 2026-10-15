// Vocably Listening 66 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-66',
  title: 'Listening 66: Thomas Jefferson',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-jefferson',
        contextText: 'You will hear a talk about the life of Thomas Jefferson, the third president of the United States.',
        questionGroups: [
          {
            id: 'l66-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Thomas Jefferson: early life and home</strong></p><ul><li>born in {{q1}} in Virginia</li><li>positions held: governor of Virginia, minister to {{q2}}, secretary of state, vice president</li><li>designed a house called Monticello, meaning "little {{q3}}" in Italian</li><li>about {{q4}} slaves lived at Monticello at any one time</li><li>his inauguration as president was the first held in {{q5}}</li></ul>',
            questions: [
              q(1, null, '1743', 'The speaker says "Jefferson was born in 1743 and grew up in the hills and low mountains of Virginia."'),
              q(2, null, 'France', 'The speaker says he served as "a minister to France, secretary of state for President George Washington".'),
              q(3, null, 'mountain', 'The speaker says "he designed a house there that he called Monticello" and that "the word means little mountain in Italian".'),
              q(4, null, '130', 'The speaker says "About 130 slaves lived on Monticello\'s grounds at any time."'),
              q(5, null, 'Washington', 'The speaker says "His inauguration was the first held in Washington, DC."'),
            ],
          },
          {
            id: 'l66-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'How did Jefferson\'s view of government differ from that of the first two presidents?', ['He wanted a larger army.', 'He wanted to limit the power of the federal government.', 'He wanted the Supreme Court to have more power.', 'He wanted the president to resemble a European king.'], 'B', 'The speaker says "Jefferson, on the other hand, wanted to limit federal government."'),
              mc(7, 'Why did Jefferson send more naval forces to the Mediterranean?', ['to attack France', 'to protect American ships', 'to buy new territory', 'to collect taxes on trade'], 'B', 'The speaker says "Jefferson increased American naval forces in the Mediterranean to guard against threats to American ships."'),
              mc(8, 'What damaged Jefferson\'s popularity during his second term?', ['He lost a war with Britain.', 'He raised taxes to pay the national debt.', 'He stopped all American trade with Europe.', 'He sold the Louisiana territory.'], 'C', 'The speaker says his popularity suffered "especially when he stopped all American trade with Europe".'),
            ],
          },
          {
            id: 'l66-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Apart from the Declaration of Independence and religious freedom, what did Jefferson want to be remembered for creating?', 'University of Virginia', 'The speaker says he wanted to be remembered for "writing the Declaration of Independence, supporting religious freedom, and creating the University of Virginia".'),
              q(10, 'How old was Jefferson when he died?', '83', 'The speaker says "Jefferson died in his bed at the age of 83."'),
            ],
          },
        ],
      }),
    ],
  },
};
