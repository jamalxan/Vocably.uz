// Vocably Listening 115 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-115',
  title: 'Listening 115: Sitting on the Fence',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'are-you-guilty-of-sitting-on-the-fence',
        contextText: 'You will hear a talk about the word "fence" and the expressions that use it.',
        questionGroups: [
          {
            id: 'l115-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'How is a fence different from a wall?', ['It is usually taller.', 'It has no solid foundation along its whole length.', 'It is always made of wood.', 'It does not mark property.'], 'B', 'The speaker says a fence "does not have a solid foundation along its whole length".'),
              mc(2, 'Why does the speaker say fences help keep the peace in a neighbourhood?', ['They keep animals away from gardens.', 'People cannot see each other\'s business.', 'They are cheap to build.', 'They stop criminals entering.'], 'B', 'The speaker says "People can\'t see onto your property and vice versa."'),
              mc(3, 'Where does the proverb "Fences make good neighbors" appear?', ['in a poem by Robert Frost', 'in a law passed in 1914', 'in a popular song', 'in a famous novel'], 'A', 'The speaker says "This proverb appears several times in Robert Frost\'s poem Mending Wall published in 1914."'),
            ],
          },
          {
            id: 'l115-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Being on the fence</strong></p><p>Someone who is on the fence about an issue is {{q4}}. Because a fence divides property, the person has not taken {{q5}}. In the speaker\'s example, a school has raised ${{q6}} and must choose between new science equipment and a new play area. The school asks the parents for their {{q7}}.</p>',
            questions: [
              q(4, null, 'undecided', 'The speaker says "If you are sitting on the fence about something you are undecided."'),
              q(5, null, 'sides', 'The speaker says "if you are on the fence about something, you have not taken sides".'),
              q(6, null, '20,000', 'The speaker says "your child\'s school just raised $20,000".'),
              q(7, null, 'opinion', 'The speaker says "They ask the parents to give their opinion."'),
            ],
          },
          {
            id: 'l115-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'What quality may a fence-sitter be lacking?', 'courage', 'The speaker says "This could show a lack of courage."'),
              q(9, 'What does the speaker say calling someone a fence-sitter usually is?', ['an insult', 'insult'], 'The speaker says "calling someone a fence-sitter is usually an insult".'),
              q(10, 'In the election example, how many candidates is the speaker undecided between?', ['two', '2'], 'The speaker says "I\'m on the fence between two candidates."'),
            ],
          },
        ],
      }),
    ],
  },
};
