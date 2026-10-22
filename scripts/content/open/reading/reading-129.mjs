// Vocably Reading 129 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-129',
  title: 'Reading 129: Bubble Wrap',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'bubble-wrap', title: 'Bubble Wrap', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r129-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Write the correct letter, A-J.</em>',
            questions: [
              q(1, 'how the product came into being by accident', 'B', 'Paragraph B: "Although the idea was a failure, they found that what they made could be used as packing material."', 'B'),
              q(2, 'a version of the product designed to take up less room during transport', 'F', 'Paragraph F: "This allows the wrap to be shipped flat to retailers (taking up around 1/50 of the space in transit)".', 'F'),
              q(3, 'a reference to a fictional character who talks about bubble wrap', 'I', 'Paragraph I: "the character Arnold Rimmer mentions how bubble wrap was painted red and marketed as a \'tension sheet\'".', 'I'),
              q(4, 'the origin of an annual celebration of bubble wrap', 'H', 'Paragraph H: "The last Monday of January was designated as Bubble Wrap Appreciation Day after a radio station in Bloomington, Indiana received a shipment of microphones wrapped in bubble wrap".', 'H'),
              q(5, 'a special kind of wrap used when sending electronic parts', 'E', 'Paragraph E: "when shipping sensitive electronic parts and components, a type of bubble wrap is used that employs an antistatic plastic that dissipates static charge".', 'E'),
            ],
          },
          {
            id: 'r129-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Fielding and Chavannes originally set out to design a packing material.', 'FALSE', 'Paragraph B: they "were attempting to create a three-dimensional plastic wallpaper".', 'B'),
              q(7, 'A single layer of bubble wrap is sufficient to protect an object from vibration.', 'FALSE', 'Paragraph C: "Multiple layers may be needed to provide shock and vibration isolation, while a single layer may simply be used as a surface protective layer."', 'C'),
              q(8, 'Most customers who received the IBM 1401 computers had not seen bubble wrap before.', 'TRUE', 'Paragraph E: "the shipping of the new IBM 1401 computers to customers, most of whom had never seen this packing material before".', 'E'),
              q(9, 'iBubble Wrap has sold better than the traditional product.', 'NOT GIVEN', 'Paragraph F describes the design, whose bubbles "are connected in strips", but says nothing about how well it has sold.', 'F'),
            ],
          },
          {
            id: 'r129-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'What material is bubble wrap most commonly made from?', ['polyethylene', 'low-density polyethylene', 'polyethylene film'], 'Paragraph D: "Bubble wrap is most often formed from polyethylene (low-density polyethylene) film".', 'D'),
              q(11, 'What is the most common size of bubble?', ['1 centimeter', '1 centimetre', '1 cm', 'one centimeter'], 'Paragraph E: "The most common bubble size is 1 centimeter."', 'E'),
              q(12, 'Which electronic toy imitates the popping of bubble wrap?', ['Mugen Puchipuchi', 'the Mugen Puchipuchi'], 'Paragraph G: "the Mugen Puchipuchi is a compact electronic toy simulating bubble wrap popping".', 'G'),
              q(13, 'What kind of paper is honeycomb paper made of?', ['Kraft paper', 'Kraft'], 'Paragraph J: "honeycomb paper, also known as hive wrap made of Kraft paper with parting lines allowing the paper to be stretched without breaking".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
