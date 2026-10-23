// Vocably Listening 102 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-102',
  title: 'Listening 102: Expressions for a Full Meal',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'expressions-for-a-full-meal',
        contextText: 'You will hear a talk about English expressions that come from the different parts of a meal.',
        questionGroups: [
          {
            id: 'l102-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Expression', 'Meaning'],
              [
                ['from soup to nuts', 'from the {{q1}} to the end'],
                ['alphabet soup', 'a group of {{q2}} that stand for several words'],
                ['word salad', 'words or phrases that are hard to {{q3}}'],
                ['criticism sandwich', 'criticism placed between two nice things, e.g. {{q4}} or approval'],
                ['cookie-cutter', 'nothing {{q5}}, extraordinary or different'],
              ],
              'Food expressions',
            ),
            questions: [
              q(1, null, 'beginning', 'The speaker says "if you do something from soup to nuts you do everything from the beginning to the end".'),
              q(2, null, 'letters', 'The speaker says "When you have a collection of letters of the alphabet that stand for several words, we can call it an alphabet soup."'),
              q(3, null, 'understand', 'The speaker says "when we have a mixture of words or phrases that are difficult to understand, we can call it a word salad".'),
              q(4, null, 'praise', 'The speaker says "You put the criticism between two nice things – such as praise or approval."'),
              q(5, null, 'special', 'The speaker says "There is nothing special, extraordinary, or different about things that are cookie-cutter."'),
            ],
          },
          {
            id: 'l102-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'In the past, what did the expression "word salad" refer to?', ['the speech of young children', 'the confusing speech of people with illnesses', 'poorly translated foreign texts', 'the language of politicians'], 'B', 'The speaker says "in the past, word salad described difficult-to-understand spoken language from people with illnesses".'),
              mc(7, 'What is the purpose of a criticism sandwich?', ['to make bad news easier to accept', 'to avoid giving any criticism', 'to praise someone twice', 'to make a complaint more serious'], 'A', 'The speaker says "A criticism sandwich is a way to soften the delivery of bad news."'),
              mc(8, 'In the example, what does the manager ask the employee to do?', ['give the presentation again', 'meet the client', 'correct the report', 'attend the next sales meeting'], 'C', 'The manager says "But I\'ll need you to clean up the report. I saw a few things wrong with the numbers."'),
            ],
          },
          {
            id: 'l102-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'Which dessert does the speaker say is her favourite?', 'cookies', 'The speaker says "But I am going to use my favorite dessert – cookies!"'),
              q(10, 'Apart from their size, in what way are all the houses in the speaker\'s neighbourhood alike?', ['shape', 'same shape'], 'The speaker says "They are all the same size and shape."'),
            ],
          },
        ],
      }),
    ],
  },
};
