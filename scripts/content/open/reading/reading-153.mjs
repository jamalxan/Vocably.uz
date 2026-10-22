// Vocably Reading 153 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-153',
  title: 'Reading 153: Sloths',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sloth', title: 'The Sloth: Life in the Slow Lane', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r153-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs B, C, D, G and H from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'Why sloths are poor swimmers',
              'Two living groups with separate origins, and the giants that disappeared',
              'The ancient roots of the wider group to which sloths belong',
              'Similar lifestyles reached by different evolutionary routes',
              'Threats to sloths from the loss of forest',
              'Spreading to new lands by water',
              'How sloths got their name and why being slow pays',
              'What modern tree sloths eat',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "The two groups of sloths are from different, distantly related families" and "many species of ground sloths ranging up to the size of elephants" that "became extinct during the Quaternary extinction event".', 'B'),
              q(2, 'Paragraph C', 'vii', 'Paragraph C: "Sloths are so named because of their very low metabolism and deliberate movements" and "Their slowness permits their low-energy diet of leaves and avoids detection by predatory hawks and cats".', 'C'),
              q(3, 'Paragraph D', 'iii', 'Paragraph D: "Sloths belong to the superorder Xenarthra, a group of placental mammals believed to have evolved in the continent of South America around 60 million years ago."', 'D'),
              q(4, 'Paragraph G', 'iv', 'Paragraph G: the similarities between the two genera are "an example of convergent evolution to an arboreal lifestyle".', 'G'),
              q(5, 'Paragraph H', 'vi', 'Paragraph H: "It is thought that swimming led to oceanic dispersal of pilosans to the Greater Antilles" and sloths "eventually spread to a number of the Caribbean islands as well as North America".', 'H'),
            ],
          },
          {
            id: 'r153-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Every living sloth has three toes on each of its back legs.', 'TRUE', 'Paragraph B: "all sloths have three toes on each rear limb".', 'B'),
              q(7, 'Scientists agree that human hunting alone wiped out the ground sloths.', 'FALSE', 'Paragraph B: "The extinction correlates in time with the arrival of humans, but climate change has also been suggested to have contributed."', 'B'),
              q(8, 'The algae that live in a sloth\'s coat damage its health.', 'FALSE', 'Paragraph C: the hair hosts "symbiotic green algae which camouflage the animal in the trees and provide it nutrients".', 'C'),
              q(9, 'Hoffmann\'s two-toed sloth is more numerous in Honduras than in Bolivia.', 'NOT GIVEN', 'Paragraph F describes the two ranges, "One population is found from eastern Honduras in the north to western Ecuador in the south", but gives no information about how many animals live in each.', 'F'),
            ],
          },
          {
            id: 'r153-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Sloths are believed to be most closely related to ______.', 'anteaters', 'Paragraph A: "Sloths are considered to be most closely related to anteaters".', 'A'),
              q(11, 'The Caribbean sloths died out roughly ______ years ago, after people settled the islands.', ['6,000', '6000'], 'Paragraph B: Caribbean sloths "became extinct after humans settled the archipelago in the mid-Holocene, around 6,000 years ago".', 'B'),
              q(12, 'The names Folivora and Pilosa come from Latin words meaning ______ and \'hairy\'.', 'leaf eater', 'Paragraph D: "These names are from the Latin \'leaf eater\' and \'hairy\', respectively."', 'D'),
              q(13, 'The pale-throated and brown-throated three-toed sloths separated about ______ years ago.', ['six million', '6 million'], 'Paragraph E: "Genetic evidence indicates the two species diverged around six million years ago."', 'E'),
              q(14, 'Thalassocnus eventually became a specialist feeder on ______ from the sea floor.', 'seagrasses', 'Paragraph H: Thalassocnus evolved into "swimming creatures, becoming specialist bottom feeders of seagrasses".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
