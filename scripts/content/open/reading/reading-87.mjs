// Vocably Reading 87 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-87',
  title: 'Reading 87: Irrigation',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'irrigation', title: 'Irrigation: Watering the World\'s Crops', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r87-methods', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following descriptions (Questions 1-5) and the list of irrigation methods below. Match each description with the correct method, <strong>A-E</strong>.',
            bank: bank(['surface irrigation', 'sprinkler irrigation', 'micro-irrigation', 'drip irrigation', 'subirrigation']),
            questions: [
              q(1, 'has been practised for longer than any other method', 'A', 'Paragraph B: "Surface irrigation, also known as gravity irrigation, is the oldest form of irrigation and has been in use for thousands of years."', 'B'),
              q(2, 'uses equipment positioned above the crops', 'B', 'Paragraph B: "distributed by overhead high-pressure water devices".', 'B'),
              q(3, 'works by lifting the level of the water that lies underground', 'E', 'Paragraph B: "It involves artificially raising the water table to moisten the soil below the root zone of plants."', 'B'),
              q(4, 'needs less pressure than a sprinkler system', 'C', 'Paragraph B: "Micro-irrigation uses less pressure and water flow than sprinkler irrigation."', 'B'),
              q(5, 'takes water straight to the roots', 'D', 'Paragraph B: "Drip irrigation delivers water directly to the root zone of plants."', 'B'),
            ],
          },
          {
            id: 'r87-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Irrigation is sometimes used to keep farm animals cool.', 'TRUE', 'Paragraph A: "It is also used to cool livestock, reduce dust, dispose of sewage, and support mining operations."', 'A'),
              q(7, 'Full irrigation is used more widely than irrigation that supplements rainfall.', 'FALSE', 'Paragraph C: "Full irrigation is less common and occurs only in arid landscapes with very low rainfall".', 'C'),
              q(8, 'Most treated wastewater in the world is used for irrigation.', 'NOT GIVEN', 'Paragraph C lists "treated wastewater, desalinated water, drainage water, or fog collection" as possible sources, but gives no figures on how much wastewater is used in this way.', 'C'),
              q(9, 'Applying too much water can make the soil saltier.', 'TRUE', 'Paragraph D: "Over-irrigation can cause deep drainage from rising water tables, which can lead to irrigation salinity problems".', 'D'),
            ],
          },
          {
            id: 'r87-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Irrigated land around the world</strong></p><p>Between 1964 and 2023 the world\'s irrigated area more than {{q10}}. By 2023, nearly a quarter of all cropland had irrigation equipment, and this land produces almost half of all crops by value; its yield is on average {{q11}}% greater than that of land which depends on rain. In 2023 the area equipped for irrigation reached {{q12}} million hectares, most of it in Asia. The countries with the largest equipped areas are India and {{q13}}, both of which are far ahead of the United States.</p>',
            questions: [
              q(10, null, 'doubled', 'Paragraph E: "The world\'s total irrigated land area more than doubled between 1964 and 2023".', 'E'),
              q(11, null, '76', 'Paragraph E: "On average, the yield of irrigated land is 76% higher than that of rain fed land."', 'E'),
              q(12, null, '355', 'Paragraph F: "The global land area equipped for irrigation reached 355 million ha in 2023".', 'F'),
              q(13, null, 'China', 'Paragraph F: "India (76 million ha) and China (75 million ha) have the largest equipped area for irrigation, far ahead of the United States of America (25 million ha)."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
