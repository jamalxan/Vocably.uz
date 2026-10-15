// Vocably Reading 22 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-22',
  title: 'Reading 22: The Voynich Manuscript',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'voynich-manuscript', title: 'The Book Nobody Can Read', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r22-head', type: 'matching_headings',
            instructionHtml: 'The passage has nine paragraphs, A-I. Choose the correct heading for paragraphs D-I from the list of headings below. <em>Write the correct number, i-ix.</em>',
            bank: bank([
              'Evidence that the book was once larger than it is today',
              'A luxury object made for a wealthy patron',
              'What the ink reveals about when the text and pictures were made',
              'Signs that the pages were put back in a different order',
              'The first scholars to attempt a translation',
              'Clues that the book was used regularly for everyday purposes',
              'A binding that was added long after the book was written',
              'Tests that established the age and material of the pages',
              'How the manuscript came to leave Europe',
            ], true),
            questions: [
              q(1, 'Paragraph D', 'i', 'Paragraph D: "it seems likely that in the past, the manuscript had at least 272 pages in 20 quires, some of which were already missing when Wilfrid Voynich acquired the manuscript in 1912".', 'D'),
              q(2, 'Paragraph E', 'iv', 'Paragraph E: "many of the book\'s bifolios were reordered at various points in the book\'s history, and that its pages were originally in a different order than the order they are in today".', 'E'),
              q(3, 'Paragraph F', 'viii', 'Paragraph F: "radiocarbon dated at the University of Arizona in 2009" giving "a date for the parchment between 1404 and 1438", and "Protein testing in 2014 revealed that the parchment was made from calfskin".', 'F'),
              q(4, 'Paragraph G', 'vii', 'Paragraph G: "The goatskin binding and covers are not original to the book, but date to its possession by the Collegio Romano."', 'G'),
              q(5, 'Paragraph H', 'vi', 'Paragraph H: the manuscript "was handled or paged through a great deal and likely served some routine function such as a medical manual or celestial almanac".', 'H'),
              q(6, 'Paragraph I', 'iii', 'Paragraph I: "The similarity between the drawing inks and text inks suggested a contemporaneous origin."', 'I'),
            ],
          },
          {
            id: 'r22-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(7, 'What does the writer say about the theories concerning the purpose of the manuscript?', [
                'Most scholars now believe that it is a hoax.',
                'There is not enough evidence to accept or reject any of them.',
                'It was almost certainly written in a natural language.',
                'They were all first proposed during the Renaissance.',
              ], 'B', 'Paragraph A: "currently scholars lack the translation and context needed to either properly entertain or eliminate any of the possibilities".', 'A'),
              mc(8, 'The manuscript takes its name from', [
                'the alchemist who first owned it.',
                'the library where it is now kept.',
                'the book dealer who bought it in 1912.',
                'the scholar who first studied its script.',
              ], 'C', 'Paragraph B: "The manuscript is named after Wilfrid Voynich, a Polish book dealer who purchased it in 1912."', 'B'),
              mc(9, 'What is said about the wartime codebreakers who examined the manuscript?', [
                'They worked on it only during the Second World War.',
                'They produced a translation that was later rejected.',
                'They came from several European countries.',
                'They were unable to decipher it.',
              ], 'D', 'Paragraph C: "Codebreakers Prescott Currier, William Friedman, Elizebeth Friedman, and John Tiltman were unsuccessful."', 'C'),
            ],
          },
          {
            id: 'r22-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Since 1969 the manuscript has belonged to a library at ______.', 'Yale University', 'Paragraph B: "Since 1969, it has been held in Yale University\'s Beinecke Rare Book and Manuscript Library."', 'B'),
              q(11, 'Tests carried out in 2014 showed that the parchment was produced from ______.', 'calfskin', 'Paragraph F: "Protein testing in 2014 revealed that the parchment was made from calfskin".', 'F'),
              q(12, 'Despite its holes and tears, the parchment is considered to be of ______ quality.', 'average', 'Paragraph F: "The quality of the parchment is average and has deficiencies, such as holes and tears".', 'F'),
              q(13, 'The text and the outlines of the pictures were made with a quill pen and ______ ink.', 'iron gall', 'Paragraph I: "a quill pen and iron gall ink were used for the text and figure outlines".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
