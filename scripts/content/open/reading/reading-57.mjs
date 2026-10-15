// Vocably Reading 57 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-57',
  title: 'Reading 57: A History of the Umbrella',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'umbrella', title: 'Shade and Shelter: A History of the Umbrella', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r57-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs F-J from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'An early umbrella that served as a military emblem',
              'The first umbrella business in America',
              'A gift that introduced umbrellas to an African kingdom',
              'How modern umbrellas block ultraviolet light',
              'Evidence of umbrellas in the art of an ancient civilisation',
              'Ceremonial umbrellas of West African chiefs',
              'Why umbrellas went out of fashion in Britain',
              'A word for umbrella taken from a novel',
            ], true),
            questions: [
              q(1, 'Paragraph F', 'v', 'Paragraph F: "The earliest known umbrellas in Ancient Egyptian art date back to the Fifth Dynasty, around 2450 BC."', 'F'),
              q(2, 'Paragraph G', 'iii', 'Paragraph G: "the umbrella was introduced by the Dutch to the Ashanti, when Osei Kofi Tutu I received one as a gift".', 'G'),
              q(3, 'Paragraph H', 'vi', 'Paragraph H: "the Amanhene (senior chiefs) were using large multicolored umbrellas. Umbrellas were used during festivals as streets of Kumasi were paraded with them."', 'H'),
              q(4, 'Paragraph I', 'i', 'Paragraph I: "an identifying marker that is the equivalent of a modern flag. The pantli was carried by the army general."', 'I'),
              q(5, 'Paragraph J', 'ii', 'Paragraph J: "Beehler Umbrella Factory est. 1828 was the first umbrella manufacturing company in the United States."', 'J'),
            ],
          },
          {
            id: 'r57-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The earliest umbrellas were designed mainly to keep off the rain.', 'FALSE', 'Paragraph A: "Initially, (in the early 1200s) they were used in warmer countries for shade from the sun, but later evolved to also be used for protection from rain."', 'A'),
              q(7, 'Collapsible umbrellas cost more than non-collapsible ones.', 'NOT GIVEN', 'Paragraph B describes "completely collapsible umbrellas" and says umbrellas "are available in a range of price and quality points", but it never links price to the type of umbrella.', 'B'),
              q(8, 'The first recorded use of the word umbrella in English dates from the seventeenth century.', 'TRUE', 'Paragraph C: "The Oxford English Dictionary records the first recorded usage in this sense in 1611."', 'C'),
              q(9, 'The ancient Egyptians valued the umbrella more for its usefulness than for its appearance.', 'TRUE', 'Paragraph F: "the umbrella was generally used throughout Egypt, partly as a mark of distinction, but more on account of its useful than its ornamental qualities".', 'F'),
            ],
          },
          {
            id: 'r57-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The word umbrella comes from a Latin word meaning ______.', ['shadow', 'shade'], 'Paragraph C: "The word umbrella evolved from the Latin umbra, meaning \'shadow\' or \'shade from light\'".', 'C'),
              q(11, 'In French, a paraneige is an umbrella that protects the user from ______.', 'snow', 'Paragraph D: "a parasol shields from sunlight, a parapluie shields from rain, and a paraneige shields from snow".', 'D'),
              q(12, 'In Tenochtitlan, an umbrella made of feathers and ______ played the same role as a flag does today.', 'gold', 'Paragraph I: "an umbrella made from feathers and gold as its pantli, an identifying marker that is the equivalent of a modern flag".', 'I'),
              q(13, 'When the industry was at its height in 1920, Baltimore had ______ umbrella companies.', ['seven', '7'], 'Paragraph J: "at the industry\'s peak in 1920 there were seven umbrella companies in the city producing millions of umbrellas annually".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
