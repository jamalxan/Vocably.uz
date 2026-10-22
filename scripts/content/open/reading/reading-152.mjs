// Vocably Reading 152 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-152',
  title: 'Reading 152: The History of Ink',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'ink', title: 'Ink: A Brief History', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r152-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The inks used in printing processes such as letterpress are thicker than writing inks.', 'TRUE', 'Paragraph A: "Thicker inks, in paste form, are used extensively in letterpress and lithographic printing."', 'A'),
              q(2, 'The earliest inks of every civilisation are thought to have been made from a kind of soot.', 'TRUE', 'Paragraph C: "The earliest inks from all civilizations are believed to have been made with lampblack, a kind of soot".', 'C'),
              q(3, 'Egyptian scribes applied their ink with brushes made from reeds.', 'NOT GIVEN', 'Paragraph D says that "Ink was used in Ancient Egypt for writing and drawing on papyrus" and lists its pigments, but says nothing about the tools used to apply it.', 'D'),
              q(4, 'Chinese and Japanese inksticks are made with the same kind of glue.', 'FALSE', 'Paragraph E: "The Chinese inkstick is produced with a fish glue, whereas Japanese glue" is "from cow or stag".', 'E'),
              q(5, 'India ink got its name because it was first produced in India.', 'FALSE', 'Paragraph F: "India ink was invented in China, though materials were often traded from India, hence the name."', 'F'),
            ],
          },
          {
            id: 'r152-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Three historical ink recipes</strong></p><ul><li><strong>Iron-gall ink</strong> (about 1,600 years old): iron salts mixed with {{q6}} from gallnuts plus a thickener; the ink is {{q7}} when first applied and later fades to a dull brown</li><li><strong>12th-century European recipe:</strong> {{q8}} branches cut in spring and dried; the bark is soaked in water for {{q9}} days, then boiled with wine</li><li><strong>Gutenberg\'s printing ink:</strong> oil-based and indelible; lamp-black mixed with varnish and {{q10}}</li></ul>',
            questions: [
              q(6, null, 'tannin', 'Paragraph H: "Iron salts, such as ferrous sulfate (made by treating iron with sulfuric acid), were mixed with tannin from gallnuts (they grow on trees) and a thickener."', 'H'),
              q(7, null, ['bluish-black', 'bluish black'], 'Paragraph H: "When first put to paper, this ink is bluish-black. Over time it fades to a dull brown."', 'H'),
              q(8, null, 'hawthorn', 'Paragraph I: "One 12th century ink recipe called for hawthorn branches to be cut in the spring and left to dry."', 'I'),
              q(9, null, ['eight', '8'], 'Paragraph I: "Then the bark was pounded from the branches and soaked in water for eight days."', 'I'),
              q(10, null, 'egg white', 'Paragraph K: "Gutenberg\'s dye was indelible, oil-based, and made from the soot of lamps (lamp-black) mixed with varnish and egg white".', 'K'),
            ],
          },
          {
            id: 'r152-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'What colour does cephalopod ink become once it has dried?', 'brown', 'Paragraph G: "Cephalopod ink, known as sepia, turns from dark blue-black to brown on drying".', 'G'),
              q(12, 'On which two materials did medieval European scribes mostly write?', ['parchment or vellum', 'parchment and vellum', 'parchment, vellum'], 'Paragraph I: "Scribes in medieval Europe (about AD 800 to 1500) wrote principally on parchment or vellum."', 'I'),
              q(13, 'In which year did a caliph of Egypt ask for a pen that would not stain his hands?', '953', 'Paragraph J: "The reservoir pen, which may have been the first fountain pen, dates back to 953, when Ma\'ād al-Mu\'izz, the caliph of Egypt, demanded a pen that would not stain his hands or clothes".', 'J'),
              q(14, 'Besides soot and turpentine, what ingredient went into the ink finally developed for the printing press?', ['walnut oil', 'walnut'], 'Paragraph K: "Eventually an oily, varnish-like ink made of soot, turpentine, and walnut oil was created specifically for the printing press."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
