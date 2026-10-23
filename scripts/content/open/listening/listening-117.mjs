// Vocably Listening 117 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-117',
  title: 'Listening 117: Expressions with Mile',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'english-s-mile-expressions-are-a-mile-long',
        contextText: 'You will hear a talk about English expressions that use the word "mile".',
        questionGroups: [
          {
            id: 'l117-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Although some Americans use the metric system, their idioms keep words from the ______ system of measuring.', 'English', 'The speaker says "our idioms and expressions often stick with measurement words from the English system".'),
              q(2, 'Sarah talked a mile a minute because she was excited about her ______.', 'trip', 'The speaker says "Sarah was very excited about her trip!"'),
              q(3, 'Sam\'s brain works a mile a minute because he is a very quick ______.', ['problem-solver', 'problem solver'], 'The speaker says "Sam is a very quick problem-solver."'),
            ],
          },
          {
            id: 'l117-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(4, 'Why does the speaker mention a race that is 10 miles long?', ['to show that running 11 miles is doing more than is needed', 'to explain that races are measured in kilometres', 'to compare a mile with a kilometre', 'to show how fast a runner can go'], 'A', 'The speaker says "If you run a race that is 10 miles long and you run 11 miles, you have run farther than others and farther than needed."'),
              mc(5, 'How did Tory go the extra mile?', ['She collected more books than anyone else.', 'She delivered the books to families who needed them.', 'She ran a race for the organisation.', 'She wrote a book for the community.'], 'B', 'The speaker says "she delivered the books to needy families in the community".'),
              mc(6, 'If you can spot a liar from a mile away, you are good at…', ['recognising people who are not telling the truth.', 'telling lies yourself.', 'seeing things at a great distance.', 'avoiding dishonest people.'], 'A', 'The speaker says "I am very good at detecting people who do not tell the truth."'),
            ],
          },
          {
            id: 'l117-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>More "mile" expressions</strong></p><p>If a {{q7}} is very strong, you can say you smell it a mile away. To be a million miles away usually means to be lost in {{q8}}. The expression can also compare things: two goals that are a million miles apart have nothing in {{q9}}. Finally, the speaker describes people who are selfish and {{q10}} – if you give them an inch, they take a mile.</p>',
            questions: [
              q(7, null, 'scent', 'The speaker says "If a scent is very strong, you could say you smell it from a mile away."'),
              q(8, null, 'thought', 'The speaker says "We often use that expression to mean lost in thought."'),
              q(9, null, 'common', 'The speaker says "The two goals had nothing in common."'),
              q(10, null, 'greedy', 'The speaker says "Our last expression describes people who are selfish and greedy."'),
            ],
          },
        ],
      }),
    ],
  },
};
