// Vocably Reading 75 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-75',
  title: 'Reading 75: The Invention of the Barcode',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'barcode', title: 'The Invention of the Barcode', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r75-features', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people and organisations below. Match each statement with the correct person or organisation, <strong>A-G</strong>.<br/><strong>NB</strong> There are two names you will not need.',
            bank: bank([
              'Norman Joseph Woodland',
              'Bernard Silver',
              'George Laurer',
              'British Railways',
              'General Telephone and Electronics (GTE)',
              'Plessey',
              'IBM',
            ]),
            questions: [
              q(1, 'overheard a request for a way of reading product details automatically', 'B', 'Paragraph F: Bernard Silver "overheard the president of the local food chain, Food Fair, asking one of the deans to research a system to automatically read product information during checkout".', 'F'),
              q(2, 'designed a code that could be printed more successfully than a circular pattern', 'C', 'Paragraph D: "Laurer\'s barcode, with vertical bars, printed better than the circular barcode developed by Woodland and Silver."', 'D'),
              q(3, 'developed a system that identified moving railway vehicles by means of coloured stripes', 'E', 'Paragraph C: "Developed by General Telephone and Electronics (GTE) and called KarTrak ACI (Automatic Car Identification), this scheme involved placing colored stripes in various combinations on steel plates".', 'C'),
              q(4, 'produced the first barcode by drawing it in sand', 'A', 'Paragraph G: Woodland "formed his first barcode from sand on the beach".', 'G'),
              q(5, 'commissioned a study which found the idea practical but ahead of its time', 'G', 'Paragraph H: "The company eventually commissioned a report on the idea, which concluded that it was both feasible and interesting, but that processing the resulting information would require equipment that was some time off in the future."', 'H'),
            ],
          },
          {
            id: 'r75-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Date', 'Event'], [
              ['late 1960s', 'A railway scheme uses combinations of {{q6}} on steel plates attached to wagons'],
              ['1972', 'The first successful barcode system is used by the UK supermarket group {{q7}}'],
              ['{{q8}}', 'The Uniform Grocery Product Code Council selects the design created by George Laurer'],
              ['June 1974', 'A UPC barcode is scanned on a packet of {{q9}} at a supermarket in Ohio'],
            ], 'Milestones in barcode history'),
            questions: [
              q(6, null, ['colored stripes', 'coloured stripes', 'stripes'], 'Paragraph C: "this scheme involved placing colored stripes in various combinations on steel plates which were affixed to the sides of railroad rolling stock".', 'C'),
              q(7, null, ['Sainsbury\'s', 'Sainsburys'], 'Paragraph D: "The first successful system using barcodes was in the UK supermarket group Sainsbury\'s in 1972".', 'D'),
              q(8, null, '1973', 'Paragraph D: "The Uniform Grocery Product Code Council had chosen, in 1973, the barcode design developed by George Laurer."', 'D'),
              q(9, null, ['chewing gum', 'gum'], 'Paragraph D: "to scan the Universal Product Code (UPC) barcode on a pack of Wrigley\'s chewing gum".', 'D'),
            ],
          },
          {
            id: 'r75-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Two-dimensional codes use bars in the same way as linear barcodes do.', 'FALSE', 'Paragraph A: "Despite being often included as barcodes, these do not use bars as linear barcodes do."', 'A'),
              q(11, 'The KarTrak system was abandoned because it was too expensive to maintain.', 'FALSE', 'Paragraph C: "The project was abandoned after about ten years because the system proved unreliable after long-term use."', 'C'),
              q(12, 'RFID technology is now cheaper than barcodes.', 'NOT GIVEN', 'Paragraph E only says that "the simplicity, universality and low cost of barcodes has limited the role of these other systems, particularly before technologies such as radio-frequency identification (RFID) became available" — it does not compare the cost of RFID with barcodes.', 'E'),
              q(13, 'Woodland and Silver\'s first working system was abandoned because of problems with its ink.', 'TRUE', 'Paragraph F: "Their first working system used ultraviolet ink, but the ink faded too easily and was expensive."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
