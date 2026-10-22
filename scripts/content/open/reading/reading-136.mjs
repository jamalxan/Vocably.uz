// Vocably Reading 136 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-136',
  title: 'Reading 136: Peat',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'peat', title: 'Peat: The Planet\'s Slow-Growing Carbon Store', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r136-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Sphagnum moss is the only plant from which peat is formed.', 'FALSE', 'Paragraph A: "Sphagnum moss, also called peat moss, is one of the most common components in peat, although many other plants can contribute."', 'A'),
              q(2, 'Plant remains preserved in peat make it possible to reconstruct past environments.', 'TRUE', 'Paragraph B: "peat deposits provide records of past vegetation and climate by preserving plant remains, such as pollen".', 'B'),
              q(3, 'In industrialised countries, peat is removed more quickly than it can grow back.', 'TRUE', 'Paragraph D: "its extraction rate in industrialized countries far exceeds its slow regrowth rate of 1 mm (0.04 in) per year".', 'D'),
              q(4, 'Most tropical peat bogs were formed at the end of the last ice age.', 'NOT GIVEN', 'Paragraph F says that "Most modern peat bogs formed 12,000 years ago in high latitudes after the glaciers retreated at the end of the last ice age" but gives no date for the formation of tropical bogs.', 'F'),
              q(5, 'Soil that engineers classify as peat provides a good base for roads.', 'FALSE', 'Paragraph G: "it cannot be easily compacted to serve as a stable foundation to support loads, such as roads or buildings".', 'G'),
            ],
          },
          {
            id: 'r136-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Peatlands', 'Carbon stored', 'Notes'],
              [
                ['Northern (boreal)', '{{q6}} Gt', 'deposits average 1.5 to 2.3 m in depth'],
                ['Tropical', '{{q7}} Gt', '-'],
                ['South America', '15 Gt', '-'],
                ['Whole world', 'up to {{q8}} Gt', '{{q9}} of all soil carbon; more than all other vegetation types combined'],
              ],
              'Carbon stored in peat',
            ),
            questions: [
              q(6, null, '415', 'Paragraph F: "The estimated carbon content is 415 gigatonnes (457 billion short tons) (northern peatlands)".', 'F'),
              q(7, null, '50', 'Paragraph F: "50 Gt (55 billion short tons) (tropical peatlands)".', 'F'),
              q(8, null, '550', 'Paragraph C: "Globally, peat stores up to 550 Gt of carbon".', 'C'),
              q(9, null, '42%', 'Paragraph C: peat stores "42% of all soil carbon, which exceeds the carbon stored in all other vegetation types, including the world\'s forests".', 'C'),
            ],
          },
          {
            id: 'r136-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
            questions: [
              q(10, 'What name is given to soils that consist mainly of peat?', 'histosols', 'Paragraph A: "Soils consisting primarily of peat are known as histosols."', 'A'),
              q(11, 'Which low-grade fuel is mentioned as something peat may eventually turn into?', 'lignite', 'Paragraph C: "particularly low-grade coal such as lignite".', 'C'),
              q(12, 'What substance released by sphagnum mosses helps to preserve organic material?', 'tannins', 'Paragraph E: "sphagnum mosses actively secrete tannins, which preserve organic material".', 'E'),
              q(13, 'What are the water-storing cells of sphagnum called?', 'hyaline cells', 'Paragraph E: "Sphagnum also have special water-retaining cells, known as hyaline cells".', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
