// Vocably Listening 17 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-17',
  title: 'Listening 17: A Faster Rocket to Mars',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'new-rocket-engine-could-cut-travel-time-to-mars-from-years-to-months',
        contextText: 'You will hear a science report about a new type of rocket engine being developed for space travel.',
        questionGroups: [
          {
            id: 'l17-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What is thrust?', ['the force that pushes a spacecraft forward', 'the fuel that a rocket burns', 'the time it takes to reach Mars', 'the weight of a spacecraft'], 'A', 'The speaker says "Thrust is the force that pushes a spacecraft through the air."'),
              mc(2, 'What stage has Howe Industries reached with the new rocket?', ['It is still studying the technology before building engine models.', 'It is testing a working engine.', 'It has already launched a test rocket.', 'It is building a base in space.'], 'A', 'The speaker says "The company is currently in the early stages of studying the technology before building working engine models."'),
              mc(3, 'What does the speaker say is a barrier to NASA\'s plans?', ['the long journey times of current spacecraft', 'the high cost of rocket fuel', 'a shortage of trained astronauts', 'the changing orbit of the moon'], 'A', 'The speaker says "one barrier to all these plans is the long travel times necessary with current spacecraft systems".'),
            ],
          },
          {
            id: 'l17-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Fact', 'Figure'],
              [
                ['Average distance from Earth to Mars', '{{q4}} million kilometres'],
                ['Time to Mars with existing spacecraft', 'at least {{q5}} days each way'],
                ['Time to Mars with the Pulsed Plasma Rocket', 'about two {{q6}} each way'],
                ['Thrust of the Pulsed Plasma Rocket', 'up to {{q7}} Newtons'],
                ['Thrust of the Space Launch System', 'nearly 53 million Newtons'],
              ],
              'Journey to Mars',
            ),
            questions: [
              q(4, null, '225', 'The speaker says "The average distance from Earth to Mars is 225 million kilometers."'),
              q(5, null, '200', 'The speaker says "a trip to Mars with existing spacecraft would take at least 200 days each way".'),
              q(6, null, 'months', 'The speaker says "it could reduce travel time to the Red Planet to about two months each way".'),
              q(7, null, ['100,000', '100000'], 'The speaker says "its PPR system could produce up to 100,000 N of thrust".'),
            ],
          },
          {
            id: 'l17-flow', type: 'flowchart_completion', wordLimit: W1,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>Development of the Pulsed Plasma Rocket</strong></p><p>Phase I (now): funded through a NASA programme called Innovative Advanced {{q8}}</p><p>↓</p><p>Phase II: improving the {{q9}} of the engine and carrying out experiments on major engine systems</p><p>↓</p><p>Final phase: completing a {{q10}} design for carrying humans to Mars</p>',
            questions: [
              q(8, null, 'Concepts', 'The speaker says "The projects are part of a NASA program called Innovative Advanced Concepts".'),
              q(9, null, 'performance', 'The speaker says Phase II "will be centered on improving the performance of the proposed engine".'),
              q(10, null, 'spaceship', 'The speaker says "The last phase will involve completing a spaceship design for carrying humans to Mars."'),
            ],
          },
        ],
      }),
    ],
  },
};
