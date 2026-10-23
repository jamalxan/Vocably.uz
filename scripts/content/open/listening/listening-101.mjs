// Vocably Listening 101 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-101',
  title: 'Listening 101: Handy Hand Expressions',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'many-handy-hand-expressions',
        contextText: 'You will hear a talk about English expressions that use the word "hand".',
        questionGroups: [
          {
            id: 'l101-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Hand expressions and their meanings</strong></p><ul><li>with your bare hands – on your own, usually with a lot of {{q1}}</li><li>a firm hand – being {{q2}}; following all the rules closely</li><li>a heavy hand – using force or power to {{q3}} people and events</li><li>also called an iron hand or an iron {{q4}}</li><li>high-handed – looking {{q5}} on other people; arrogant</li></ul>',
            questions: [
              q(1, null, 'effort', 'The speaker says "When we do something with our bare hands, we do it on our own, usually with much effort."'),
              q(2, null, 'strict', 'The speaker says "If you lead with a firm hand, you are strict."'),
              q(3, null, 'control', 'The speaker says "they use a lot of force or power to control people and events".'),
              q(4, null, 'fist', 'The speaker says "Sometimes we call this an iron hand or even an iron fist."'),
              q(5, null, 'down', 'The speaker says high-handed people "look down on people".'),
            ],
          },
          {
            id: 'l101-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'What does the speaker say she built with her own bare hands?', ['a garden wall', 'a small outdoor building', 'a kitchen table', 'a children\'s playhouse'], 'B', 'The speaker says "I decided to build my own gardening shed -- a small outdoor building for gardening supplies."'),
              mc(7, 'Why are your hands clean in the story about Bob?', ['You never met Bob.', 'You tried to warn your friend about him.', 'You paid back the stolen money.', 'You chose a different manager.'], 'B', 'The speaker says "You did nothing wrong. In fact, you tried to warn your friend."'),
              mc(8, 'In the babysitting example, what is the only thing the babysitter did?', ['bought the flour and sugar', 'mixed the cake', 'turned on the oven', 'cleaned the kitchen'], 'C', 'The speaker says "The kids did it all. All you did was turn on the oven."'),
            ],
          },
          {
            id: 'l101-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'What did Bob take from the company?', 'money', 'The speaker says "He steals a lot of money from your friend\'s company."'),
              q(10, 'Which word describes the feeling of someone who throws their hands up?', 'exasperation', 'The speaker says "A good word that describes this feeling is exasperation."'),
            ],
          },
        ],
      }),
    ],
  },
};
