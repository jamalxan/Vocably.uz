// Vocably Reading 53 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-53',
  title: 'Reading 53: Wetlands',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'wetland', title: 'Between Land and Water', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r53-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'the claim that wetlands face greater threats than any other type of ecosystem', 'E', 'Paragraph E: "Wetlands are more threatened by environmental degradation than any other ecosystem on Earth".', 'E'),
              q(2, 'examples of some of the biggest wetlands on the planet', 'C', 'Paragraph C: "The world\'s largest wetlands include the Amazon River basin, the West Siberian Plain, the Pantanal in South America, and the Sundarbans".', 'C'),
              q(3, 'a reason why a temporarily wet area might not count as a wetland', 'F', 'Paragraph F: "A patch of land that develops pools of water after a rain storm would not necessarily be considered a wetland, even though the land is wet."', 'F'),
              q(4, 'how wetlands can both reduce and add to greenhouse gases', 'D', 'Paragraph D: "Wetlands can act as a sink or a source of carbon, depending on the specific wetland."', 'D'),
            ],
          },
          {
            id: 'r53-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(5, 'Which type of wetland is normally dominated by trees and shrubs?', ['swamps', 'swamp', 'a swamp'], 'Paragraph B: "Swamps are dominated by woody vegetation, such as trees and shrubs".', 'B'),
              q(6, 'Where does the water in a bog come from?', ['rainfall or meltwater', 'rainfall', 'meltwater', 'rainfall, meltwater'], 'Paragraph C: "bogs and vernal ponds, water source is rainfall or meltwater".', 'C'),
              q(7, 'Which gas do wetlands release when soaked plant matter decomposes without oxygen?', ['methane'], 'Paragraph D: "wetlands can also be a significant source of methane emissions due to anaerobic decomposition of soaked detritus".', 'D'),
              q(8, 'In which year did work under an international treaty to protect important wetlands begin?', ['1971'], 'Paragraph E: "Since 1971, work under an international treaty seeks to identify and protect".', 'E'),
            ],
          },
          {
            id: 'r53-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(9, 'Wetlands can be found on all seven continents.', 'FALSE', 'Paragraph B: "Wetlands exist on every continent, except Antarctica."', 'B'),
              q(10, 'Reed swamps in Europe are an exception to the usual definition of a swamp.', 'TRUE', 'Paragraph B: "Swamps are dominated by woody vegetation, such as trees and shrubs (although reed swamps in Europe are dominated by reeds, not trees)."', 'B'),
              q(11, 'Wetlands give off more nitrous oxide than methane.', 'NOT GIVEN', 'Paragraph D says wetlands can be "a significant source of methane emissions" and that "some are also emitters of nitrous oxide", but it does not compare the amounts of the two gases.', 'D'),
              q(12, 'Methods of measuring the ecological health of wetlands have helped to make the public more aware of their value.', 'TRUE', 'Paragraph E: "These methods have contributed to wetland conservation by raising public awareness of the functions that wetlands can provide."', 'E'),
              q(13, 'All definitions of wetlands put the main emphasis on the types of plant that grow there.', 'FALSE', 'Paragraph K: "For each of these definitions and others, regardless of the purpose, hydrology is emphasized"; plants and soils are "often additional components of the definitions".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
