// Vocably Reading 120 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-120',
  title: 'Reading 120: Amber',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'amber', title: 'Amber: Tears of the Sun', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r120-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs C, D, E, F and H from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'The origin of the English word',
              'A second meaning that eventually took over',
              'A possible reason why two substances were confused',
              'Amber in Greek myth and the roots of a modern scientific term',
              'Where the amber island may have been and how amber was traded',
              'How amber is mined today',
              'Famous pieces of amber jewellery',
              'Why amber was valued in folk medicine',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'i', 'Paragraph C: "The English word amber derives from Arabic" and "The word referred to what is now known as ambergris".', 'C'),
              q(2, 'Paragraph D', 'ii', 'Paragraph D: "the sense of the word was extended to Baltic amber (fossil resin)" and "As the use of ambergris waned, this became the main sense of the word."', 'D'),
              q(3, 'Paragraph E', 'iii', 'Paragraph E: the two substances "conceivably became associated or confused because they both were found washed up on beaches".', 'E'),
              q(4, 'Paragraph F', 'iv', 'Paragraph F: "According to myth, when Phaëton, son of Helios (the Sun), was killed his mourning sisters became poplar trees, and their tears became elektron, amber" and "The word elektron gave rise to the words electric, electricity, and their relatives".', 'F'),
              q(5, 'Paragraph H', 'v', 'Paragraph H: "the island could have been Heligoland, Zealand, the shores of Gdańsk Bay, the Sambia Peninsula or the Curonian Lagoon" and "There were well-established trade routes for amber connecting the Baltic with the Mediterranean".', 'H'),
            ],
          },
          {
            id: 'r120-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Amber has been worked as a gemstone since the Neolithic period.', 'FALSE', 'Paragraph A: amber has been appreciated "since Neolithic times, and worked as a gemstone since classical antiquity".', 'A'),
              q(7, 'Ambrite is the term for amber found in coal seams in New Zealand.', 'TRUE', 'Paragraph B: "the term ambrite is applied to that found specifically within New Zealand coal seams".', 'B'),
              q(8, 'Theophrastus was the first writer to describe amber.', 'NOT GIVEN', 'Paragraph G says that "Theophrastus discussed amber in the 4th century BCE" but does not say whether anyone had written about it before him.', 'G'),
              q(9, 'Pliny recorded only those explanations that linked amber to the sun.', 'FALSE', 'Paragraph J: "Pliny cites opinions that are well aware of its origin in tree resin".', 'J'),
            ],
          },
          {
            id: 'r120-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Ancient accounts of amber</strong></p><p>The Greek traveller Pytheas, whose own book has not survived, is quoted by Pliny as reporting that amber was thrown up by the waves in {{q10}} on the shores of an island called Abalus, and that the people living there burned it as {{q11}} and sold it to their neighbours. Pliny also records the opinion of Nicias that amber was a liquid created by the rays of the {{q12}}, carried away by the tides and left on the coast of Germany. Elsewhere, however, Pliny gives the Latin name succinum, which comes from a word meaning {{q13}}, showing that the Romans were aware that amber came from trees.</p>',
            questions: [
              q(10, null, 'spring', 'Paragraph G: "amber is thrown up by the waves in spring, it being an excretion of the sea in a concrete form".', 'G'),
              q(11, null, 'fuel', 'Paragraph G: "the inhabitants use this amber by way of fuel, and sell it to their neighbors, the Teutones".', 'G'),
              q(12, null, 'sun', 'Paragraph J: Nicias held that amber is "a liquid produced by the rays of the sun".', 'J'),
              q(13, null, 'juice', 'Paragraph J: "citing the native Latin name of succinum" and its derivation "from sucus" meaning juice.', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
