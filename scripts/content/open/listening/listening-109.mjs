// Vocably Listening 109 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-109',
  title: 'Listening 109: Joshua Tree National Park',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'americas-national-parks-joshua-tree-national-park',
        contextText: 'You will hear a report about a national park in the deserts of southeastern California.',
        questionGroups: [
          {
            id: 'l109-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: '<p><strong>Joshua trees</strong></p><ul><li>look like a large cactus; can grow more than {{q1}} metres tall</li><li>not true trees – succulents belonging to the {{q2}} family</li><li>said to have been named by {{q3}} settlers</li><li>grow well in the {{q4}} Desert, a high desert 900 metres above sea level</li><li>their blooms are bright {{q5}}</li></ul>',
            questions: [
              q(1, null, '12', 'The speaker says "The plant looks like a large cactus, and can grow over 12 meters tall."'),
              q(2, null, 'yucca', 'The speaker says "They are succulents that belong to the yucca family."'),
              q(3, null, 'Mormon', 'The speaker says "The Mormon religious group is said to have given the plant its name."'),
              q(4, null, 'Mojave', 'The speaker says "Joshua trees thrive in the climate of the Mojave, one of two deserts within the park. The Mojave is a high desert."'),
              q(5, null, 'white', 'The speaker says "The blooms on Joshua trees are bright white."'),
            ],
          },
          {
            id: 'l109-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'How did an early explorer describe the Joshua tree?', ['as the most beautiful tree in the desert', 'as the ugliest tree in the plant world', 'as the tallest plant in California', 'as a holy tree'], 'B', 'The speaker says the explorer "described them as “the most repulsive tree in the vegetable kingdom.”"'),
              mc(7, 'Which desert makes up the eastern part of the park?', ['the Mojave Desert', 'the Sonoran Desert', 'the Colorado Desert', 'the Great Basin Desert'], 'C', 'The speaker says "The Colorado is a lower desert. It makes up the eastern part of the national park."'),
              mc(8, 'What was the Hidden Valley area once used for?', ['gold mining', 'a hiding place for cowboys', 'a Mormon settlement', 'cattle farming'], 'B', 'The speaker says "The area\'s massive rock piles made for effective places to hide in the desert."'),
            ],
          },
          {
            id: 'l109-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'How many kinds of birds live in the park?', '250', 'The speaker says "The park is also home to 250 kinds of birds".'),
              q(10, 'How long is John Hochhausler\'s drive to the park from Los Angeles?', ['three hours', 'three-hour', '3 hours', 'three hour'], 'The speaker says "He makes the three-hour drive from Los Angeles, where he is a lawyer."'),
            ],
          },
        ],
      }),
    ],
  },
};
