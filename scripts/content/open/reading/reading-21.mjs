// Vocably Reading 21 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-21',
  title: 'Reading 21: The Compass',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'compass', title: 'Finding the Way: A History of the Compass', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r21-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a reason why an early direction-finding device has not been confirmed by physical evidence', 'G', 'Paragraph G: "archaeologists have yet to discover an actual spoon made of magnetite in a Han tomb".', 'G'),
              q(2, 'how a compass can be read when there is very little light', 'J', 'Paragraph J: key points "are often marked with phosphorescent, photoluminescent, or self-luminous materials to enable the compass to be read at night or in poor light".', 'J'),
              q(3, 'a disagreement among scholars about when the compass was first used', 'I', 'Paragraph I: "others believe that evidence of compasses being used prior to the 11th century is very weak".', 'I'),
              q(4, 'a medical use of a naturally magnetic stone', 'F', 'Paragraph F: "describes using magnetic properties of the lodestone to remove arrows embedded in a person\'s body".', 'F'),
              q(5, 'why it is important to use an up-to-date map', 'E', 'Paragraph E: "The locations of the Earth\'s magnetic poles slowly change with time" so "a map with the latest declination information should be used".', 'E'),
            ],
          },
          {
            id: 'r21-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'On a compass, bearings increase in an anticlockwise direction.', 'FALSE', 'Paragraph B: "north corresponds to 0°, and the angles increase clockwise".', 'B'),
              q(7, 'The compass was originally created in China for predicting the future rather than for finding the way.', 'TRUE', 'Paragraph C: "the magnetic compass was first invented as a device for divination" and only "later adopted for navigation by the Song dynasty Chinese".', 'C'),
              q(8, 'The needle of a magnetic compass settles into position the moment the compass is held level.', 'FALSE', 'Paragraph D: "the needle turns until, after a few seconds to allow oscillations to die out, it settles into its equilibrium orientation".', 'D'),
              q(9, 'Thales of Miletus wrote instructions for making a compass.', 'NOT GIVEN', 'Paragraph F only says the Greeks "credited with discovering lodestone\'s attraction to iron and other lodestones"; nothing is said about him writing instructions for a compass.', 'F'),
              q(10, 'Dry compasses were replaced by liquid-filled compasses in the early twentieth century.', 'TRUE', 'Paragraph H: dry compasses "was supplanted in the early 20th century by the liquid-filled magnetic compass".', 'H'),
            ],
          },
          {
            id: 'r21-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Navigation compasses: early and modern</strong></p><ul><li>China, by 1088: needles made of {{q11}}, magnetised by striking them with a lodestone</li><li>Modern designs: a needle or dial sealed in a capsule full of liquid (lamp oil, mineral oil, alcohol, etc.)</li><li>the liquid helps to {{q12}} the needle\'s movement, so it becomes stable more quickly</li><li>older models had a flexible rubber {{q13}} or an air space inside the capsule to allow for changes in volume</li><li>because the liquid cannot be compressed, many of these compasses work accurately {{q14}}</li></ul>',
            questions: [
              q(11, null, 'iron', 'Paragraph H: "These compasses were made of iron needles, magnetized by striking them with a lodestone."', 'H'),
              q(12, null, 'damp', 'Paragraph J: "The liquid inside the capsule serves to damp the movement of the needle, reducing oscillation time and increasing stability."', 'J'),
              q(13, null, 'diaphragm', 'Paragraph J: "older designs commonly incorporated a flexible rubber diaphragm or airspace inside the capsule to allow for volume changes".', 'J'),
              q(14, null, 'underwater', 'Paragraph J: "As the compass fill liquid is noncompressible under pressure, many ordinary liquid-filled compasses will operate accurately underwater to considerable depths."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
