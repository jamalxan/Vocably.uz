// Vocably Reading 39 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-39',
  title: 'Reading 39: Life in the Oasis',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'oasis', title: 'Life in the Oasis', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r39-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'a comment on how small the total area of oases is compared with the world\'s deserts', 'E', 'Paragraph E: "The stark ratio of oasis to desert land in the world" means that the ecosystem is "relatively minute, rare and precious".', 'E'),
              q(2, 'an explanation of how birds help to create an oasis', 'D', 'Paragraph D: "Any incidence of water is then used by migrating birds, which also pass seeds with their droppings which will grow at the water\'s edge forming an oasis."', 'D'),
              q(3, 'the origin of the word oasis', 'B', 'Paragraph B: "The word oasis came into English from Latin: oasis, from Greek".', 'B'),
              q(4, 'a description of how plants in an oasis are arranged in layers', 'K', 'Paragraph K: the date palm "forms the upper layer", smaller trees "form the middle layer" and vegetables and cereals "are grown in the bottom layer where there is more moisture".', 'K'),
              q(5, 'examples of oases that controlled trade across the Sahara', 'G', 'Paragraph G: "the oases of Awjila, Ghadames and Kufra, situated in modern-day Libya, have at various times been vital to both north–south and east–west trade in the Sahara Desert".', 'G'),
            ],
          },
          {
            id: 'r39-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How an oasis is kept alive</strong></p><p>Oases depend on natural sources of fresh water such as springs, underground rivers or {{q6}}, but water alone is not enough to create them. Continuous human effort is needed: people dig and look after wells and {{q7}}, and they keep removing unwanted {{q8}} that would otherwise consume the water and fertility needed for food. In Oman, oases lying below plateaus are watered by springs or by tunnel systems known as {{q9}}, which have never developed a serious problem with salt.</p>',
            questions: [
              q(6, null, 'aquifers', 'Paragraph C: "Oases are made when sources of freshwater, such as springs, underground rivers, or aquifers irrigate the surface naturally or via man-made wells."', 'C'),
              q(7, null, 'canals', 'Paragraph C: "digging and maintaining wells, digging and maintaining canals".', 'C'),
              q(8, null, ['plants', 'opportunistic plants'], 'Paragraph C: "continuously removing opportunistic plants that threaten to gorge themselves on water and fertility needed to maintain human and animal food supplies".', 'C'),
              q(9, null, 'aflaj', 'Paragraph I: these oases are watered "either by springs or by aflaj, tunnel systems dug into the ground or carved into the rock to tap underground aquifers".', 'I'),
            ],
          },
          {
            id: 'r39-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Most oases exist without any human involvement.', 'FALSE', 'Paragraph A: "most oases, as we know them, are artificial".', 'A'),
              q(11, 'The oases of West Asia and North Africa support about ten million people.', 'TRUE', 'Paragraph E: "they support the livelihood of about 10 million inhabitants".', 'E'),
              q(12, 'Ein Gedi is the oldest oasis settlement that archaeologists have found.', 'NOT GIVEN', 'Paragraph F says digs at Ein Gedi "have found evidence of settlement dating to 6,000 BC" but does not claim it is the oldest such settlement.', 'F'),
              q(13, 'The palm trees that dominate the Palm Oases of North America were introduced from elsewhere.', 'FALSE', 'Paragraph J: the habitat "has the native California fan palm as the overstory species".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
