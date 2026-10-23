// Vocably Listening 103 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-103',
  title: 'Listening 103: Getting to the Root of the Problem',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'let-s-get-to-the-root-of-the-problem',
        contextText: 'You will hear a talk about English expressions that use the word "root".',
        questionGroups: [
          {
            id: 'l103-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>What the roots of a plant do</strong></p><ul><li>most grow below the {{q1}}</li><li>they {{q2}} the plant, keeping it secure</li><li>they take in water and {{q3}} to feed the plant</li><li>in many plants they store food and {{q4}}</li></ul>',
            questions: [
              q(1, null, 'ground', 'The speaker says "The roots of most plants grow below the ground."'),
              q(2, null, 'anchor', 'The speaker says "The roots anchor the plant. They secure it in the ground."'),
              q(3, null, 'minerals', 'The speaker says "Roots also take in water and minerals to feed the plant."'),
              q(4, null, 'nutrients', 'The speaker says "in many plants, the roots store food and nutrients".'),
            ],
          },
          {
            id: 'l103-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(5, 'When you put roots down, you make a place your home by building ______.', 'connections', 'The speaker says "When you put roots down, you make a place your home by creating connections."'),
              q(6, 'The speaker\'s love of mystery stories began with a childhood full of ______ books.', 'Agatha Christie', 'The speaker says "my love of mystery stories is rooted in my childhood full of Agatha Christie books".'),
              q(7, 'A small town\'s problems might have their roots in a shortage of good ______.', 'jobs', 'The speaker says "people could say that a small town\'s problems are rooted in a lack of good jobs".'),
            ],
          },
          {
            id: 'l103-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(8, 'Why is the verb "dig" often used with root expressions?', ['Roots are hard to see.', 'Roots are underground.', 'Roots grow very quickly.', 'Roots are easy to damage.'], 'B', 'The speaker says "As we said, roots are underground. You must dig to reach them."'),
              mc(9, 'In the conversation, what does the second speaker think about the extra school money?', ['It will solve the problem of truancy.', 'It is a waste of money.', 'It may not fix the real problems.', 'It should be spent on teachers.'], 'C', 'The speaker says "I\'m not sure more money is going to fix high truancy rates and poor classroom behavior."'),
              mc(10, 'According to the saying from the Bible, what is the root of all kinds of evil?', ['greed', 'power', 'the love of money', 'laziness'], 'C', 'The speaker quotes the Bible: "The love of money is the root of all kinds of evil."'),
            ],
          },
        ],
      }),
    ],
  },
};
