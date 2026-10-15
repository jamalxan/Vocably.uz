// Vocably Reading 81 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-81',
  title: 'Reading 81: The Art of Origami',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'origami', title: 'The Art of Origami', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r81-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a reason why a European folding tradition lost its popularity', 'J', 'Paragraph J: "historian Joan Sallas attributes this to the introduction of porcelain, which replaced complex napkin folds as a dinner-table status symbol among nobility".', 'J'),
              q(2, 'examples of practical products that make use of folding principles', 'D', 'Paragraph D: "The principles of origami are also used in stents, packaging, and other engineering applications."', 'D'),
              q(3, 'how a local authority has given official recognition to a set of folding methods', 'H', 'Paragraph H: "Kuwana City in Mie Prefecture, Gido\'s hometown, designated 49 of the methods described in the Hiden senbazuru orikata as Intangible Cultural Properties of Kuwana City".', 'H'),
              q(4, 'an explanation of the two parts that make up the name of the art', 'E', 'Paragraph E: the word is "a compound of two smaller words" meaning to fold and paper.', 'E'),
              q(5, 'the earliest physical evidence that paper folding was practised for pleasure', 'F', 'Paragraph F: a sword fitting from around 1600 "was decorated with a picture of a crane made of origami".', 'F'),
            ],
          },
          {
            id: 'r81-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Most present-day folders approve of making small cuts in the paper.', 'FALSE', 'Paragraph B: "Modern origami practitioners generally discourage the use of cuts, glue, or markings on the paper."', 'B'),
              q(7, 'In Japan, ceremonial paper folding is usually given a different name from folding done for fun.', 'TRUE', 'Paragraph C: "ceremonial origami is generally called ... to distinguish it from recreational origami".', 'C'),
              q(8, 'The models in the 1797 book were simpler than earlier origami designs.', 'FALSE', 'Paragraph H: "These pieces were far more technically advanced than their predecessors".', 'H'),
              q(9, 'Friedrich Fröbel travelled to Japan to introduce his teaching method.', 'NOT GIVEN', 'Paragraph K says only that Japan "imported Fröbel\'s Kindergarten system" in the 1860s; nothing is said about Fröbel himself visiting Japan.', 'K'),
            ],
          },
          {
            id: 'r81-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Paper folding in Europe and Japan</strong></p><ul><li>Europe: napkin folding popular in the 17th and 18th centuries, later largely forgotten</li><li>Folding was an important part of Fröbel\'s {{q10}} method of teaching young children</li><li>The {{q11}}: a stylised bird known in Europe since at least the 1800s</li><li>Japan (1860s): adopted German ideas, e.g. no cuts and a {{q12}} square as the starting shape</li><li>{{q13}}: Japan\'s first kindergarten opened; origami promoted in early education</li></ul>',
            questions: [
              q(10, null, 'Kindergarten', 'Paragraph J: "folding was a significant part of Friedrich Fröbel\'s ... method".', 'J'),
              q(11, null, 'pajarita', 'Paragraph J: "a stylized bird whose origins date from at least the nineteenth century".', 'J'),
              q(12, null, 'bicolored', 'Paragraph K: "This included the ban on cuts, and the starting shape of a bicolored square."', 'K'),
              q(13, null, '1875', 'Paragraph K: "In Japan, the first kindergarten was established in 1875, and origami was promoted as part of early childhood education."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
