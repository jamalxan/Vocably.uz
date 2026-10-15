// Vocably Reading 68 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-68',
  title: 'Reading 68: A History of Kites',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'kite', title: 'A History of Kites', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r68-head', type: 'matching_headings',
            instructionHtml: 'The passage has eight paragraphs, A-H. Choose the correct heading for paragraphs B, C, D, F and H from the list of headings below.',
            bank: bank([
              'A famous experiment with lightning',
              'How a kite stays in the air',
              'Kites in the religious life of the Pacific islands',
              'A late arrival in Europe',
              'The many purposes kites have served',
              'The dangers of flying kites near aircraft',
              'Early Chinese kites and how they were used',
              'New designs and new materials in the modern age',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'ii', 'Paragraph B: "The lift that sustains the kite in flight is generated when air moves around the kite\'s surface".', 'B'),
              q(2, 'Paragraph C', 'v', 'Paragraph C: "Kites may be flown for recreation, art or other practical uses", including reconnaissance, sport and power kites.', 'C'),
              q(3, 'Paragraph D', 'vii', 'Paragraph D: "Ancient Chinese texts describe kites being used for measuring distances, testing the wind, lifting men, signaling, and communication for military operations."', 'D'),
              q(4, 'Paragraph F', 'iv', 'Paragraph F: "Kites were late to arrive in Europe".', 'F'),
              q(5, 'Paragraph H', 'viii', 'Paragraph H: "The 20th century saw the development of many new kite designs" and "Lightweight synthetic materials" are now used.', 'H'),
            ],
          },
          {
            id: 'r68-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Which material gave early Chinese kites a strong but light frame?', 'bamboo', 'Paragraph D: "resilient bamboo for a strong, lightweight framework".', 'D'),
              q(7, 'In which year was a kite used to carry a message for a rescue mission?', ['549 AD', '549'], 'Paragraph D: "By 549 AD, a kite was used as a message for a rescue mission."', 'D'),
              q(8, 'What is the Indian name for the fighter kite?', 'patang', 'Paragraph E: "the fighter kite, known as the patang in India".', 'E'),
              q(9, 'Who was the first to bring accounts of kites to Europe?', 'Marco Polo', 'Paragraph F: "Stories of kites were first brought to Europe by Marco Polo towards the end of the 13th century".', 'F'),
            ],
          },
          {
            id: 'r68-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Every kite needs a bridle in order to fly.', 'FALSE', 'Paragraph A: "Some kite designs do not need a bridle; box kites can have a single attachment point."', 'A'),
              q(11, 'Kites can work under water because liquids obey the same rules of flow as air.', 'TRUE', 'Paragraph C: "The same principles of fluid flow apply in liquids, so kites can be used in underwater currents."', 'C'),
              q(12, 'Benjamin Franklin was injured while carrying out his kite experiment.', 'NOT GIVEN', 'Paragraph G says only that Franklin "published an account of a kite experiment to prove that lightning was caused by electricity"; nothing is said about any injury.', 'G'),
              q(13, 'Interest in kites fell as powered aircraft developed.', 'TRUE', 'Paragraph H: "The rapid development of mechanically powered aircraft diminished interest in kites."', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
