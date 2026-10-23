// Vocably Listening 135 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, table, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-135',
  title: 'Listening 135: The Wrong Side of the Tracks',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'where-is-the-wrong-side-of-the-tracks',
        contextText: 'You will hear a talk about the expression "the wrong side of the tracks" and the films that use this idea.',
        questionGroups: [
          {
            id: 'l135-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the speaker, what do train tracks often do to a town?', ['make it safer', 'bring it more visitors', 'split it into two parts', 'connect it to the capital'], 'C', 'The speaker says "Train tracks often will divide a town in two."'),
              mc(2, 'Which of these does the speaker associate with the less desirable side of a town?', ['bigger houses', 'better schools', 'more restaurants', 'factories and trash dumps'], 'D', 'The speaker says "It also might be where factories, trash dumps, and other industrial sites are found."'),
              mc(3, 'What does the speaker say "few and far between" means?', ['dangerous to visit', 'very expensive', 'not many of them exist', 'far from the town centre'], 'C', 'The speaker says "Community centers, playgrounds, and similar places may be few and far between. This means there aren\'t many of these facilities."'),
            ],
          },
          {
            id: 'l135-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Using the expression</strong></p><p>The tracks were sometimes seen as splitting a town between the haves and the have-nots. However, you do not need to live in a town with {{q4}} tracks to use the expression. It is also used about a person who often causes trouble: people may say they are bad {{q5}}. Crossing the tracks, either for love or to build a {{q6}} life, is a popular idea in stories.</p>',
            questions: [
              q(4, null, 'railroad', 'The speaker says "you don\'t have to live in a town with railroad tracks to use this expression".'),
              q(5, null, 'news', 'The speaker says "if they often cause or get into trouble, someone might say they are bad news".'),
              q(6, null, 'richer', 'The speaker says "crossing the tracks either for love or to create a richer life, is a popular idea in stories".'),
            ],
          },
          {
            id: 'l135-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Film', 'Story'],
              [
                ['Dirty Dancing', 'an upper-middle-class girl and a working-class {{q7}}; they meet at a summer camp'],
                ['Lady and the Tramp, Pretty Woman, {{q8}}', 'other popular films about lovers from different sides of the tracks'],
                ['Annie', 'rags-to-riches story: a poor, {{q9}} girl is adopted by a rich man'],
                ['The Outsiders', 'the Greasers and the Socials both get into trouble; the Socials have more money and better {{q10}}'],
              ],
              'Films about crossing the tracks',
            ),
            questions: [
              q(7, null, ['dance teacher', 'teacher'], 'The speaker says "He is a working-class dance teacher."'),
              q(8, null, 'Grease', 'The speaker says "Lady And The Tramp, Pretty Woman, and Grease are other very popular movies centered on this idea."'),
              q(9, null, 'parentless', 'The speaker says "She is a poor and parentless girl who gets adopted by a rich man."'),
              q(10, null, 'cars', 'The speaker says the Socials "just have more money and better cars".'),
            ],
          },
        ],
      }),
    ],
  },
};
