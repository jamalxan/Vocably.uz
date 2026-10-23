// Vocably Listening 108 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-108',
  title: 'Listening 108: Defining Success',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-do-you-define-success',
        contextText: 'You will hear a talk about English expressions connected with success.',
        questionGroups: [
          {
            id: 'l108-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The ingredients of success</strong></p><p>Success looks different for every person, so the key may be really knowing {{q1}}. In a traditional corporate environment you may have to wear business clothing such as a {{q2}} – you dress for success. Other people often think success comes {{q3}}, because they do not see the hard work behind it. Another ingredient is a {{q4}}: get organised and break your goal down into doable {{q5}}.</p>',
            questions: [
              q(1, null, 'yourself', 'The speaker says "Perhaps the key to success is really knowing yourself."'),
              q(2, null, 'suit', 'The speaker says "you may have to wear business clothing like a suit".'),
              q(3, null, 'suddenly', 'The speaker says "They think success comes suddenly, for example overnight."'),
              q(4, null, 'plan', 'The speaker says "Another ingredient in the recipe for success is a plan."'),
              q(5, null, 'steps', 'The speaker says "you need to get organized and break the goal down into doable steps".'),
            ],
          },
          {
            id: 'l108-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does it mean when roads are said to be "paved with gold"?', ['The journey is very long.', 'Wealth is easy to obtain there.', 'The roads are of good quality.', 'The place is dangerous.'], 'B', 'The speaker says "This suggests a place where success, especially financial wealth, is easy to come by."'),
              mc(7, 'What did people whose road to success was "paved with failures" gain from them?', ['money', 'good luck', 'knowledge of how to succeed', 'fame'], 'C', 'The speaker says "Learning from their failures taught them how to succeed."'),
              mc(8, 'What happens to a "victim of their own success"?', ['They quickly lose their success.', 'They have problems caused by their success.', 'Other people copy their ideas.', 'They stop working hard.'], 'B', 'The speaker says "This means you start having problems because of your success."'),
            ],
          },
          {
            id: 'l108-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which material does the speaker mention as a paving material for real roads?', 'asphalt', 'The speaker says "Real roads are paved with materials such as asphalt."'),
              q(10, 'Apart from commenting on the website, how else can listeners respond to the program?', ['email', 'an email', 'by email'], 'The speaker says "Or you can send us an email to this address".'),
            ],
          },
        ],
      }),
    ],
  },
};
