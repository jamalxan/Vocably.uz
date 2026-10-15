// Vocably Reading 32 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-32',
  title: 'Reading 32: The Art of Calligraphy',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'calligraphy', title: 'The Art of Calligraphy', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r32-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs C, D, F, G and I from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'The instruments used by calligraphers in the West',
              'Inks, writing surfaces and ways of keeping lines straight',
              'Writing used to predict the future',
              'A ruler who standardised the written characters',
              'A script that has changed little in a thousand years',
              'The names given to calligraphy in three languages',
              'How printing led to the decline of handwriting',
              'The everyday uses of modern Western calligraphy',
            ], true),
            questions: [
              q(1, 'Paragraph C', 'i', 'Paragraph C: "In the Western world, the principal tools for calligraphy are pens and brushes."', 'C'),
              q(2, 'Paragraph D', 'ii', 'Paragraph D: "The ink used for calligraphy is usually water-based" and "lightboxes and templates can be used to achieve straight lines without leaving pencil marks".', 'D'),
              q(3, 'Paragraph F', 'iii', 'Paragraph F: the Shang rulers "baked them for insight into military affairs, agricultural harvests, weather, or even procreation, as a form of scapulimancy".', 'F'),
              q(4, 'Paragraph G', 'iv', 'Paragraph G: Qin Shi Huang "imposed several reforms, among them Li Si\'s character unification, which created a set of 3300 standardized small seal characters".', 'G'),
              q(5, 'Paragraph I', 'v', 'Paragraph I: the regular script is "still in use today" and its shape "1000 years ago was mostly similar to that at the end of Imperial China".', 'I'),
            ],
          },
          {
            id: 'r32-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Early Chinese writing</strong></p><ul><li>Oracle bone script: the oldest known characters, cut into the shoulder blades of oxen and the {{q6}} of tortoises</li><li>During divination the cracks were interpreted and the reading was carved on the bone, sometimes after first being written with a {{q7}}</li><li>Mao Gong ding: the largest known bronze inscription, with {{q8}} characters</li><li>Reforms of Qin Shi Huang: Li Si produced a set of {{q9}} standard small seal characters</li></ul>',
            questions: [
              q(6, null, 'plastrons', 'Paragraph F: "carved on ox scapulae and tortoise plastrons".', 'F'),
              q(7, null, 'brush', 'Paragraph F: "sometimes after the characters were written with a brush".', 'F'),
              q(8, null, '500', 'Paragraph F: "It contains 500 inscribed characters, the largest number of bronze inscriptions discovered to date."', 'F'),
              q(9, null, ['3300', '3,300'], 'Paragraph G: "which created a set of 3300 standardized small seal characters".', 'G'),
            ],
          },
          {
            id: 'r32-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Felt-tip pens produce the same angled strokes as traditional calligraphy pens.', 'FALSE', 'Paragraph C: "Felt-tip and ballpoint pens may also be used, however, these do not produce angled lines."', 'C'),
              q(11, 'Mistakes made on parchment can be removed with a blade.', 'TRUE', 'Paragraph D: "Parchment or vellum are occasionally used, because imperfections can be erased with a knife".', 'D'),
              q(12, 'Korean calligraphy is less highly valued today than Chinese or Japanese calligraphy.', 'NOT GIVEN', 'Paragraph E says the calligraphy of all three "remains an important and highly regarded aspect of contemporary traditional East Asian culture"; it does not compare them.', 'E'),
              q(13, 'Wei Bei calligraphy continued to be produced during the Tang dynasty.', 'FALSE', 'Paragraph H: it "started during the North and South dynasties (420–589 CE) and ended before the Tang dynasty (618–907)".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
