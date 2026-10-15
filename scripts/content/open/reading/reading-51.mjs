// Vocably Reading 51 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-51',
  title: 'Reading 51: Avalanches',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'avalanche', title: 'When the Snow Gives Way', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r51-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a comparison between the speed of two kinds of avalanche', 'I', 'Paragraph I: "In contrast to powder snow avalanches, wet snow avalanches are a low velocity suspension of snow and water".', 'I'),
              q(2, 'a popular misconception about what sets off an avalanche', 'D', 'Paragraph D: "Contrary to popular belief, avalanches are not triggered by loud sound".', 'D'),
              q(3, 'the proportion of deaths caused by one type of avalanche', 'G', 'Paragraph G: "Slab avalanches account for around 90% of avalanche-related fatalities".', 'G'),
              q(4, 'a reference to the goal of developing computer simulations of snow', 'F', 'Paragraph F: "One of the aims of avalanche research is to develop and validate computer models".', 'F'),
              q(5, 'how quickly a stiff layer of snow can begin to move', 'E', 'Paragraph E: "fractures can propagate very rapidly, so that a large volume of snow, possibly thousands of cubic metres, can start moving almost simultaneously".', 'E'),
            ],
          },
          {
            id: 'r51-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Avalanches can only happen during the winter and spring months.', 'FALSE', 'Paragraph C: "They are most frequent in winter or spring, but may occur at any time of the year."', 'C'),
              q(7, 'Melting caused by the sun is the most common cause of natural avalanches.', 'FALSE', 'Paragraph D: melting due to solar radiation "is the second-largest cause of natural avalanches"; the most common cause is "increased load due to snowfall and/or erosion".', 'D'),
              q(8, 'It is harder to measure the strength of a snowpack than the load on it.', 'TRUE', 'Paragraph F: "The load is straightforward; it is the weight of the snow. However, the strength of the snowpack is much more difficult to determine".', 'F'),
              q(9, 'Powder snow avalanches do more damage to buildings than wet snow avalanches.', 'NOT GIVEN', 'Paragraph I says wet snow avalanches "are capable of generating powerful destructive forces", but the passage never compares the damage the two types do to buildings.', 'I'),
            ],
          },
          {
            id: 'r51-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Two kinds of avalanche</strong></p><ul><li><strong>Slab avalanches</strong><ul><li>often form in snow that has been deposited or moved by the {{q10}}</li><li>the fracture at the bottom of the slab is called the {{q11}}</li><li>slabs can be anything from a few centimetres to {{q12}} thick</li></ul></li><li><strong>Powder snow avalanches</strong><ul><li>can move faster than 300 km/h</li><li>can travel long distances along valley floors and even {{q13}} for a short way</li></ul></li></ul>',
            questions: [
              q(10, null, 'wind', 'Paragraph G: "Slab avalanches are formed frequently in snow that has been deposited, or redeposited by wind."', 'G'),
              q(11, null, 'stauchwall', 'Paragraph G: "a fracture at the bottom called the stauchwall".', 'G'),
              q(12, null, ['three metres', '3 metres'], 'Paragraph G: "Slabs can vary in thickness from a few centimetres to three metres."', 'G'),
              q(13, null, 'uphill', 'Paragraph H: "their flows can travel long distances along flat valley bottoms and even uphill for short distances".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
