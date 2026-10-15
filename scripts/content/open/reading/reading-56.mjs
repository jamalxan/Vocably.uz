// Vocably Reading 56 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-56',
  title: 'Reading 56: The Rubik\'s Cube',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'rubik-s-cube', title: 'The Puzzle That Conquered the World', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r56-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'was held together by means of magnets.',
              'does not reflect what Rubik was really trying to do.',
              'have been arranged in a fixed pattern.',
              'protected the idea of pieces turning around a central axis.',
              'was refused by the authorities.',
              'differed from one cube to the next.',
              'was used in his university courses.',
            ]),
            questions: [
              q(1, 'Since 1988, the colours on a standard cube', 'C', 'Paragraph B: "Since 1988, the arrangement of colours has been standardised, with white opposite yellow, blue opposite green and orange opposite red".', 'B'),
              q(2, 'The puzzle invented by Larry Nichols', 'A', 'Paragraph E: "Nichols\'s cube was held together by magnets."', 'E'),
              q(3, 'The story that the Cube was built as a teaching aid', 'B', 'Paragraph G: "his actual purpose was solving the structural problem of allowing many small parts to move independently while still remaining part of a single, coherent mechanical system".', 'G'),
              q(4, 'The patent granted in Hungary in 1975', 'D', 'Paragraph H: "covered the core mechanical idea of a three-dimensional combination puzzle based on interlocking elements rotating around a central axis".', 'H'),
            ],
          },
          {
            id: 'r56-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Ideal Toy Corp was the first company licensed to sell the Cube outside Hungary.', 'FALSE', 'Paragraph A: "the puzzle was licensed by Rubik to be sold by Pentangle Puzzles in the UK in 1978, and then by Ideal Toy Corp in 1980".', 'A'),
              q(6, 'The earliest cubes did not all have their colours in the same positions.', 'TRUE', 'Paragraph B: "On early cubes, the position of the colours varied from cube to cube."', 'B'),
              q(7, 'Rubik managed to solve his own Cube within a few days of building it.', 'FALSE', 'Paragraph G: "it took him about a month of trial and error to solve his own creation".', 'G'),
              q(8, 'Rubik\'s book about the Cube has been translated into many languages.', 'NOT GIVEN', 'Paragraph H only says that Rubik described his experiments and reflections "in his book Cubed: The Puzzle of Us All"; nothing is said about translations.', 'H'),
              q(9, 'The Magic Cube was given a new name because Ideal wanted one it could trademark.', 'TRUE', 'Paragraph J: "Ideal wanted a distinctive and easily recognisable name to trademark; that arrangement put Rubik himself in the spotlight because the Magic Cube was renamed after its inventor in 1980."', 'J'),
            ],
          },
          {
            id: 'r56-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Inventor', 'Patent applied for', 'Device', 'Patent granted'], [
              ['Larry D. Nichols', 'March 1970', '2x2x2 cube held together by magnets', '{{q10}} 1972'],
              ['Frank Fox', '9 April 1970', 'sliding puzzle on a {{q11}} surface', '16 January 1974'],
              ['Ernő Rubik', '{{q12}} 1975', 'Magic Cube held together by {{q13}} plastic pieces', 'later in 1975'],
            ], 'Three early patents'),
            questions: [
              q(10, null, ['11 April', 'April'], 'Paragraph E: "Nichols was granted U.S. patent 3,655,201 on 11 April 1972, two years before Rubik invented his Cube."', 'E'),
              q(11, null, 'spherical', 'Paragraph F: "a type of sliding puzzle on a spherical surface".', 'F'),
              q(12, null, ['30 January', 'January'], 'Paragraph H: "Rubik applied for a patent in Hungary for his" Magic Cube "on 30 January 1975".', 'H'),
              q(13, null, 'interlocking', 'Paragraph I: "The Magic Cube was held together with interlocking plastic pieces that prevented the puzzle from being easily pulled apart".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
