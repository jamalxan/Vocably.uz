// Vocably Reading 71 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-71',
  title: 'Reading 71: The Northern and Southern Lights',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'aurora', title: 'The Northern and Southern Lights', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r71-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'how much advance warning an aurora forecast can provide', 'I', 'Paragraph I: the NOAA forecast is "driven by solar-wind measurements at the L1 point and giving 30 to 90 minutes of lead time".', 'I'),
              q(2, 'a reference to mythological figures behind the names of the two kinds of aurora', 'D', 'Paragraph D: "The words borealis and australis are derived from the names of the ancient gods of the north wind (Boreas) and the south wind".', 'D'),
              q(3, 'the year in which a Latin term became part of the English language', 'C', 'Paragraph C: "The term entered the English language in 1828".', 'C'),
              q(4, 'early statistical work that connected auroras to one particular region', 'G', 'Paragraph G: "Early evidence for a geomagnetic connection comes from the statistics of auroral observations" and that the aurora "appeared mainly in the auroral zone".', 'G'),
              q(5, 'different plural forms of a word used by different groups of people', 'E', 'Paragraph E: "aurorae is the original Latin plural and is often used by scientists" while "auroras" is more common in the U.S.', 'E'),
            ],
          },
          {
            id: 'r71-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'The word aurora was used in English several centuries before the term aurora borealis.', 'TRUE', 'Paragraph D: "Aurora was first used in English in the 14th century", whereas paragraph C says the term aurora borealis entered English in 1828.', 'D'),
              q(7, 'The auroral zone is a band about 660 km wide centred on latitude 60° north and south.', 'FALSE', 'Paragraph F: it is "a band approximately 6° (~660 km) wide in latitude centred on 67° north and south" — 67°, not 60°.', 'F'),
              q(8, 'Changes in the southern lights happen at the same time as changes in the northern lights.', 'TRUE', 'Paragraph H: the aurora australis "changes simultaneously with changes in the northern auroral zone".', 'H'),
              q(9, 'The Carrington Event caused serious damage to communication equipment.', 'NOT GIVEN', 'Paragraph H only says that "During the Carrington Event, the greatest geomagnetic storm ever observed, auroras were seen even in the tropics" — nothing is said about damage to equipment.', 'H'),
            ],
          },
          {
            id: 'r71-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>How an aurora is produced</strong></p><ul><li>Disturbances in the magnetosphere are caused by faster {{q10}} coming from coronal holes and coronal mass ejections</li><li>Charged particles, mostly electrons and {{q11}}, fall into the upper atmosphere</li><li>The shape of the aurora depends partly on how much {{q12}} the particles have been given</li><li>Forecasting: the NOAA centre uses the {{q13}} model, which relies on solar-wind measurements</li></ul>',
            questions: [
              q(10, null, 'solar wind', 'Paragraph B: "caused by enhanced speeds of solar wind from coronal holes and coronal mass ejections".', 'B'),
              q(11, null, 'protons', 'Paragraph B: "These particles, mainly electrons and protons, precipitate into the upper atmosphere".', 'B'),
              q(12, null, 'acceleration', 'Paragraph B: "dependent on the amount of acceleration imparted to the precipitating particles".', 'B'),
              q(13, null, 'OVATION', 'Paragraph I: "a short-term forecast of the oval\'s location and intensity from the OVATION model".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
