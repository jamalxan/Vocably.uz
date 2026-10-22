// Vocably Reading 161 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-161',
  title: 'Reading 161: The Alpaca',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'alpaca', title: 'The Alpaca: A Camelid of the Andes', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r161-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a change to the animal\'s scientific name that followed genetic research', 'G', 'Paragraph G: "In 2001, the alpaca genus classification changed from Lama pacos to Vicugna pacos, following the presentation of a paper on work by Miranda Kadwell et al. on alpaca DNA".', 'G'),
              q(2, 'how alpacas express their mood and their position in the group', 'D', 'Paragraph D: "Alpacas communicate through body language, spitting to show dominance when distressed, fearful, or agitated."', 'D'),
              q(3, 'a description of the two kinds of fleece that alpacas produce', 'B', 'Paragraph B: "There are two modern breeds of alpaca, separated based on their respective region of endemism and fiber (wool) type: the Suri alpaca and the Huacaya alpaca."', 'B'),
              q(4, 'the reason early scientists found the four species difficult to classify', 'F', 'Paragraph F: "Classification was complicated by the fact that all four species of South American camelid can interbreed and produce fertile offspring."', 'F'),
              q(5, 'a reference to preserved bodies of ancient domesticated animals', 'K', 'Paragraph K: "the llama and alpaca, have been found mummified in the Moquegua valley, in the South of Peru, dating back 900 to 1000 years".', 'K'),
            ],
          },
          {
            id: 'r161-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Alpacas are now kept only in the Andes.', 'FALSE', 'Paragraph A: "More recently, alpacas may be found on farms and ranches worldwide, with thousands of animals born and raised annually."', 'A'),
              q(7, 'Llamas have long been used to protect other farm animals.', 'TRUE', 'Paragraph C: "llamas have long been more highly prized as livestock guardians (in place of dogs), and as a pack animal".', 'C'),
              q(8, 'Female alpacas tend to be more aggressive than males.', 'FALSE', 'Paragraph D: "Male alpacas are more aggressive than females."', 'D'),
              q(9, 'In the textile trade, the term alpaca may describe cloth made from the hair of other animals.', 'TRUE', 'Paragraph E: "it refers to a style of fabric originally made from alpaca hair, such as mohair, Icelandic sheep wool, or even high-quality wool from other breeds of sheep".', 'E'),
              q(10, 'Male alpacas are generally taller than females.', 'NOT GIVEN', 'Paragraph H gives a general height of "between 81 and 99 centimetres" and a weight range, but says nothing about which sex is taller.', 'H'),
            ],
          },
          {
            id: 'r161-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Origins of the alpaca</strong></p><ul><li>The Moche people of Northern Peru frequently showed alpacas in their {{q11}}</li><li>The alpaca\'s wild ancestor and closest living relative is the {{q12}}</li><li>The family Camelidae first appeared in the Americas during the {{q13}} period</li><li>Remains of wild camelids found across Peru are around {{q14}} years old</li></ul>',
            questions: [
              q(11, null, 'art', 'Paragraph I: "The Moche people of Northern Peru often used alpaca images in their art."', 'I'),
              q(12, null, ['vicuña', 'vicuna'], 'Paragraph I: "its closest living relative, the vicuña (also native to South America), is the wild ancestor of the alpaca".', 'I'),
              q(13, null, 'Eocene', 'Paragraph J: "The family Camelidae first appeared in the Americas 40–45 million years ago, during the Eocene period".', 'J'),
              q(14, null, '12,000', 'Paragraph K: "Remains of vicuña and guanaco dating around 12,000 years have been found throughout Peru."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
