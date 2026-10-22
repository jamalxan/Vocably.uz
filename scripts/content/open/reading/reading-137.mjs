// Vocably Reading 137 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-137',
  title: 'Reading 137: The Zipper',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'zipper', title: 'A Fastener Called the Zipper', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r137-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-D</strong>. <em>You may use any letter more than once.</em>',
            bank: bank(['Elias Howe', 'Whitcomb L. Judson', 'Lewis Walker', 'Gideon Sundbäck']),
            questions: [
              q(1, 'took out a patent in Germany', 'D', 'Paragraph J: "in 1909, he registered a patent in Germany".', 'J'),
              q(2, 'provided business support for a company set up to manufacture the fastener', 'C', 'Paragraph I: "With the support of businessman Colonel Lewis Walker, Judson launched the Universal Fastener Company to manufacture the new device."', 'I'),
              q(3, 'patented a fastening that worked more like a drawstring', 'A', 'Paragraph H: "Howe\'s device was more like an elaborate drawstring than a true slide fastener."', 'H'),
              q(4, 'showed an invention at an international exhibition without much success', 'B', 'Paragraph I: "He exhibited his clasp-locker at the World\'s Fair in Chicago of 1893 but the invention received minimal public attention."', 'I'),
              q(5, 'is wrongly believed to have come from Canada', 'D', 'Paragraph J: "Sundbäck\'s work with this firm has led to the common misperception that he was Canadian".', 'J'),
            ],
          },
          {
            id: 'r137-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The word \'zipper\' was originally the brand name of a type of footwear.', 'TRUE', 'Paragraph B: "The zipper gets its name from a brand of rubber boots (or galoshes) it was used on in 1923."', 'B'),
              q(7, 'The teeth of a zipper are always separate, individual pieces.', 'FALSE', 'Paragraph C: "The teeth may be individually discrete or shaped from a continuous coil".', 'C'),
              q(8, 'Replacing a broken zipper is usually cheap and simple.', 'FALSE', 'Paragraph G: repair or replacement "can be quite difficult and expensive".', 'G'),
              q(9, 'Elias Howe made a fortune from his sewing machine.', 'NOT GIVEN', 'Paragraph H says Howe turned to fasteners "after his sewing machine became widely popular" but says nothing about how much money he made.', 'H'),
            ],
          },
          {
            id: 'r137-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How a zipper works</strong></p><ul><li>a {{q10}} moves along two rows of metal or plastic teeth</li><li>inside it is a channel shaped like the letter {{q11}}, which either meshes the teeth together or pulls them apart</li><li>the word \'zipper\' is {{q12}}: it imitates the sound the device makes</li><li>jackets with two sliders: raising the lower one makes sitting or cycling more comfortable; when both are lowered the zipper can be completely {{q13}}</li></ul>',
            questions: [
              q(10, null, 'slider', 'Paragraph C: "A zipper consists of a slider mounted on two rows of metal or plastic teeth".', 'C'),
              q(11, null, ['Y', 'Y-shaped'], 'Paragraph C: "The slider, usually operated by hand, contains a Y-shaped channel".', 'C'),
              q(12, null, 'onomatopoetic', 'Paragraph C: "The word zipper is onomatopoetic, as the device makes a high-pitched zip when used."', 'C'),
              q(13, null, 'separated', 'Paragraph D: "When both sliders are lowered then the zipper may be totally separated."', 'D'),
            ],
          },
        ],
      }),
    ],
  },
};
