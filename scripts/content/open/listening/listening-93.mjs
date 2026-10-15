// Vocably Listening 93 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-93',
  title: 'Listening 93: The United States Senate',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'what-is-the-us-senate',
        contextText: 'You will hear a short talk about how the United States Senate was designed and how it works.',
        questionGroups: [
          {
            id: 'l93-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>The Senate</strong></p><ul><li>every state sends {{q1}} senators, whatever its population</li><li>senators approve or reject the president\'s choices for top posts, including Supreme Court {{q2}}</li><li>James Madison described the Senate as a {{q3}} against the people\'s passion</li><li>senators must be at least {{q4}} years old</li></ul>',
            questions: [
              q(1, null, ['two', '2'], 'The speaker says "Each state has two senators, no matter how big or small its population."'),
              q(2, null, 'justices', 'The speaker says senators "approve or reject the president’s choices for top government positions, including Supreme Court justices".'),
              q(3, null, 'fence', 'The speaker says "James Madison called it a fence against the passion of the people."'),
              q(4, null, ['30', 'thirty'], 'The speaker says senators must be "at least 30 years old, compared to 25".'),
            ],
          },
          {
            id: 'l93-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'How long is a senator\'s term of office?', ['two years', 'four years', 'six years', 'thirty years'], 'C', 'The speaker says "each senator would serve six years – compared to two for members of the House".'),
              mc(6, 'What happens every two years?', ['All senators must seek re-election.', 'A third of the senators finish their terms.', 'The Senate chooses a new leader.', 'Two-thirds of the senators leave office.'], 'B', 'The speaker says "Every two years, one-third of senators must leave their office or seek re-election."'),
              mc(7, 'What changed in 1913?', ['the number of senators for each state', 'the way senators are chosen', 'the minimum age for senators', 'the length of a senator\'s term'], 'B', 'The speaker says "the Constitution was changed to permit voters to elect senators directly".'),
            ],
          },
          {
            id: 'l93-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(8, 'How many regular committees does the Senate work through?', ['16', 'sixteen'], 'The speaker says "The Senate does its lawmaking work through 16 regular committees."'),
              q(9, 'Because senators talk so much, the Senate has been called the world\'s greatest what?', ['deliberative body', 'deliberative'], 'The speaker says "the Senate has been called the world’s greatest deliberative body".'),
              q(10, 'What animals did one former Senate leader say senators were like to herd?', 'cats', 'The speaker says one leader found that "trying to get them to move together was like herding cats".'),
            ],
          },
        ],
      }),
    ],
  },
};
