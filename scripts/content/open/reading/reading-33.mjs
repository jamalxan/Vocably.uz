// Vocably Reading 33 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-33',
  title: 'Reading 33: The Zipperless Zipper',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'velcro', title: 'The Zipperless Zipper', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r33-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The name Velcro is frequently applied to hook-and-loop fasteners in general.', 'TRUE', 'Paragraph A: "the brand name is often used generically to refer to this type of fastener".', 'A'),
              q(2, 'De Mestral got his idea from plant seeds that had attached themselves to his dog.', 'TRUE', 'Paragraph B: "He took a close look at the burs of burdock that kept sticking to his clothes and his dog\'s fur."', 'B'),
              q(3, 'De Mestral had studied burdock plants before his hunting trip.', 'NOT GIVEN', 'Paragraph B describes how "The idea came to him one day after he returned from a hunting trip with his dog in the Alps"; nothing is said about any earlier study of the plant.', 'B'),
              q(4, 'In a hook-and-loop fastener, each hook is designed to pair with one particular loop.', 'FALSE', 'Paragraph C: "hook-and-loop has indeterminate match-up between the hooks and eyes", unlike larger fasteners where "each hook has its own eye".', 'C'),
              q(5, 'It took de Mestral under five years to mechanise the production of the fastener.', 'FALSE', 'Paragraph D: "In all, it took ten years to create a mechanized process that worked."', 'D'),
            ],
          },
          {
            id: 'r33-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Bringing the product to market</strong></p><p>De Mestral applied for a Swiss {{q6}} in 1951, and it was approved four years later. He soon set up shops in several European countries and in Canada, and in 1957 he moved into the United States, choosing the textile centre of {{q7}} in New Hampshire. The first press coverage came in 1958, when a columnist described the invention as a "{{q8}}". The exclusive rights to sell the product in the Americas and Japan were acquired by a firm based in {{q9}}.</p>',
            questions: [
              q(6, null, 'patent', 'Paragraph E: "De Mestral submitted his idea for a patent in Switzerland in 1951, which was granted in 1955."', 'E'),
              q(7, null, 'Manchester', 'Paragraph E: "In 1957 he branched out to the textile center of Manchester, New Hampshire in the United States."', 'E'),
              q(8, null, 'zipperless zipper', 'Paragraph F: Sylvia Porter wrote that "A \'zipperless zipper\' has been invented".', 'F'),
              q(9, null, 'Montreal', 'Paragraph G: "A Montreal firm, Velek, Ltd., acquired the exclusive right to market the product in North and South America, as well as in Japan".', 'G'),
            ],
          },
          {
            id: 'r33-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'According to the writer, one reason the clothing industry was slow to adopt hook-and-loop fasteners was that', [
                'they were too expensive to produce.',
                'they did not look attractive.',
                'they wore out quickly.',
                'patent disputes delayed their use.',
              ], 'B', 'Paragraph H: "Owing partly to its cosmetic appearance, though, hook-and-loop\'s integration into the textile industry took time" and the fasteners "looked as though they had been made from leftover bits of cheap fabric".', 'H'),
              mc(11, 'The first important use of the fastener was in', [
                'the fashion industry.',
                'children\'s clothing.',
                'the aerospace industry.',
                'diving equipment.',
              ], 'C', 'Paragraph I: "the fabric got its first break when it was used in the aerospace industry to help astronauts maneuver in and out of bulky space suits".', 'I'),
              mc(12, 'Skiers took up hook-and-loop fasteners because', [
                'their clothing was similar to that of astronauts.',
                'NASA recommended the product to them.',
                'the fasteners were cheaper than zips.',
                'they had seen food pouches fixed to walls.',
              ], 'A', 'Paragraph I: "skiers, who saw the similarities between their outerwear and that of the astronauts, and thus saw the advantages of a suit that was easier to don and doff".', 'I'),
              mc(13, 'The writer says that NASA is often credited with inventing hook-and-loop because', [
                'NASA paid for de Mestral\'s research.',
                'NASA engineers improved the original design.',
                'NASA bought the rights to the patents.',
                'the product only became popular after NASA used it.',
              ], 'D', 'Paragraph I: "As hook-and-loop fasteners became widely used only after NASA\'s adoption of the technology, NASA is popularly – and incorrectly – credited with its invention."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
