// Vocably Reading 90 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-90',
  title: 'Reading 90: Braille',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'braille', title: 'Braille: Reading with the Fingertips', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r90-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a reason why audio technology cannot fully take the place of braille', 'E', 'Paragraph E: "braille provides blind people with access to spelling, punctuation and other aspects of written language less accessible through audio alone".', 'E'),
              q(2, 'an effort to make the braille code the same in different English-speaking countries', 'H', 'Paragraph H: "In 1991, work to standardize the braille codes used in the English-speaking world began."', 'H'),
              q(3, 'the total number of patterns that one braille cell can produce', 'D', 'Paragraph D: "There are 64 possible combinations, including no dots at all for a word space."', 'D'),
              q(4, 'how the first ten letters are also used to stand for numbers', 'J', 'Paragraph J: "These stand for the ten digits 1–9 and 0 in an alphabetic numeral system similar to Greek numerals".', 'J'),
              q(5, 'a description of the three levels of English braille', 'C', 'Paragraph C: "in English braille there are three levels".', 'C'),
            ],
          },
          {
            id: 'r90-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Louis Braille became blind because of an illness.', 'FALSE', 'Paragraph B: "a Frenchman who lost his sight as a result of a childhood accident".', 'B'),
              q(7, 'Braille\'s system was later extended to cover musical notation.', 'TRUE', 'Paragraph B: "He published his system, which subsequently included musical notation, in 1829."', 'B'),
              q(8, 'According to Barbier\'s own writings, his code was first designed for use by soldiers.', 'FALSE', 'Paragraph G: "Barbier\'s writings do not use this term, instead suggesting that braille was originally designed as a simpler form of writing for the visually impaired."', 'G'),
              q(9, 'Unified English Braille was completed within a few years of 1991.', 'NOT GIVEN', 'Paragraph H says only that "In 1991, work to standardize the braille codes used in the English-speaking world began"; no completion date is given.', 'H'),
            ],
          },
          {
            id: 'r90-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['', 'Barbier\'s night writing', 'Braille\'s system'], [
              ['Dots per symbol', '{{q10}}', '6'],
              ['What the symbols stood for', '36 different {{q11}}', 'letters of the alphabet'],
              ['Reading', 'the finger had to {{q12}} to feel the whole symbol', 'the whole symbol fits under the fingertip'],
              ['Numerals and punctuation', 'no symbols', 'symbols provided'],
              ['Year of first publication', '-', '{{q13}}'],
            ], 'Two tactile writing systems'),
            questions: [
              q(10, null, '12', 'Paragraph G: "In Barbier\'s system, sets of 12 embossed dots were used to encode 36 different sounds."', 'G'),
              q(11, null, 'sounds', 'Paragraph G: "sets of 12 embossed dots were used to encode 36 different sounds".', 'G'),
              q(12, null, 'move', 'Paragraph G: "This required the reading finger to move in order to perceive the whole symbol, which slowed the reading process."', 'G'),
              q(13, null, '1829', 'Paragraph B: "He published his system, which subsequently included musical notation, in 1829."', 'B'),
            ],
          },
        ],
      }),
    ],
  },
};
