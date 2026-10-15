// Vocably Reading 67 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-67',
  title: 'Reading 67: The Sewing Machine',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sewing-machine', title: 'Inventing the Sewing Machine', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r67-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of inventors below. Match each statement with the correct inventor, <strong>A-F</strong>.<br/><strong>NB</strong> There is one extra inventor you will not need.',
            bank: bank(['Charles Fredrick Wiesenthal', 'Thomas Saint', 'William Newton Wilson', 'Josef Madersperger', 'Barthélemy Thimonnier', 'Walter Hunt']),
            questions: [
              q(1, 'received money from the state to develop his machine', 'D', 'Paragraph F: "Having received financial support from his government, the Austrian tailor worked on the development of his machine until 1839".', 'F'),
              q(2, 'was granted the earliest British patent for a device to help with sewing', 'A', 'Paragraph C: Wiesenthal "was awarded the first British patent for a mechanical device to aid the art of sewing, in 1755".', 'C'),
              q(3, 'built a working machine from another inventor\'s drawings', 'C', 'Paragraph E: "William Newton Wilson, found Saint\'s drawings in the UK Patent Office, made adjustments to the looper, and built a working machine".', 'E'),
              q(4, 'waited many years before patenting his invention', 'F', 'Paragraph H: Hunt "sold individual machines without bothering to patent his invention, and only patenting it at a late date of 1854".', 'H'),
              q(5, 'opened a factory producing clothing for soldiers', 'E', 'Paragraph G: Thimonnier and his partners "opened the first machine-based clothing manufacturing company in the world to create army uniforms for the French Army".', 'G'),
            ],
          },
          {
            id: 'r67-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Electric sewing machines appeared before machines driven by a foot treadle.', 'FALSE', 'Paragraph B: early machines used "a foot-operated treadle mechanism. Electrically-powered machines were later introduced."', 'B'),
              q(7, 'Saint designed his machine for use on tough materials such as leather.', 'TRUE', 'Paragraph D: "His machine was meant to be used on leather and canvas material, such as the soles of shoes."', 'D'),
              q(8, 'Thimonnier\'s factory was destroyed by a fire started by his business partner.', 'FALSE', 'Paragraph G: "the factory was burned down, reportedly by workers fearful of losing their livelihood".', 'G'),
              q(9, 'Walter Hunt made a large profit from selling his machines.', 'NOT GIVEN', 'Paragraph H says Hunt "sold individual machines without bothering to patent his invention" but says nothing about how much money he made.', 'H'),
            ],
          },
          {
            id: 'r67-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Saint\'s machine used a single thread to produce a ______.', 'chain stitch', 'Paragraph E: "His sewing machine used the chain stitch method, in which the machine uses a single thread to make simple stitches in the fabric."', 'E'),
              q(11, 'In 1804 John Duncan built a machine in Scotland that was designed for ______.', 'embroidering', 'Paragraph F: "a machine for embroidering was constructed by John Duncan in Scotland".', 'F'),
              q(12, 'Thimonnier\'s first machine was built of ______, although a later version was made of metal.', 'wood', 'Paragraph G: "Thimonnier\'s original machine was made of wood, but a later version was metal."', 'G'),
              q(13, 'In Hunt\'s machine, the lower thread was carried by a falling ______.', 'shuttle', 'Paragraph H: "a falling shuttle carrying the lower thread".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
