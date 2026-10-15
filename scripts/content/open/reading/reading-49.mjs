// Vocably Reading 49 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-49',
  title: 'Reading 49: The Banana',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'banana', title: 'The Banana: Fruit of a Giant Herb', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r49-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, D, E, G, H and J from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'How bananas are harvested and transported',
              'The layers and sections of the fruit',
              'Native regions and leading producers',
              'A naming system that proved inadequate',
              'The nutritional value of bananas',
              'Diseases and the difficulty of creating new varieties',
              'The origins of the names Musa and banana',
              'How the plant is built and what it needs to grow',
              'Banana growing as a source of employment',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'iii', 'Paragraph B: "Musa species are native to tropical Indomalaya and Australia" and "The world\'s largest producers of bananas in 2022 were India and China".', 'B'),
              q(2, 'Paragraph D', 'vi', 'Paragraph D: "Panama disease which is caused by a Fusarium fungus" and "Plant breeders are seeking new varieties, but these are difficult to breed given that commercial varieties are seedless."', 'D'),
              q(3, 'Paragraph E', 'viii', 'Paragraph E: "what appears to be a trunk is actually a pseudostem composed of multiple leaf-stalks" and "Bananas grow in a wide variety of soils".', 'E'),
              q(4, 'Paragraph G', 'ii', 'Paragraph G: "There is a protective outer layer (a peel or skin)" and the flesh "can be split lengthwise into three sections".', 'G'),
              q(5, 'Paragraph H', 'vii', 'Paragraph H: "The name may be derived from Antonius Musa" and the word banana "is thought to be of West African origin".', 'H'),
              q(6, 'Paragraph J', 'iv', 'Paragraph J: "this approach proved to be inadequate for the number of cultivars in the primary center of diversity of the genus".', 'J'),
            ],
          },
          {
            id: 'r49-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(7, 'In botanical terms, the banana is a type of berry.', 'TRUE', 'Paragraph A: "an elongated, edible fruit that is botanically a berry".', 'A'),
              q(8, 'Bananas were probably first domesticated in India.', 'FALSE', 'Paragraph B: "they were probably domesticated in New Guinea".', 'B'),
              q(9, 'Banana plants can be grown in soil less than 60 centimetres deep.', 'FALSE', 'Paragraph E: bananas grow in many soils "as long as it is at least 60 centimetres (2.0 ft) deep".', 'E'),
              q(10, 'Carl Linnaeus studied banana plants in Southeast Asia.', 'NOT GIVEN', 'Paragraph H says "The genus Musa was created by Carl Linnaeus in 1753" but nothing about where he studied the plants.', 'H'),
            ],
          },
          {
            id: 'r49-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Every part of a banana plant that is above the ground grows out of a ______.', 'corm', 'Paragraph E: "All the above-ground parts of a banana plant grow from a structure called a corm."', 'E'),
              q(12, 'A bunch of bananas consists of around nine ______, each holding up to 20 fruits.', ['hands', 'tiers'], 'Paragraph F: "made up of around nine tiers called hands, with up to 20 fruits to a hand".', 'F'),
              q(13, 'The thin fibres running lengthwise beneath the peel are known as ______.', 'vascular bundles', 'Paragraph G: "numerous long, thin strings (vascular bundles), which run lengthwise between the skin and the edible inner white flesh".', 'G'),
              q(14, 'Linnaeus gave plantains the species name Musa ______.', 'paradisiaca', 'Paragraph J: "Musa sapientum for dessert bananas and Musa paradisiaca for plantains".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
