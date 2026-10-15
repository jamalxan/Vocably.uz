// Vocably Reading 37 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-37',
  title: 'Reading 37: A Short History of the Greenhouse',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'greenhouse', title: 'A Short History of the Greenhouse', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r37-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Glass is now the material most often used to build greenhouses.', 'FALSE', 'Paragraph B: "greenhouses are more commonly constructed with a variety of materials, such as wood and polyethylene plastic".', 'B'),
              q(2, 'A hothouse is a greenhouse that is warmed artificially.', 'TRUE', 'Paragraph B: "The term hothouse indicates the use of artificial heating."', 'B'),
              q(3, 'Conditions inside large commercial greenhouses may be regulated by computer.', 'TRUE', 'Paragraph C: such greenhouses may have installations "sometimes controlled by a computer to optimize conditions for plant growth".', 'C'),
              q(4, 'The emperor Tiberius was fond of cucumbers.', 'NOT GIVEN', 'Paragraph D says only that "the royal physicians recommended that the emperor eat one cucumber a day"; nothing is said about whether he liked them.', 'D'),
              q(5, 'The earliest greenhouses in the Netherlands and England were easy to keep warm.', 'FALSE', 'Paragraph E: "There were serious problems with providing adequate and balanced heat in these early greenhouses."', 'E'),
            ],
          },
          {
            id: 'r37-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Greenhouses through the ages</strong></p><p>The Romans created an artificial growing environment so that their emperor could have a {{q6}} every day. The plants were grown in {{q7}} that were moved into the sunshine by day and brought indoors at night, and they were also kept under frames glazed with oiled cloth or with sheets of {{q8}}. In Britain, the first heated greenhouse was completed at Chelsea Physic Garden by {{q9}}. In France the earliest greenhouses were known as orangeries, because they were built to keep {{q10}} from freezing.</p>',
            questions: [
              q(6, null, 'cucumber', 'Paragraph D: "the royal physicians recommended that the emperor eat one cucumber a day".', 'D'),
              q(7, null, 'wheeled carts', 'Paragraph D: "Cucumbers were planted in wheeled carts which were put in the sun daily, then taken inside to keep them warm at night."', 'D'),
              q(8, null, 'selenite', 'Paragraph D: "glazed with either oiled cloth known as specularia or with sheets of selenite".', 'D'),
              q(9, null, '1681', 'Paragraph E: "The first \'stove\' (heated) greenhouse in the UK was completed at Chelsea Physic Garden by 1681."', 'E'),
              q(10, null, 'orange trees', 'Paragraph I: "The French called their first greenhouses orangeries, since they were used to protect orange trees from freezing."', 'I'),
            ],
          },
          {
            id: 'r37-ends', type: 'matching_sentence_endings', bankReusable: false,
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-F</strong>, below.',
            bank: bank([
              'had been planned on too small a scale.',
              'was remarkable for its size and elaborate design.',
              'was the first in Europe to be heated by a stove.',
              'was designed by a woman who grew citrus trees.',
              'was used mainly for growing pineapples.',
              'served as displays of imperial power.',
            ]),
            questions: [
              q(11, 'The greenhouse at the Palace of Versailles', 'B', 'Paragraph F: "The greenhouse at the Palace of Versailles was an example of their size and elaborateness; it was more than 150 metres (490 ft) long".', 'F'),
              q(12, 'The greenhouse at Mount Clare', 'D', 'Paragraph G: "It was designed by Margaret Tilghman Carroll, an industrious gardener who cultivated citrus trees in this orangery."', 'G'),
              q(13, 'In his letter, George Washington admitted that his own greenhouse', 'A', 'Paragraph H: "I am persuaded, now that I planned mine on too contracted a scale."', 'H'),
              q(14, 'The writer argues that Victorian glasshouses', 'F', 'Paragraph J: "To uphold British hegemony, glasshouses became arguments of colonial power".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
