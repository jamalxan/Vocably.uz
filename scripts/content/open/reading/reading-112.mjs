// Vocably Reading 112 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-112',
  title: 'Reading 112: The Ballpoint Pen',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'ballpoint-pen', title: 'The Ballpoint Pen: A Long Road to Success', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r112-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['John J. Loud', 'László Bíró', 'György Bíró', 'Frederick George Miles', 'Milton Reynolds', 'Juan Jorge Meyne']),
            questions: [
              q(1, 'got the idea for a new pen from the ink used in printing newspapers', 'B', 'Paragraph D: László Bíró "noticed that inks used in newspaper printing dried quickly, leaving the paper dry and smudge-free. He decided to create a pen using the same type of ink."', 'D'),
              q(2, 'made pens for the crews of military aircraft', 'D', 'Paragraph E: the design "was licensed by the British engineer Frederick George Miles and manufactured by his company Miles Aircraft, to be used by Royal Air Force aircrew".', 'E'),
              q(3, 'wanted a pen that could write on surfaces such as wood', 'A', 'Paragraph B: John J. Loud "was attempting to make a writing instrument that would be able to write" on rough surfaces "such as wood, coarse wrapping paper, and other articles".', 'B'),
              q(4, 'changed an existing design enough to be granted his own patent', 'E', 'Paragraph G: "Reynolds bypassed the Birome patent with sufficient design alterations to obtain an American patent".', 'G'),
              q(5, 'used a knowledge of chemistry to create thicker inks', 'C', 'Paragraph D: "his brother György, a dentist with useful knowledge of chemistry, to develop viscous ink formulae for new ballpoint designs".', 'D'),
            ],
          },
          {
            id: 'r112-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Loud\'s pen was well suited to writing letters.', 'FALSE', 'Paragraph B: "it proved too coarse for letter-writing".', 'B'),
              q(7, 'Early ballpoints leaked when the ink was too thin.', 'TRUE', 'Paragraph C: "If the socket was too loose or the ink too thin, the pen would leak, or the ink would smear."', 'C'),
              q(8, 'Ballpoints performed better than fountain pens on board aircraft.', 'TRUE', 'Paragraph E: "Ballpoint pens were found to be more versatile than fountain pens, especially in airplanes, where fountain pens were prone to leak."', 'E'),
              q(9, 'Eversharp was the biggest manufacturer of mechanical pencils in the United States.', 'NOT GIVEN', 'Paragraph F describes "the Eversharp Co., a maker of mechanical pencils" but says nothing about its position in the market.', 'F'),
            ],
          },
          {
            id: 'r112-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'The Reynolds Rocket went on sale at a New York ______ in October 1945.', 'department store', 'Paragraph G: "Debuting at Gimbels department store in New York City on 29 October 1945".', 'G'),
              q(11, 'Sales of ballpoint pens reached their highest level in ______.', '1946', 'Paragraph H: "Ballpoint pen sales peaked in 1946".', 'H'),
              q(12, 'Paper Mate advertised its new inks as ______.', ['banker-approved', 'banker approved'], 'Paragraph I: "Paper Mate pioneered new ink formulas and advertised them as" banker-approved.', 'I'),
              q(13, 'The ball-bearings in the Parker Jotter were made of textured ______.', ['tungsten-carbide', 'tungsten carbide'], 'Paragraph I: "the use of tungsten-carbide textured ball-bearings in their pens".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
