// Vocably Listening 120 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-120',
  title: 'Listening 120: Sweeping It Under the Rug',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'got-something-to-hide-try-sweeping-it-under-the-rug',
        contextText: 'You will hear a talk about English expressions that use the word "rug".',
        questionGroups: [
          {
            id: 'l120-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Rugs in the home</strong></p><ul><li>add colour and {{q1}} to a room</li><li>make a slippery floor {{q2}} to walk on</li><li>trap a lot of {{q3}}</li><li>a lazy cleaner may simply sweep {{q4}} the rug</li></ul>',
            questions: [
              q(1, null, 'style', 'The speaker says "They add color and style to a room."'),
              q(2, null, 'safer', 'The speaker says "They can also make a slippery floor safer to walk on."'),
              q(3, null, 'dirt', 'The speaker says "rugs can trap a lot of dirt".'),
              q(4, null, 'around', 'The speaker says "you can always clean the floor quickly and just sweep around the rug".'),
            ],
          },
          {
            id: 'l120-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'What kinds of things do people sweep under the rug?', ['things that are illegal, unethical or embarrassing', 'things that are old and no longer needed', 'things that cost a lot of money', 'things that other people have given them'], 'A', 'The speaker says "Things that are illegal, unethical, embarrassing, or just wrong."'),
              mc(6, 'Why did the speaker\'s friend hide her past mistakes?', ['She wanted a fresh start with her boyfriend\'s family.', 'She was running for political office.', 'She had just lost her job.', 'She was moving to a new city.'], 'A', 'The speaker says "She wanted a fresh start. She decided to keep her complex past hidden."'),
              mc(7, 'What does it mean to pull the rug from under someone\'s feet?', ['to suddenly take away their support', 'to help them move house', 'to clean their floor for them', 'to make them laugh'], 'A', 'The speaker says "We suddenly take away support or help from them."'),
            ],
          },
          {
            id: 'l120-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'When her building was going to be torn down, the speaker had only one ______ to find a new home.', 'week', 'The speaker says "I had only one week to find a new place to live!"'),
              q(9, 'Some home insurance policies do not cover damage caused by a ______.', 'flood', 'The speaker says "Some home insurance policies do not cover flood damage."'),
              q(10, 'The joke about the rug and the floor is a ______ on the word "cover".', 'pun', 'The speaker says "That joke is a pun on the word cover."'),
            ],
          },
        ],
      }),
    ],
  },
};
