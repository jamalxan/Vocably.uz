// Vocably Reading 6 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-6',
  title: 'Reading 6: Crop Rotation',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'crop-rotation', title: 'Crop Rotation: Feeding the Soil', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r6-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs B, E, G, I, J and K from the list of headings below. Write the correct number, <strong>i-ix</strong>.',
            bank: bank([
              'Choosing crops according to the farmer\'s goal',
              'Roots that build the soil and crowd out weeds',
              'Why growing a single crop repeatedly is harmful',
              'The origins of rotation in the ancient world',
              'Chemicals take the place of rotation',
              'A medieval change that improved people\'s diet',
              'A four-crop sequence that fed animals all year',
              'Profitable crops that exhaust the soil',
              'How some plants capture nitrogen for the crops that follow',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'iii', 'Paragraph B: "Growing the same crop in the same place for many years in a row, known as monocropping, gradually depletes the soil of certain nutrients".', 'B'),
              q(2, 'Paragraph E', 'vi', 'Paragraph E: the legume crops "increased the overall nutrition of the people of Europe".', 'E'),
              q(3, 'Paragraph G', 'v', 'Paragraph G: "crop rotation gave way in the developed world to the practice of supplementing the chemical inputs to the soil".', 'G'),
              q(4, 'Paragraph I', 'viii', 'Paragraph I: "while these crops may be profitable for the farm, they are nutrient depleting".', 'I'),
              q(5, 'Paragraph J', 'ix', 'Paragraph J: legumes "collect available nitrogen from the atmosphere and store it in nodules on their root structure" and later make "the stored nitrogen available to future crops".', 'J'),
              q(6, 'Paragraph K', 'ii', 'Paragraph K: "The dense and far-reaching root systems give ample structure to surrounding soil" and grasses "compete with undesired plants for soil space and nutrients".', 'K'),
            ],
          },
          {
            id: 'r6-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: table(
              ['System', 'Where / when', 'How the land was used'],
              [
                ['Two-field', 'China, from the Eastern Zhou period onwards', 'Half the land was planted each year while the other half was left {{q7}}; the two halves were swapped the following year.'],
                ['Three-field', 'Europe, from the 9th-11th centuries', 'One section grew autumn-sown crops such as rye and {{q8}}; another grew spring-sown crops, mostly legumes; the third rested.'],
                ['Four-field', 'Britain, 18th century; popularised by Charles {{q9}}', 'A sequence of wheat, turnips, barley and {{q10}}, which included crops for feeding and grazing animals.'],
              ],
              'Field systems through history',
            ),
            questions: [
              q(7, null, 'fallow', 'Paragraph D: "half the land was planted in a year, while the other half lay fallow".', 'D'),
              q(8, null, 'wheat', 'Paragraph E: "The first section grew autumn planted crops such as rye and wheat."', 'E'),
              q(9, null, 'Townshend', 'Paragraph F: "The British agriculturist Charles Townshend (1674–1738) popularised this system in the 18th century."', 'F'),
              q(10, null, 'clover', 'Paragraph F: "The sequence of four crops (wheat, turnips, barley and clover), included a fodder crop and a grazing crop".', 'F'),
            ],
          },
          {
            id: 'r6-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(11, 'A well-planned rotation can cut the quantity of artificial fertiliser a farm requires.', 'TRUE', 'Paragraph B: "a well-designed crop rotation can reduce the need for synthetic fertilizers and herbicides".', 'B'),
              q(12, 'The three-field system had disappeared from Europe by the end of the 18th century.', 'FALSE', 'Paragraph E: "This system persisted until the 20th century."', 'E'),
              q(13, 'The Green Revolution raised harvests in developing countries.', 'NOT GIVEN', 'Paragraph G describes the change "in the developed world" and says the practices "aimed to increase yields", but says nothing about results in developing countries.', 'G'),
              q(14, 'Row crops have deep roots that help to improve the structure of the soil.', 'FALSE', 'Paragraph I: "Row crops typically have low biomass and shallow roots" and have "limited effects on structure".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
