// Vocably Reading 126 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-126',
  title: 'Reading 126: Mycorrhiza',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'mycorrhiza', title: 'Mycorrhiza: The Partnership of Fungi and Plants', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r126-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The word mycorrhiza is built from Greek words for fungus and root.', 'TRUE', 'Paragraph A: "from Ancient Greek μύκης (múkēs) \'fungus\' and ῥίζα (rhíza) \'root\'".', 'A'),
              q(2, 'The relationship between the fungus and the plant is always beneficial to both partners.', 'FALSE', 'Paragraph B: "In particular species, or in particular circumstances, mycorrhizae may have a parasitic association with host plants."', 'B'),
              q(3, 'Every plant family is capable of forming mycorrhizal associations.', 'FALSE', 'Paragraph C: "Most plant species form mycorrhizal associations, though some families like Brassicaceae and Chenopodiaceae cannot."', 'C'),
              q(4, 'Kamieński studied a plant that depended on fungi linked to nearby trees.', 'TRUE', 'Paragraph D: "Franciszek Kamieński had shown that the plant Monotropa hypopitys relied on fungi from neighboring trees for nutrition".', 'D'),
              q(5, 'Sequencing the genome of Laccaria bicolor took several years.', 'NOT GIVEN', 'Paragraph F says it "became the first ectomycorrhizal fungus to have its genome sequenced in 2008" but gives no information about how long the work took.', 'F'),
            ],
          },
          {
            id: 'r126-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Type of association', 'Age of the evidence', 'Details'],
              [
                ['mycorrhiza-like (para-mycorrhizal)', '{{q6}} million years (fossil)', 'Rhynie chert; the plants had no roots'],
                ['arbuscular, in plant roots', '315-303 million years (fossil)', 'in the roots of a giant {{q7}} and an early relative of the conifers'],
                ['ectomycorrhizal', '48.7 million years (fossil)', 'fungi colonising the roots of {{q8}}'],
                ['ericoid', 'about {{q9}} million years (molecular estimate)', 'evolved from free-living saprotrophic ancestors'],
              ],
              'The fossil history of mycorrhizae',
            ),
            questions: [
              q(6, null, '407', 'Paragraph H: "The earliest direct fossil evidence of early mycorrhizal symbiosis is found in the 407 million year old Rhynie chert".', 'H'),
              q(7, null, 'lycophyte', 'Paragraph I: "in the root systems of a giant lycophyte, Lepidodendron, and an early relative of the conifers, Cordaites".', 'I'),
              q(8, null, 'Pinus', 'Paragraph J: "Ectomycorrhizae appear in the fossil record 48.7 million years ago, in the Eocene, with a fossil of ectomycorrhizal fungi colonizing Pinus roots."', 'J'),
              q(9, null, '118', 'Paragraph K: "evolving around 118 million years ago from free-living saprotrophic ancestors".', 'K'),
            ],
          },
          {
            id: 'r126-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'What proportion of plant species form the arbuscular type of association?', ['70%', '70 percent'], 'Paragraph C: "The most common is the arbuscular type that is present in 70% of plant species".', 'C'),
              q(11, 'Which key nutrient could early land plants not have taken up without their fungal partners?', 'phosphate', 'Paragraph G: "early terrestrial plants would have been incapable of absorbing recalcitrant ions from mineral substrates, such as phosphate, a key nutrient for plant growth".', 'G'),
              q(12, 'In which geological period did ectomycorrhizae first develop?', ['Jurassic', 'the Jurassic period', 'Jurassic period', 'mid Jurassic'], 'Paragraph J: "Ectomycorrhizae developed substantially later, during the Jurassic period".', 'J'),
              q(13, 'What method is used to date the origin of mycorrhizal types that have left no fossils?', ['calibrated molecular phylogeny', 'molecular phylogeny'], 'Paragraph K: "Calibrated molecular phylogeny is used to estimate when these mycorrhizal types originated."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
