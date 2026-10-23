// Vocably Listening 137 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-137',
  title: 'Listening 137: Swimming Expressions',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'how-to-use-swimming-to-deal-with-life-s-situations',
        contextText: 'You will hear a talk about English expressions that use swimming to describe how people face difficult situations.',
        questionGroups: [
          {
            id: 'l137-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Swimming in difficult water</strong></p><ul><li>swimming can be hard in very deep, {{q1}} or fast-moving water</li><li>choppy water: many small, fast, close waves, usually caused by {{q2}}</li><li>currents and {{q3}} can be very strong – easier to swim with them than against them</li><li>swimming downstream = swimming with the {{q4}} of the water</li></ul>',
            questions: [
              q(1, null, 'choppy', 'The speaker says "in very deep, choppy or fast moving water swimming can be hard and even dangerous".'),
              q(2, null, 'wind', 'The speaker says "Choppy water has many small, fast, close waves usually created by wind."'),
              q(3, null, 'tides', 'The speaker says "Water currents and tides can be very strong."'),
              q(4, null, 'current', 'The speaker says "That means you are swimming with the current of the water."'),
            ],
          },
          {
            id: 'l137-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'As an expression, what does "swimming upstream" mean?', ['giving up on a task', 'taking a more difficult path', 'choosing the easy way', 'making quick progress'], 'B', 'The speaker says "swimming upstream means you take a more difficult path to do something".'),
              mc(6, 'In the example about money, what did the speaker do to solve the problem?', ['borrowed more money', 'stopped paying the bills', 'went to a financial advisor', 'found a second job'], 'C', 'The speaker says "So I went to a financial advisor. Now I\'m free of debt and staying on a budget."'),
              mc(7, 'What does the speaker say is the likely result of swimming against the tide?', ['You will become stronger.', 'You will probably not win.', 'You will reach the shore faster.', 'You will be helped by others.'], 'B', 'The speaker says "It means you are fighting against very powerful forces. And odds are you will not come out the winner."'),
            ],
          },
          {
            id: 'l137-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Another use of the expressions</strong></p><p>All these expressions can also describe going with or against popular {{q8}} and viewpoints. People who go with the flow are easy-going and take the popular path without {{q9}}. Someone who swims against the tide is, in a sense, an {{q10}}, because they do not have the support of other people.</p>',
            questions: [
              q(8, null, 'opinions', 'The speaker says "They can also mean that you are going with or against popular opinions or viewpoints."'),
              q(9, null, 'protest', 'The speaker says "They take the popular path without protest."'),
              q(10, null, ['outsider', 'outcast'], 'The speaker says "In a sense, you are an outsider or outcast. You do not have the support of the current or of other people."'),
            ],
          },
        ],
      }),
    ],
  },
};
