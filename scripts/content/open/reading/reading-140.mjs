// Vocably Reading 140 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-140',
  title: 'Reading 140: The Crossword',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'crossword', title: 'Across and Down: The Crossword Puzzle', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r140-head', type: 'matching_headings',
            instructionHtml: 'The passage has eleven paragraphs, A-K. Choose the correct heading for paragraphs D, E, F, G and J from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'How a modern puzzle is constructed',
              'Standard dimensions and a weekly rise in difficulty',
              'When one definition is not enough to fix the answer',
              'Clue and answer must match grammatically',
              'Why capital letters are disregarded',
              'Everyday spoken phrases as answers',
              'How clues signal abbreviations, odd spellings and foreign words',
              'Clues based on the points of the compass',
              'The newspaper that popularised the modern crossword',
            ], true),
            questions: [
              q(1, 'Paragraph D', 'ii', 'Paragraph D: "many weekday newspaper puzzles (such as the American New York Times crossword puzzle) are 15×15 squares" and "their Monday puzzles are the easiest and the puzzles get harder each day until Saturday".', 'D'),
              q(2, 'Paragraph E', 'iii', 'Paragraph E: "a straight clue is not in itself sufficient to distinguish between several possible answers".', 'E'),
              q(3, 'Paragraph F', 'iv', 'Paragraph F: "clues and their solutions should always agree in tense, number, and degree".', 'F'),
              q(4, 'Paragraph G', 'v', 'Paragraph G: "Capitalization of answer letters is conventionally ignored".', 'G'),
              q(5, 'Paragraph J', 'vii', 'Paragraph J: "Abbreviations, the use of a foreign language, variant spellings, or other unusual word tricks are indicated in the clue."', 'J'),
            ],
          },
          {
            id: 'r140-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Each white square in a crossword normally holds a single letter.', 'TRUE', 'Paragraph A: "Each white square is typically filled with one letter".', 'A'),
              q(7, 'The New York World was the first newspaper ever to print a crossword.', 'NOT GIVEN', 'Paragraph B says only that early crosswords "were popularized by the New York World in the 1910s"; it does not say which newspaper printed the first one.', 'B'),
              q(8, 'Most crossword grids today are built without the help of computers.', 'FALSE', 'Paragraph C: "Crossword construction in modern times usually involves the use of software."', 'C'),
              q(9, 'The Sunday New York Times puzzle is the most difficult of the week.', 'FALSE', 'Paragraph D: "Their larger Sunday puzzle is about the same level of difficulty as a weekday-size Thursday puzzle."', 'D'),
            ],
          },
          {
            id: 'r140-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'What do constructors usually select before placing answers in the grid?', ['a theme', 'theme'], 'Paragraph C: "Constructors choose a theme (except for themeless puzzles), place the theme answers in a grid".', 'C'),
              q(11, 'Which day of the week do American solvers use as a label for a really hard puzzle?', 'Saturday', 'Paragraph D: "a medium-difficulty puzzle as a" Wednesday, "and a truly difficult puzzle as a" Saturday.', 'D'),
              q(12, 'Which abbreviation in a clue tells the solver that the answer is spelt in an unusual way?', ['Var.', 'Var'], 'Paragraph J: the use of Var. "indicates the answer is a variant spelling".', 'J'),
              q(13, 'How many different compass-point abbreviations can appear as answers?', ['eight', '8'], 'Paragraph K: "The eight possible abbreviations for a position on a compass".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
