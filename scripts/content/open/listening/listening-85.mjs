// Vocably Listening 85 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-85',
  title: 'Listening 85: Arches National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-arches',
        contextText: 'You will hear a talk about a park in Utah famous for its natural stone arches.',
        questionGroups: [
          {
            id: 'l85-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>How the arches were formed</strong></p><ul><li>a thick layer of salt underground – what is left of an ancient {{q1}}</li><li>the area was covered by it about {{q2}} million years ago</li><li>pressure from rock above made the salt move</li><li>a soft rock called {{q3}} was pushed upwards</li><li>scientists say {{q4}} is the most important element in making arches</li></ul>',
            questions: [
              q(1, null, 'sea', 'The speaker says "The huge amount of salt is the remains of an ancient sea."'),
              q(2, null, '300', 'The speaker says "It covered the area around 300 million years ago."'),
              q(3, null, 'sandstone', 'The speaker says "A soft rock called sandstone moved upwards."'),
              q(4, null, 'water', 'The speaker says "Scientists say water is the most important element in creating arches."'),
            ],
          },
          {
            id: 'l85-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['Formation', 'Details'], [
              ['Wall Arch', 'collapsed suddenly in {{q5}}'],
              ['Balanced Rock', 'a block of sandstone the size of three school buses, resting on a tower of {{q6}}'],
              ['Delicate Arch', '{{q7}} metres high and 13 metres wide; a symbol of the state of {{q8}}'],
            ], 'Famous rock formations in the park'),
            questions: [
              q(5, null, '2008', 'The speaker says "In 2008, a formation called Wall Arch suddenly collapsed."'),
              q(6, null, 'mudstone', 'The speaker says "It sits on top of a tower of darker rock called mudstone."'),
              q(7, null, '19', 'The speaker says "It is 19 meters high and 13 meters wide."'),
              q(8, null, 'Utah', 'The speaker says "Delicate Arch has become a symbol of the state of Utah."'),
            ],
          },
          {
            id: 'l85-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'What does the speaker say about the trail to Delicate Arch?', ['It is the longest trail in the park.', 'It is closed during the winter months.', 'There is no shade along the way.', 'Hikers must carry at least five litres of water.'], 'C', 'The speaker says "The walk is difficult and steep. It offers no shade."'),
              mc(10, 'What do hikers pass on the way to the arch?', ['a natural spring', 'ancient drawings on a rock wall', 'a wooden viewing platform', 'the remains of a settlement'], 'B', 'The speaker says "hikers pass a wall of ancient animal drawings created by the Ute Indians".'),
            ],
          },
        ],
      }),
    ],
  },
};
