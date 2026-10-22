// Vocably Reading 128 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-128',
  title: 'Reading 128: Viking Ships',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'viking-ship', title: 'Viking Ships', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r128-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has seven paragraphs, A-G. Which paragraph contains the following information? <em>Write the correct letter, A-G.</em>',
            questions: [
              q(1, 'a reason why travelling over land was difficult in Scandinavia', 'C', 'Paragraph C: "Scandinavia is a region with relatively high inland mountain ranges and dense forests, making inland travel hazardous and cumbersome."', 'C'),
              q(2, 'evidence from early coins of the importance of ships', 'D', 'Paragraph D: "The Hedeby coins, among the earliest known Danish currency, have impressions of ships as emblems, showing the importance of naval vessels in the area."', 'D'),
              q(3, 'a reference to a later type of vessel that was influenced by Viking design', 'E', 'Paragraph E: "The design of the knarr later influenced the design of the cog, used in the Baltic Sea by the Hanseatic League."', 'E'),
              q(4, 'how the gaps between planks were sealed against water', 'G', 'Paragraph G: "a caulking of tarred rope was used between planks to create a waterproof hull".', 'G'),
            ],
          },
          {
            id: 'r128-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'It is certain that Viking ships carried dragon heads at the bow.', 'FALSE', 'Paragraph A: "Some might have had a dragon\'s head or other circular object protruding from the bow and stern for design, although this is only inferred from historical sources."', 'A'),
              q(6, 'Warships could carry more cargo than merchant ships.', 'FALSE', 'Paragraph B: warships were narrow vessels "with less load capacity but higher speed".', 'B'),
              q(7, 'Viking ships were light enough to be carried overland between stretches of water.', 'TRUE', 'Paragraph B: "its light weight enabled it to be carried over portages".', 'B'),
              q(8, 'Ships were being sacrificed as offerings before the Viking Age began.', 'TRUE', 'Paragraph C: "valuable ships were sacrificed as part of ceremonial votive offerings since at least the Nordic Iron Age, as evidenced by the Hjortspring and Nydam boats".', 'C'),
              q(9, 'The Skuldelev 1 ship is now on display in a Danish museum.', 'NOT GIVEN', 'Paragraph E says only that Skuldelev 1 "was excavated in Denmark in 1962 and is believed to be from about 1030 AD"; nothing is said about where it is now.', 'E'),
            ],
          },
          {
            id: 'r128-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'A knarr could cover a distance of ______ miles in a single day.', '75', 'Paragraph E: "It was capable of sailing 75 miles (121 km) in one day and held a crew of about 20–30."', 'E'),
              q(11, 'On a knarr, oars served only as ______ when there was no wind.', 'auxiliaries', 'Paragraph E: knarrs "depended mostly on sail-power, only putting oars to use as auxiliaries if there was no wind on the open water".', 'E'),
              q(12, 'Because it could sail in very shallow water, the karve was also used for ______.', 'coasting', 'Paragraph F: "Because they were able to navigate in very shallow water, they were also used for coasting."', 'F'),
              q(13, 'The mast rested on a heavy block of timber known as a ______.', 'keelson', 'Paragraph G: "The mast was supported by a keelson, a heavy timber block placed on top of the keel."', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
