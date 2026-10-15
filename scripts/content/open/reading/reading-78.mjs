// Vocably Reading 78 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-78',
  title: 'Reading 78: Maize',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'maize', title: 'Maize: The World\'s Biggest Grain Crop', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r78-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, E, G, H and I from the list of headings below.',
            bank: bank([
              'A crop that depends on people and feeds animals',
              'The structure of the plant and how the grain develops',
              'The conditions a maize plant needs in order to flower',
              'Natural defences and physical weaknesses',
              'Genetic research and a Nobel Prize',
              'Mapping the complete maize genome',
              'The colours of the grain and what causes them',
              'Dishes made from maize around the world',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'i', 'Paragraph B: "Maize relies on humans for its propagation" and "Much maize is used for animal feed".', 'B'),
              q(2, 'Paragraph E', 'ii', 'Paragraph E: "Maize is a tall annual grass with a single stem" and "A whole female inflorescence develops into an ear or corncob".', 'E'),
              q(3, 'Paragraph G', 'iii', 'Paragraph G: "it requires nights of a certain length to flower. Flowering further requires enough warm days".', 'G'),
              q(4, 'Paragraph H', 'iv', 'Paragraph H: DIMBOA "provides a measure of protection against a wide range of pests", but the plant "is susceptible to droughts, intolerant of nutrient-deficient soils, and prone to being uprooted by severe winds".', 'H'),
              q(5, 'Paragraph I', 'v', 'Paragraph I: "Barbara McClintock used maize to validate her transposon theory" and "won the 1983 Nobel Prize in Physiology or Medicine".', 'I'),
            ],
          },
          {
            id: 'r78-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Maize was first cultivated in southern Mexico roughly nine thousand years ago.', 'TRUE', 'Paragraph A: "Maize was domesticated by indigenous peoples in southern Mexico about 9,000 years ago from wild teosinte."', 'A'),
              q(7, 'More wheat is grown worldwide than maize.', 'FALSE', 'Paragraph B: "the total production of maize surpassing that of wheat and rice".', 'B'),
              q(8, 'Sweet corn is more profitable for farmers than field corn.', 'NOT GIVEN', 'Paragraph B only says that "Sugar-rich varieties called sweet corn are grown for human consumption, while field corn varieties are used for animal feed" — profitability is not discussed.', 'B'),
              q(9, 'Maize protein contains all the essential amino acids in sufficient quantities.', 'FALSE', 'Paragraph D: "Maize protein is low in some essential amino acids".', 'D'),
            ],
          },
          {
            id: 'r78-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The maize genome</strong></p><ul><li>Maize is diploid, with {{q10}} chromosomes</li><li>Most of its genetic variation comes from its wild ancestor, {{q11}}</li><li>2005: a consortium is formed to sequence the genome; the data is placed in GenBank, a public {{q12}} for genome sequences</li><li>Sequencing is finished in {{q13}}; the genome contains 32,540 genes, and 85% of it consists of transposons</li></ul>',
            questions: [
              q(10, null, '20', 'Paragraph I: "Maize is diploid with 20 chromosomes."', 'I'),
              q(11, null, 'teosinte', 'Paragraph I: "83% of allelic variation within the genome derives from its teosinte ancestors".', 'I'),
              q(12, null, 'repository', 'Paragraph J: "GenBank, a public repository for genome-sequence data".', 'J'),
              q(13, null, '2008', 'Paragraph J: "Sequencing of the maize genome was completed in 2008."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
