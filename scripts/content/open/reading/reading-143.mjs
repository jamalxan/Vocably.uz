// Vocably Reading 143 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-143',
  title: 'Reading 143: The Barometer',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'barometer', title: 'The Invention of the Barometer', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r143-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-G</strong>.',
            bank: bank(['Evangelista Torricelli', 'Gasparo Berti', 'René Descartes', 'Giovanni Battista Baliani', 'Galileo Galilei', 'Raffaello Magiotti', 'Robert Hooke']),
            questions: [
              q(1, 'planned an experiment on air pressure but apparently never carried it out', 'C', 'Paragraph C: "René Descartes described the design of an experiment to determine atmospheric pressure as early as 1631, but there is no evidence that he built a working barometer at that time".', 'C'),
              q(2, 'reported that a device for carrying water over a hill had not worked', 'D', 'Paragraph D: "Giovanni Battista Baliani wrote a letter to Galileo Galilei explaining an experiment he had made in which a siphon, led over a hill about 21 m high, failed to work."', 'D'),
              q(3, 'compared the limit of a column of water to a rope that can bear only a certain load', 'E', 'Paragraph D: Galileo "proposed that it was the power of a vacuum that held the water up" and that the force could not hold any more, "like a cord that can support only so much weight".', 'D'),
              q(4, 'thought up the experiment that was later performed in Rome', 'F', 'Paragraph E: "Magiotti devised such an experiment."', 'E'),
              q(5, 'explained the results by the weight of the air rather than the pull of a vacuum', 'A', 'Paragraph G: Torricelli "proposed that the weight of the atmosphere, not an attracting force of the vacuum, held the water in the tube".', 'G'),
            ],
          },
          {
            id: 'r143-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'A barometer and a pressure altimeter are basically the same device.', 'TRUE', 'Paragraph B: "Barometers and pressure altimeters (the most basic and common type of altimeter) are essentially the same instrument, but used for different purposes."', 'B'),
              q(7, 'Middleton believes the barometer was invented earlier than is generally claimed.', 'FALSE', 'Paragraph C: Torricelli is "usually credited with inventing the barometer in 1643, although the historian W. E. Knowles Middleton suggests the more likely date is 1644".', 'C'),
              q(8, 'Hooke\'s marine barometer was used successfully at sea.', 'NOT GIVEN', 'Paragraph C says only that "efforts were made to make it sea-worthy"; whether they succeeded is not stated.', 'C'),
              q(9, 'The precise date of Berti\'s experiment is known.', 'FALSE', 'Paragraph E: "No exact date was given" and Middleton "places the event to sometime between 1639 and 1643".', 'E'),
            ],
          },
          {
            id: 'r143-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'What is the average air pressure at sea level?', ['1013 hPa', '1013', '1013 mbar'], 'Paragraph B: "The average atmospheric pressure at sea level is 1013 hPa (mbar)."', 'B'),
              q(11, 'To which ancient thinker does the theory of horror vacui go back?', 'Aristotle', 'Paragraph D: "This was a restatement of the theory of horror vacui" that nature abhors a vacuum, "which dates to Aristotle".', 'D'),
              q(12, 'At what height did the water in Berti\'s tube stop falling?', ['10.3 m', '10.3 metres', '10.3 meters', '10.3', '34 ft', '34 feet'], 'Paragraph F: "the level of the water inside the tube stayed at an exact level, which happened to be 10.3 m (34 ft)".', 'F'),
              q(13, 'To whom did Torricelli write about the experiments in 1644?', ['Michelangelo Ricci', 'Ricci'], 'Paragraph G: "In a letter to Michelangelo Ricci in 1644 concerning the experiments, he wrote".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
