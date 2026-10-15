// Vocably Reading 74 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-74',
  title: 'Reading 74: The Sahara',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'sahara', title: 'The Sahara', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r74-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(1, 'What kind of landscape lies between the desert and the Atlantic coast?', 'coastal plains', 'Paragraph B: "the Atlantic Ocean in the west, where the landscape gradually changes from desert to coastal plains".', 'B'),
              q(2, 'What proportion of the African continent does the Sahara occupy?', ['31%', '31 percent'], 'Paragraph D: "It covers 9 million square kilometres (3,500,000 sq mi), 31% of the African continent."', 'D'),
              q(3, 'What is the name of the highest mountain in the Sahara?', 'Emi Koussi', 'Paragraph F: "The highest peak in the Sahara is Emi Koussi, a shield volcano in the Tibesti range of northern Chad."', 'F'),
              q(4, 'According to botanical criteria, the growing of which plant stops at the northern edge of the Sahara?', ['date palm', 'date palms'], 'Paragraph H: "the northern limit of the Sahara corresponds to the northern limit of date palm cultivation".', 'H'),
            ],
          },
          {
            id: 'r74-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'The Sahara is the largest desert on Earth.', 'FALSE', 'Paragraph A: "it is the largest hot desert in the world and the third-largest desert overall, smaller only than the deserts of Antarctica and the northern Arctic".', 'A'),
              q(6, 'The Sahara\'s shifts between desert and grassland are connected to a change in the tilt of the Earth\'s axis.', 'TRUE', 'Paragraph C: the 20,000-year cycle is "caused by the precession of Earth\'s axis (about 26,000 years) as it rotates around the Sun".', 'C'),
              q(7, 'The Richat Structure was formed by a meteorite strike.', 'NOT GIVEN', 'Paragraph E only lists "unusual landforms such as the Richat Structure in Mauritania" — the passage does not say how it was formed.', 'E'),
              q(8, 'Trees in the Sahara grow mainly in the central, hyperarid region.', 'FALSE', 'Paragraph G: "The central Sahara is hyperarid, with sparse vegetation"; it is "the northern and southern reaches of the desert, along with the highlands" that have "trees and taller shrubs in wadis, where moisture collects".', 'G'),
              q(9, 'The southern boundary of the Sahara receives more rain each year than the northern boundary.', 'TRUE', 'Paragraph I: "the southern limit of the Sahara corresponds to the 150 mm (5.9 in) isohyet of annual precipitation", whereas paragraph H gives the northern limit as the 100 mm isohyet.', 'I'),
            ],
          },
          {
            id: 'r74-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(10, 'a list of the countries that the desert extends into', 'D', 'Paragraph D: "The Sahara covers large parts of Algeria, Chad, Egypt, Libya, Mali, Mauritania, Niger, Western Sahara and Sudan".', 'D'),
              q(11, 'an explanation of the atmospheric conditions that keep the Sahara dry', 'K', 'Paragraph K: air "usually descends, warming and drying the lower troposphere and preventing cloud formation".', 'K'),
              q(12, 'the names of the main towns and cities located within the desert', 'J', 'Paragraph J: "Important cities located in the Sahara include Nouakchott, the capital of Mauritania".', 'J'),
              q(13, 'a description of the climate found just beyond the northern edge of the desert', 'H', 'Paragraph H: the eco-regions to the north "have a Mediterranean climate characterized by hot summers and cool and rainy winters".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
