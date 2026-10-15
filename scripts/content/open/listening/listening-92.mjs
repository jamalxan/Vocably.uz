// Vocably Listening 92 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-92',
  title: 'Listening 92: The US House of Representatives',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-is-the-us-house-of-representatives',
        contextText: 'You will hear an explanation of how one part of the United States Congress works.',
        questionGroups: [
          {
            id: 'l92-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The House of Representatives</strong></p><ul><li>one of the two parts of Congress; nicknamed "the People\'s House"</li><li>the writers of the Constitution in {{q1}} set few limits on who could serve</li><li>members can be as young as {{q2}}</li><li>the first woman member was elected in {{q3}}</li><li>members serve short terms of only {{q4}} years</li></ul>',
            questions: [
              q(1, null, '1787', 'The speaker says "the men who wrote the U.S. Constitution in 1787 set few restrictions on who could serve there".'),
              q(2, null, '25', 'The speaker says "They can be as young as 25 years old".'),
              q(3, null, '1917', 'The speaker says "the first woman member in 1917".'),
              q(4, null, ['two', '2'], 'The speaker says the terms are "short, compared to the president and senators" and "only two years".'),
            ],
          },
          {
            id: 'l92-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Under the original idea of proportional representation, how many citizens would each member represent?', ['25,000', '30,000', '435', '700,000'], 'B', 'The speaker says "each member of the House would represent 30,000 U.S. citizens".'),
              mc(6, 'What did lawmakers decide in 1929?', ['to count the enslaved population fully', 'to fix the number of House members at 435', 'to make each member represent 700,000 people', 'to shorten the terms of members'], 'B', 'The speaker says "in 1929, lawmakers officially limited the total number of House members to 435".'),
              mc(7, 'What does the speaker say about the House Un-American Activities Committee of the 1950s?', ['It was set up by the Supreme Court.', 'Critics believed it had gone too far.', 'It removed several judges from office.', 'It investigated only government officials.'], 'B', 'The speaker says "But critics said the committee had gone too far."'),
            ],
          },
          {
            id: 'l92-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'How many times has the House brought impeachment charges against officials?', ['60', 'over 60'], 'The speaker says the House "has brought impeachment charges against government officials, including presidents, more than 60 times".'),
              q(9, 'What does Congress control through the "power of the purse"?', ['public money', 'money', 'spending'], 'The speaker says "they control how the government spends public money".'),
              q(10, 'How many times has Congress officially declared war?', '11', 'The speaker says lawmakers have only officially "declared war 11 times" and "The last time was in 1942."'),
            ],
          },
        ],
      }),
    ],
  },
};
