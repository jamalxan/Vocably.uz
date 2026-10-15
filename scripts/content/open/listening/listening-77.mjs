// Vocably Listening 77 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-listening-77',
  title: 'Listening 77: The Office of the President',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-overview',
        contextText: 'You will hear a talk about how the position of president of the United States was created.',
        questionGroups: [
          {
            id: 'l77-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>An unusual invention</strong></p><p>Sidney Milkis of the Miller Center at the University of {{q1}} says that the U.S. presidency, created in the late 1700s, was unlike any position before it. Giving a lot of power to one person made sense in a {{q2}}, but giving a lot of power to one person in a {{q3}} did not seem to make sense. The writers of the Constitution had just fought a war against the {{q4}} and did not want one person to be too powerful. However, they had also seen that asking state {{q5}} to make national decisions took too long.</p>',
            questions: [
              q(1, null, 'Virginia', 'The speaker says "Sidney Milkis is part of the Miller Center of Public Affairs at the University of Virginia."'),
              q(2, null, 'monarchy', 'The speaker says the idea made sense "if the country were a monarchy and ruled by a king or queen".'),
              q(3, null, 'democracy', 'The speaker says "giving a lot of power to one person in a democracy did not seem to make sense".'),
              q(4, null, 'British', 'The speaker says the founders "had just fought a war for independence against the British".'),
              q(5, null, 'legislatures', 'The speaker says "Asking state legislatures to make national decisions took too long".'),
            ],
          },
          {
            id: 'l77-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Which person held or holds each of the following views? Choose the correct letter, <strong>A-D</strong>, for questions 6-8. You may use any letter only once.',
            bank: bank(['Sidney Milkis', 'Harry Rubenstein', 'Alexander Hamilton', 'James Madison']),
            questions: [
              q(6, 'A strong executive might become a tyrant or become corrupt.', 'B', 'The speaker says "a strong executive could become a tyrant or corrupt, adds curator Harry Rubenstein".'),
              q(7, 'The president needs enough power to lead large projects for the public good.', 'C', 'The speaker says "Hamilton thought the president should have enough power to direct large projects for the public good."'),
              q(8, 'Americans continue to argue about how much power the president should have.', 'A', 'The speaker says "Historian Sidney Milkis says Americans are still debating how much power the president should have."'),
            ],
          },
          {
            id: 'l77-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'What did the delegates to the Constitutional Convention decide in 1787?', ['The president would be chosen by Congress.', 'The president would be one person, elected for four years at a time.', 'The president would serve for life.', 'The president would share power with the state governors.'], 'B', 'The speaker says "The person would be elected for one four-year term at a time."'),
              mc(10, 'According to Milkis, how do Americans generally feel about the office of the president?', ['They fear it.', 'They are indifferent to it.', 'They respect it.', 'They distrust it.'], 'C', 'The speaker says "for the most part, Americans respect the office of the president".'),
            ],
          },
        ],
      }),
    ],
  },
};
