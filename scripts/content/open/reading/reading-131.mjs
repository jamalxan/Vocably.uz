// Vocably Reading 131 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-131',
  title: 'Reading 131: The Thermometer',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'thermometer', title: 'Measuring Heat: The Long Birth of the Thermometer', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r131-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Philo of Byzantium', 'Hero of Alexandria', 'Galen', 'Johann Hasler', 'Santorio Santorio', 'Giuseppe Biancani']),
            questions: [
              q(1, 'published the earliest clear drawing of a thermoscope', 'F', 'Paragraph J: "The first clear diagram of a thermoscope was published in 1617 by Giuseppe Biancani".', 'J'),
              q(2, 'used a scale of degrees to work out how much medicine to give patients', 'D', 'Paragraph F: Johann Hasler "developed body temperature scales based on Galen\'s theory of degrees to help him mix the appropriate amount of medicine for patients".', 'F'),
              q(3, 'described an experiment in which heated air forced bubbles out of a sphere', 'A', 'Paragraph D: in Philo\'s experiment "expanding air exits the sphere and generates bubbles in the vessel".', 'D'),
              q(4, 'proposed a reference point made from equal quantities of ice and boiling water', 'C', 'Paragraph F: Galen "also conceived of a fixed reference temperature, a mixture of equal amounts of ice and boiling water".', 'F'),
              q(5, 'wrote a text that was eventually studied by Galileo', 'B', 'Paragraph E: Hero\'s "Translations of the ancient work Pneumatics were introduced to late 16th century Italy and studied by many, including Galileo Galilei, who had read it by 1594".', 'E'),
            ],
          },
          {
            id: 'r131-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The readings of two different thermometers can only be compared if both follow the same agreed scale.', 'TRUE', 'Paragraph B: "the readings on two thermometers cannot be compared unless they conform to an agreed scale".', 'B'),
              q(7, 'Historians agree that the thermometer was invented by one individual on a known date.', 'FALSE', 'Paragraph C: "Sparse and conflicting historical records make it difficult to pinpoint the invention of the thermometer to any single person or date with certitude."', 'C'),
              q(8, 'Hero of Alexandria\'s fountain was more complex than Philo\'s device.', 'TRUE', 'Paragraph E: Hero\'s fountain was "a more elaborate version of Philo\'s pneumatic experiment".', 'E'),
              q(9, 'Galileo and Santorio worked together on their devices.', 'NOT GIVEN', 'Paragraph G says that "several European scientists, notably Galileo Galilei and Italian physiologist Santorio Santorio, developed devices" of this kind, but says nothing about the two men working together.', 'G'),
            ],
          },
          {
            id: 'r131-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The currently recognised official temperature scale dates from ______.', '1990', 'Paragraph B: "The most recent official temperature scale is the International Temperature Scale of 1990."', 'B'),
              q(11, 'A device that shows changes in heat but has no numerical scale is called a ______.', 'thermoscope', 'Paragraph G: "Such devices, with no scale for assigning a numerical value to the height of the liquid, are referred to as a thermoscope".', 'G'),
              q(12, 'Middleton listed Cornelis Drebbel and the British mathematician ______ among the possible inventors, alongside Galileo and Santorio.', 'Robert Fludd', 'Paragraph I: "the possible inventors of the thermometer are Galileo, Santorio, Dutch inventor Cornelis Drebbel, or British mathematician Robert Fludd".', 'I'),
              q(13, 'Santorio\'s 1625 device, in which air moved a column of water, would today be classed as an ______.', 'air thermometer', 'Paragraph J: "so it was what we would now call an air thermometer".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
