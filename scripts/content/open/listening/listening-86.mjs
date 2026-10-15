// Vocably Listening 86 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-86',
  title: 'Listening 86: Black Canyon of the Gunnison',
  difficulty: 'hard',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-black-canyon-of-the-gunnison',
        contextText: 'You will hear a talk about a deep, narrow canyon in Colorado and the wildlife that lives there.',
        questionGroups: [
          {
            id: 'l86-sent', type: 'sentence_completion', wordLimit: W1,
            instructionHtml: 'Complete the sentences below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'The canyon is ______ kilometres in length.', '77', 'The speaker says "There, you will find a 77-kilometer-long canyon."'),
              q(2, 'On average, the river falls ______ metres with every kilometre it travels.', '18', 'The speaker says "it drops an average of 18 meters per kilometer".'),
              q(3, 'At its deepest point the canyon is ______ metres from rim to floor.', '829', 'The speaker says "it is 829 meters from the canyon edge to the floor".'),
              q(4, 'The canyon was first described in writing in ______.', '1873', 'The speaker says "The first written record about the canyon came in 1873."'),
            ],
          },
          {
            id: 'l86-birds', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Where do the following birds live or build their nests? Choose the correct letter, <strong>A-D</strong>.',
            bank: bank(['in the area around the canyon rim', 'on flat surfaces of the canyon walls', 'in the gorge, next to the river', 'in the forests outside the park']),
            questions: [
              q(5, 'great horned owls', 'A', 'The speaker says "Mountain bluebirds and great horned owls live in the rim area."'),
              q(6, 'peregrine falcons', 'B', 'The speaker says canyon wrens "build their nests on flat surfaces of the canyon walls. So do peregrine falcons."'),
              q(7, 'American dippers', 'C', 'The speaker says "American dippers build their nests in the gorge, next to the Gunnison River."'),
            ],
          },
          {
            id: 'l86-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(8, 'Why can very old Precambrian rocks be seen at Black Canyon?', ['Volcanic activity pushed them to the surface.', 'The river has worn away the younger rock above them.', 'Miners removed the upper layers of rock.', 'They were never covered by other rocks.'], 'B', 'The speaker says "the Gunnison has eroded the canyon walls so greatly that Precambrian rocks have become visible".'),
              mc(9, 'What gives the Painted Wall its pink bands?', ['paint applied by early settlers', 'a type of algae growing on the rock', 'a mineral that formed as hot liquid cooled', 'sunlight reflecting off the river'], 'C', 'The speaker says "As it slowly cooled, large crystals formed. The bands get their pink color from a crystallized mineral".'),
              mc(10, 'What must visitors do before hiking down into the inner canyon?', ['hire an official guide', 'obtain a free permit', 'pay an entrance fee', 'follow the marked trails'], 'B', 'The speaker says "Hikers must first get a wilderness use permit. These permits are free".'),
            ],
          },
        ],
      }),
    ],
  },
};
