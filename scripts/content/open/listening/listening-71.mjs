// Vocably Listening 71 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-71',
  title: 'Listening 71: Ulysses S. Grant',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-presidents-ulysses-grant',
        contextText: 'You will hear a talk about Ulysses S. Grant, the Civil War general who became the 18th president of the United States.',
        questionGroups: [
          {
            id: 'l71-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'Which military college did a member of Congress appoint Grant to?', 'West Point', 'The speaker says "a member of Congress appointed him to a top college: the U.S. Military Academy at West Point".'),
              q(2, 'Which family name did the congressman wrongly believe was Grant\'s middle name?', 'Simpson', 'The speaker says "He thought Grant used his mother\'s family name, Simpson, as his middle name."'),
              q(3, 'According to people in the North, what did Grant\'s initials "U.S." stand for?', 'Unconditional Surrender', 'The speaker says "They began saying Grant\'s first two initials stood for" Unconditional Surrender.'),
              q(4, 'What was the job of Grant\'s father?', ['tanner', 'a tanner'], 'The speaker says "Grant\'s father worked as a tanner" who "makes leather from animal skin".'),
            ],
          },
          {
            id: 'l71-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'Why did Grant\'s father want him to study at West Point?', ['Grant had always wanted to be a soldier.', 'The education there cost nothing.', 'His father had studied there.', 'Grant was too weak for farm work.'], 'B', 'The speaker says "they knew he was intelligent and skilled, and West Point was free".'),
              mc(6, 'What problem did Grant face during his early military career?', ['He was badly injured in the Mexican War.', 'His family could not always travel with him.', 'He was refused promotion.', 'He disliked his commanding officers.'], 'B', 'The speaker says "his family could not come with Grant on all his deployments for the military".'),
              mc(7, 'Why did critics call Grant "The Butcher"?', ['He had worked in a leather shop.', 'He let large numbers of his own soldiers die.', 'He refused to accept any surrender.', 'He burned Southern towns.'], 'B', 'The speaker says "Grant permitted so many of his soldiers to die that his critics gave him a nickname".'),
            ],
          },
          {
            id: 'l71-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Grant as president</strong></p><p>The Republicans chose Grant as their candidate in {{q8}} and he won easily. One of his most important acts was to support the 15th Amendment, which gave African-American men the right to {{q9}}. Although his government suffered from corruption, Grant remained popular. He is buried in New York City in a memorial known as Grant\'s {{q10}}.</p>',
            questions: [
              q(8, null, '1868', 'The speaker says "So the Republicans nominated Grant as their candidate in 1868."'),
              q(9, null, 'vote', 'The speaker says "The measure gave African-American men the right to vote."'),
              q(10, null, 'Tomb', 'The speaker says he is buried in New York City "in a well-known memorial popularly called Grant\'s Tomb".'),
            ],
          },
        ],
      }),
    ],
  },
};
