// Vocably Reading 11 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-11',
  title: 'Reading 11: The History of Beekeeping',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'beekeeping', title: 'Keeping Bees: An Ancient Craft', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r11-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a claim that bees kept in towns may be in better condition than those in the countryside', 'B', 'Paragraph B: "Some studies have found city-kept bees are healthier than those in rural settings because there are fewer pesticides and greater biodiversity in cities."', 'B'),
              q(2, 'evidence that one ancient city produced honey on a large scale', 'G', 'Paragraph G: the hives "had a potential annual yield of 500 kilograms (1,100 lb) of honey" and "are evidence an advanced honey industry in Tel Rehov, Israel 3,000 years ago".', 'G'),
              q(3, 'a ruler taking personal credit for bringing bees to his territory', 'E', 'Paragraph E: "Bees that collect honey, which none of my ancestors had ever seen or brought into the land of Suhu, I brought down from the mountain of the men of Habha".', 'E'),
              q(4, 'early advice that the material of a hive affects the honey it produces', 'I', 'Paragraph I: a book by Fan Li has sections "stressing the importance of the quality of the wooden box used and its effects on the quality of the honey".', 'I'),
              q(5, 'a reference to an alcoholic drink made by an ancient civilisation', 'J', 'Paragraph J: "The ancient Maya domesticated a species of stingless bee, which they used for several purposes, including making balché, a mead-like alcoholic drink."', 'J'),
            ],
          },
          {
            id: 'r11-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The oldest honey ever discovered was found in Egypt.', 'FALSE', 'Paragraph C: "In the Borjomi region of Georgia, archaeologists discovered the world\'s oldest known honey, dating back approximately 5,500 years".', 'C'),
              q(7, 'Honey was placed in the burial chambers of some Egyptian rulers.', 'TRUE', 'Paragraph C: "honey was stored in jars, some of which were found in the tombs of pharaohs such as Tutankhamun".', 'C'),
              q(8, 'The hives discovered at Rehov were made of fired clay.', 'FALSE', 'Paragraph G: "Thirty intact hives made of straw and unbaked clay were discovered in the ruins of the city".', 'G'),
              q(9, 'The gold rings found in Crete were worn by priests.', 'NOT GIVEN', 'Paragraph H mentions "owners of gold rings depicting apiculture scenes rather than religious ones", but says nothing about who wore the rings or whether they were priests.', 'H'),
            ],
          },
          {
            id: 'r11-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Early beekeeping</strong></p><ul><li>Earliest artificial hives: hollow logs, wooden boxes, pottery and straw baskets called {{q10}}</li><li>Pottery hives first used about 9,000 years ago in {{q11}}</li><li>18th-century Europe: the {{q12}} hive allowed honey to be taken without killing the colony</li><li>Egypt: temple wall carvings show workers using {{q13}} while taking out honeycombs</li><li>Rehov, Israel: hives arranged in neat rows stacked {{q14}} high</li></ul>',
            questions: [
              q(10, null, 'skeps', 'Paragraph C: "hollow logs, wooden boxes, pottery vessels, and woven straw baskets known as skeps".', 'C'),
              q(11, null, 'North Africa', 'Paragraph C: "Beekeeping in pottery vessels began about 9,000 years ago in North Africa."', 'C'),
              q(12, null, 'movable comb', 'Paragraph C: "allowed the construction of the movable comb hive so honey could be harvested without destroying the entire colony".', 'C'),
              q(13, null, 'smoke', 'Paragraph D: "workers are depicted blowing smoke into hives as they remove honeycombs".', 'D'),
              q(14, null, ['three', '3'], 'Paragraph G: "The hives were found in orderly rows, three high".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
