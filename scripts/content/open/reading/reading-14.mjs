// Vocably Reading 14 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, table, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-14',
  title: 'Reading 14: Hot Springs',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'hot-spring', title: 'Hot Springs: Heat from Deep in the Earth', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r14-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a suggestion that hot springs may be where life first appeared', 'B', 'Paragraph B: "it is possible that life on Earth had its origin in hot springs".', 'B'),
              q(2, 'an explanation of why superheated water does not boil immediately', 'F', 'Paragraph F: "The water will not immediately boil, because the weight of the water column above the cistern pressurizes the cistern and suppresses boiling."', 'F'),
              q(3, 'a reference to disagreement over how a particular term should be defined', 'C', 'Paragraph C: Menzier proposed a definition of a warm spring, "though this definition is contested".', 'C'),
              q(4, 'an example of a thermal spring visited by a political leader for health reasons', 'H', 'Paragraph H: Warm Springs, Georgia, was "frequented for its therapeutic effects by paraplegic U.S. President Franklin D. Roosevelt".', 'H'),
              q(5, 'a description of how a mineral gradually builds up around the mouth of a spring', 'J', 'Paragraph J: geyserite "tends to build up a low, broad platform for some distance around the spring opening".', 'J'),
            ],
          },
          {
            id: 'r14-ends', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'is heated after sinking deep underground along cracks in the rock.',
              'comes mainly from the breakdown of radioactive elements.',
              'water boils as fast as it arrives and reaches the surface only as steam.',
              'begins as rain and snow falling on nearby mountains.',
              'contains large quantities of mud and clay.',
              'is cooled rapidly by contact with magma.',
              'is forced out when steam forms in an underground chamber.',
            ]),
            questions: [
              q(6, 'In regions without volcanoes, groundwater', 'A', 'Paragraph D: "If water percolates deeply enough into the crust, it will be heated as it comes into contact with hot rock. This generally takes place along faults, where shattered rock beds provide easy paths for water to circulate to greater depths."', 'D'),
              q(7, 'Most of the heat escaping from inside the Earth', 'B', 'Paragraph E: "An estimated 45 to 90 percent of the heat escaping from the Earth originates from radioactive decay of elements mainly located in the mantle."', 'E'),
              q(8, 'A fumarole is produced when the', 'C', 'Paragraph G: "If the water supply is less abundant, so that the water is boiled as fast as it can accumulate and only reaches the surface in the form of steam, the result is a fumarole."', 'G'),
              q(9, 'The water at Warm Springs, Georgia,', 'D', 'Paragraph H: "Here the groundwater originates as rain and snow (meteoric water) falling on the nearby mountains".', 'H'),
            ],
          },
          {
            id: 'r14-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Type of hot spring', 'Chemistry', 'Notes'],
              [
                ['acid sulfate', 'pH may be as low as {{q10}}', ''],
                ['alkaline chloride', 'almost neutral pH; saturated with {{q11}}', 'as the water cools, a form of opal called {{q12}} is deposited'],
                ['bicarbonate', 'saturated with {{q13}} and carbonate minerals', ''],
                ['iron-rich', 'large amounts of dissolved iron', ''],
              ],
              'Hot spring chemistry'
            ),
            questions: [
              q(10, null, '0.8', 'Paragraph B: "acid sulfate springs with a pH as low as 0.8".', 'B'),
              q(11, null, 'silica', 'Paragraph J: "These springs have nearly neutral pH but are saturated with silica (SiO2)."', 'J'),
              q(12, null, 'geyserite', 'Paragraph J: "upon cooling, the silica is deposited as geyserite, a form of opal".', 'J'),
              q(13, null, 'carbon dioxide', 'Paragraph B: "bicarbonate springs saturated with carbon dioxide and carbonate minerals".', 'B'),
            ],
          },
        ],
      }),
    ],
  },
};
