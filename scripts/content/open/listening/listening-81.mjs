// Vocably Listening 81 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W1W = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-listening-81',
  title: 'Listening 81: Petrified Forest National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-petrified-forest-arizona',
        contextText: 'You will hear a talk about a national park in Arizona where ancient trees have turned to stone.',
        questionGroups: [
          {
            id: 'l81-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How the Petrified Forest formed</strong></p><ul><li>over millions of years the trees turned to stone - a process called {{q1}}</li><li>most of the forest came from tall trees called {{q2}}, which grew near waterways over 200 million years ago</li><li>during {{q3}}, the trees were pulled out of the ground</li><li>the coloured clays of the Painted Desert contain bentonite, which comes from volcanic {{q4}}</li><li>the oldest rock formations are about {{q5}} million years old</li></ul>',
            questions: [
              q(1, null, ['fossilization', 'fossilisation'], 'The speaker says "That natural process is called fossilization."'),
              q(2, null, 'conifers', 'The speaker says "Much of the Petrified Forest formed from tall trees called conifers."'),
              q(3, null, 'floods', 'The speaker says "During floods, water forced the trees to be pulled up from the ground."'),
              q(4, null, 'ash', 'The speaker says bentonite is "a clay that is the product of changed volcanic ash".'),
              q(5, null, '227', 'The speaker says "The oldest geological formations in the park are about 227 million years old."'),
            ],
          },
          {
            id: 'l81-flow', type: 'flowchart_completion', wordLimit: W1W,
            instructionHtml: 'Complete the flow-chart below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>People in the Petrified Forest</strong></p><p>13,000 years ago: after the last Ice Age, the first people use petrified wood to make stone {{q6}}</p><p>↓</p><p>The climate warms: villages are built and crops such as corn, squash and beans are grown</p><p>↓</p><p>900s: people build above-ground houses called {{q7}} and make pottery</p><p>↓</p><p>Early 1400s: a long, severe {{q8}} forces most people to leave</p><p>↓</p><p>1500s: European explorers arrive; by the 1920s motorists are travelling through on Route 66</p>',
            questions: [
              q(6, null, 'tools', 'The speaker says early groups "used the petrified wood to create different kinds of stone tools".'),
              q(7, null, 'pueblos', 'The speaker says "people in the area began building above-ground houses, called pueblos".'),
              q(8, null, 'drought', 'The speaker says "A long and severe drought in the early 1400s forced most of the people living here to move."'),
            ],
          },
          {
            id: 'l81-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'When did the Petrified Forest become a national park?', ['1906', '1920', '1962', '2006'], 'C', 'The speaker says "It became a national park in 1962."'),
              mc(10, 'What is most of the petrified wood made of?', ['bentonite', 'quartz', 'volcanic glass', 'crystal salt'], 'B', 'The speaker says "Most of the petrified wood found in the park is made up of quartz."'),
            ],
          },
        ],
      }),
    ],
  },
};
