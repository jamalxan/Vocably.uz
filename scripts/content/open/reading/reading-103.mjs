// Vocably Reading 103 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-103',
  title: 'Reading 103: Ferns',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'fern', title: 'The Life of Ferns', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r103-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs B, C, I, J and K from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Why ferns are of great economic value',
              'Dating the origin of ferns and of their most diverse order',
              'How a fern leaf opens and where its spores are produced',
              'How ferns differ from seed plants and from mosses',
              'The size and shape of the prothallus',
              'Weeds, poisons and minor uses',
              'Three ways of arranging fertile and sterile leaves',
              'Ferns that grow as tall as trees',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "The fern crown group is estimated to have originated c. 423 million years ago" and "Polypodiales, the group that makes up 80% of living fern diversity, did not appear and diversify until the Cretaceous".', 'B'),
              q(2, 'Paragraph C', 'vi', 'Paragraph C: bracken and water fern "are significant weeds worldwide, and brackens are carcinogenic", while "Ferns are not of major economic importance, but some are used as food, medicine, and ornamental plants".', 'C'),
              q(3, 'Paragraph I', 'iv', 'Paragraph I: "Ferns differ from spermatophytes in that they reproduce by spores rather than by seeds" and "they also differ from spore-producing bryophytes".', 'I'),
              q(4, 'Paragraph J', 'iii', 'Paragraph J: "new leaves typically expand by the unrolling of a tight spiral called a crozier or fiddlehead into fronds" and "Fern spores are borne in sporangia which are usually clustered to form sori".', 'J'),
              q(5, 'Paragraph K', 'vii', 'Paragraph K: "In monomorphic ferns, the fertile and sterile leaves look morphologically the same", "In hemidimorphic ferns, just a portion of the fertile leaf is different" and "In dimorphic (holomorphic) ferns, the two types of leaves are morphologically distinct".', 'K'),
            ],
          },
          {
            id: 'r103-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'In ferns, the sporophyte is the stage that dominates the life cycle.', 'TRUE', 'Paragraph D: "the sporophyte is the dominant phase of the alternation of generations expressed by all land plants".', 'D'),
              q(7, 'Each archegonium releases several egg cells.', 'FALSE', 'Paragraph E: the prothallus produces "archegonia, which release a single oosphere (egg cell)".', 'E'),
              q(8, 'A fern gametophyte can sometimes develop features that normally belong to the sporophyte.', 'TRUE', 'Paragraph F: "Sometimes a gametophyte can give rise to sporophyte traits like roots or sporangia independently from the sporophyte."', 'F'),
              q(9, 'The majority of fern species keep their leaves all year round.', 'NOT GIVEN', 'Paragraph I says "Their foliage may be deciduous or evergreen, and some are semi-evergreen depending on the climate" but gives no information about which type is most common.', 'I'),
            ],
          },
          {
            id: 'r103-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'A young fern gametophyte is held to the soil by structures called ______.', 'rhizoids', 'Paragraph D: the prothallus "is anchored to the ground by rhizoids".', 'D'),
              q(11, 'Unlike those of seed plants, fern gametophytes live independently and resemble ______.', 'liverworts', 'Paragraph G: "They are free-living and resemble liverworts".', 'G'),
              q(12, 'In its early growth the heart- or kidney-shaped prothallus is only one ______ thick.', 'cell layer', 'Paragraph H: "the initial growth of which is planar in one cell layer".', 'H'),
              q(13, 'The unrolling of a new fern leaf is known as circinate ______.', 'vernation', 'Paragraph J: "This uncurling of the leaf is termed circinate vernation."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
