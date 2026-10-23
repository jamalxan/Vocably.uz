// Vocably Listening 121 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-121',
  title: 'Listening 121: Par for the Course',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'par-for-the-course',
        contextText: 'You will hear a talk about English expressions used for things that do not change, including "par for the course".',
        questionGroups: [
          {
            id: 'l121-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Talking about things that do not change</strong></p><ul><li>things we are certain of (sunrise, hungry babies crying) – we can {{q1}} on them</li><li>"same old, same old" – nothing new or {{q2}} has happened</li><li>example: a friend fails to turn up and you wait nearly an {{q3}}</li><li>"par for the course" – behaviour that is expected, but you are not {{q4}} about it</li><li>neutral use: security checks at {{q5}} are par for the course</li></ul>',
            questions: [
              q(1, null, 'bank', 'The speaker says "we are so sure about them that we can bank on them".'),
              q(2, null, 'different', 'The speaker says "same old, same old" is another way of saying "nothing new or different happened".'),
              q(3, null, 'hour', 'The speaker says "After waiting almost an hour, you receive a message on your phone."'),
              q(4, null, 'pleased', 'The speaker says "But it also means you are not pleased with the behavior."'),
              q(5, null, 'airports', 'The speaker gives the example "Security checks at airports are par for the course."'),
            ],
          },
          {
            id: 'l121-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'Why is the friend\'s message described as "par for the course"?', ['The friend is usually late for meetings.', 'The friend often forgets things.', 'The market was closed that day.', 'The friend never says sorry.'], 'B', 'The speaker says "That is because you know your friend often forgets things."'),
              mc(7, 'What does the Latin word "par" mean?', ['something that is average', 'something that is expected', 'that which is equal', 'a score in golf'], 'C', 'The speaker says "The word par comes from Latin. It can mean that which is equal."'),
              mc(8, 'Where do language experts think the expression "par for the course" comes from?', ['horse racing', 'banking', 'Latin poetry', 'the game of golf'], 'D', 'The speaker says "Language experts suspect the expression par for the course came from the game of golf".'),
            ],
          },
          {
            id: 'l121-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'In the speaker\'s example, on which part of a car did the traveller notice unusual lights?', ['wheels', 'its wheels', 'the wheels'], 'The speaker says "You see a car with unusual lights on its wheels."'),
              q(10, 'In 2023, which new technology for health and fitness might someone ask "Is that a thing?" about?', ['virtual reality', 'VR'], 'The speaker says "a person might ask if something is a thing about using virtual reality for health and fitness".'),
            ],
          },
        ],
      }),
    ],
  },
};
