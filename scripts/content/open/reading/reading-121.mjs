// Vocably Reading 121 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-121',
  title: 'Reading 121: The Metric System',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'metric-system', title: 'The Metric System', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r121-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a list of the seven quantities on which the modern system is built', 'B', 'Paragraph B: "the modern definition in the International System of Units prescribes the metric prefixes and seven base units: metre (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), and candela (cd)".', 'B'),
              q(2, 'an example of a unit whose scale is offset from that of a base unit', 'C', 'Paragraph C: degrees Celsius "is a shifted scale derived from the kelvin (273.15 K is equal to 0 °C while 1 K interval is same to the 1 °C interval)".', 'C'),
              q(3, 'a reference to the country where the metre was first introduced', 'G', 'Paragraph G: "The decimalised system is based on the metre, which had been introduced in France in the 1790s."', 'G'),
              q(4, 'a statement that a unit outside the SI is still in common use', 'E', 'Paragraph E: "Particular non-SI units such as the litre remain widely used."', 'E'),
              q(5, 'an explanation of what two common prefixes mean', 'F', 'Paragraph F: "The prefix kilo, for example, implies a factor of 1000 (103), and the prefix milli implies a factor of 1/1000 (10−3)."', 'F'),
            ],
          },
          {
            id: 'r121-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The SI is the only metric system that enjoys wide acceptance.', 'FALSE', 'Paragraph A: "there are other widely accepted systems (less popular than SI) mainly used in specific fields".', 'A'),
              q(7, 'Gaussian units are mainly used in the field of electromagnetism.', 'TRUE', 'Paragraph A: other systems are "mainly used in specific fields, such as the Gaussian units for electromagnetism".', 'A'),
              q(8, 'The metre-tonne-second system is used more often today than the centimetre-gram-second system.', 'NOT GIVEN', 'Paragraph E lists both systems and says only that "some of these systems are still used in limited contexts"; it does not compare how often they are used.', 'E'),
              q(9, 'The SI was defined in the nineteenth century.', 'FALSE', 'Paragraph G: the development "culminated in the definition of the International System of Units (SI) in the mid-20th century".', 'G'),
            ],
          },
          {
            id: 'r121-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Principles of metric systems</strong></p><ul><li>A set of independent dimensions, known as {{q10}}, is chosen so that every natural quantity can be expressed</li><li>Derived units are {{q11}}: they involve only products of powers of the base units</li><li>Unit of mass: the {{q12}} or a decimal multiple of it</li><li>Relationships between base and derived units are {{q13}} rather than empirical</li></ul>',
            questions: [
              q(10, null, 'base quantities', 'Paragraph H: "A set of independent dimensions of nature is selected, in terms of which all natural quantities can be expressed, called base quantities."', 'H'),
              q(11, null, 'coherent', 'Paragraph H: "These derived units are coherent, which means that they involve only products of powers of the base units, without any further factors."', 'H'),
              q(12, null, 'gram', 'Paragraph H: "the unit of mass should be the gram or a decimal multiple of it".', 'H'),
              q(13, null, 'logical', 'Paragraph K: "derived units built from base units using logical rather than empirical relationships".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
