// Vocably Reading 8 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-8',
  title: 'Reading 8: Cinnamon',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'cinnamon', title: 'Cinnamon: The Spice of Secrets', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r8-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Most of the cinnamon traded internationally comes from Cinnamomum verum.', 'FALSE', 'Paragraph B: "most cinnamon in international commerce is derived from four other species".', 'B'),
              q(2, 'The English word "cinnamon" was borrowed directly from Hebrew.', 'FALSE', 'Paragraph C: the word "derives from the Ancient Greek" and reached English "via Latin and medieval French intermediate forms".', 'C'),
              q(3, 'The names canel and canella come from a Latin word meaning a small tube.', 'TRUE', 'Paragraph D: they "are derived from the Latin word cannella, a diminutive of canna" meaning tube.', 'D'),
              q(4, 'The ancient Egyptians used cinnamon to flavour their food.', 'NOT GIVEN', 'Paragraph F mentions only that "cinnamon was used to embalm mummies" and in kyphi, "an aromatic used for burning"; cooking is not mentioned.', 'F'),
              q(5, 'Nero is reported to have burned a huge amount of cinnamon when his wife died.', 'TRUE', 'Paragraph I: "the Emperor Nero is said to have burned a year\'s worth of the city\'s supply at the funeral for his wife Poppaea Sabina".', 'I'),
            ],
          },
          {
            id: 'r8-ends', type: 'matching_sentence_endings', bankReusable: false,
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'was caught in nets where the Nile began.',
              'cost as much as five days\' wages for a farm labourer.',
              'came originally from China.',
              'was protected by flying snakes.',
              'was a tale invented by merchants in order to raise prices.',
              'was too costly for anyone except kings.',
              'was carried on ships equipped with sails and oars.',
            ]),
            questions: [
              q(6, 'Herodotus claimed that cinnamon', 'D', 'Paragraph G: "both cinnamon and cassia grew in Arabia" ... "and were guarded by winged serpents".', 'G'),
              q(7, 'Pliny the Elder said that the story of the cinnamon birds', 'E', 'Paragraph H: the tale "was a traders\' fiction made up to charge more".', 'H'),
              q(8, 'Diocletian\'s edict shows that a pound of cassia', 'B', 'Paragraph I: "a price of 125 denarii for a pound of cassia, while an agricultural labourer earned 25 denarii per day".', 'I'),
              q(9, 'The Sieur de Joinville was told that cinnamon', 'A', 'Paragraph J: "cinnamon was fished up in nets at the source of the Nile".', 'J'),
            ],
          },
          {
            id: 'r8-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Cinnamon in the ancient and medieval world</strong></p><ul><li>imported into Egypt from around {{q10}} BC</li><li>so valuable that it was considered an appropriate present for {{q11}}</li><li>its origin was kept as a {{q12}} by Mediterranean spice traders for hundreds of years</li><li>used by the Egyptians to embalm {{q13}}</li><li>first written statement that it grew in Sri Lanka: about {{q14}}</li></ul>',
            questions: [
              q(10, null, '2000', 'Paragraph E: "It was imported to Egypt as early as 2000 BC".', 'E'),
              q(11, null, 'monarchs', 'Paragraph E: "it was regarded as a gift fit for monarchs".', 'E'),
              q(12, null, 'trade secret', 'Paragraph E: "Its source was kept a trade secret in the Mediterranean world for centuries".', 'E'),
              q(13, null, 'mummies', 'Paragraph F: "In Ancient Egypt, cinnamon was used to embalm mummies."', 'F'),
              q(14, null, '1270', 'Paragraph K: "The first mention that the spice grew specifically in Sri Lanka" was in a work of "about 1270".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
