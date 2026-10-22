// Vocably Reading 113 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 0, label: 'ONE WORD ONLY' };

export default {
  slug: 'vocably-reading-113',
  title: 'Reading 113: Chameleons',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'chameleon', title: 'Chameleons: Masters of Colour', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r113-head', type: 'matching_headings',
            instructionHtml: 'The passage has ten paragraphs, A-J. Choose the correct heading for paragraphs B, C, D, H and J from the list of headings below. <em>Write the correct number, i-viii.</em>',
            bank: bank([
              'A division of the family that has been questioned',
              'Where chameleons live and how they hunt',
              'How the distance between crystals produces different colours',
              'The various purposes of changing colour',
              'Physical features that set chameleons apart',
              'Breeding behaviour of chameleons',
              'The discovery of a new species',
              'How chameleons are kept as pets',
            ], true),
            questions: [
              q(1, 'Paragraph B', 'v', 'Paragraph B: "Chameleons are also distinguished by their zygodactylous feet, their prehensile tail, their laterally compressed bodies, their head casques, their projectile tongues".', 'B'),
              q(2, 'Paragraph C', 'ii', 'Paragraph C: "Chameleons are diurnal and adapted for visual hunting of invertebrates" and "they range from rainforest to desert conditions and from lowlands to highlands, with the vast majority occurring in Africa".', 'C'),
              q(3, 'Paragraph D', 'i', 'Paragraph D: "the validity of this subfamily designation has been the subject of much debate".', 'D'),
              q(4, 'Paragraph H', 'iii', 'Paragraph H: "changing the spacing between them, and this then affects which wavelengths of light are reflected and which are absorbed".', 'H'),
              q(5, 'Paragraph J', 'iv', 'Paragraph J: "Colour change in chameleons has functions in camouflage, but most commonly in social signalling and reactions to temperature and other conditions."', 'J'),
            ],
          },
          {
            id: 'r113-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Every chameleon species can display a wide range of colours.', 'FALSE', 'Paragraph A: species "exhibit considerable variability in their capacity to change colour. For some, it is more of a shift of brightness (shades of brown)".', 'A'),
              q(7, 'A chameleon\'s two eyes can look in different directions at the same time.', 'TRUE', 'Paragraph B: "Chameleons\' eyes are independently mobile, and because of this the chameleon\'s brain is constantly analyzing two separate, individual images of its environment."', 'B'),
              q(8, 'Chameleons were brought to Hawaii on purpose.', 'NOT GIVEN', 'Paragraph C states only that "They have been introduced to Hawaii and Florida" and does not say whether this was deliberate.', 'C'),
              q(9, 'Scientists know exactly how chameleons alter the spacing of their crystals.', 'FALSE', 'Paragraph I: "The exact mechanism by which chameleons can adjust the spacing of their iridophore crystals is not fully determined."', 'I'),
            ],
          },
          {
            id: 'r113-summary', type: 'summary_completion', wordLimit: W1,
            instructionHtml: 'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The structure of chameleon skin</strong></p><p>Chameleon skin is built from layers of specialised cells known as dermal {{q10}}. Nearest the surface are the yellow and red cells; beneath them is a layer of iridophores, whose transparent crystals of {{q11}} create structural colour through optical interference; and at the base are the melanophores, which hold dark {{q12}}. The iridophores themselves form two layers: the upper one contains small crystals, while the deeper one contains larger crystals that reflect light broadly, particularly in the {{q13}} range.</p>',
            questions: [
              q(10, null, 'chromatophores', 'Paragraph F: "Chameleon skin contains a layered arrangement of specialised cells known as the dermal chromatophores."', 'F'),
              q(11, null, 'guanine', 'Paragraph F: "an intermediate layer of iridophores whose transparent lattice-shaped guanine nanocrystals generate structural colour through optical interference".', 'F'),
              q(12, null, 'melanin', 'Paragraph F: the basal melanophores are described as "containing dark melanin".', 'F'),
              q(13, null, ['near-infrared', 'infrared'], 'Paragraph G: "the deeper layer (D-iridophores) contains larger crystals that broadly reflect light, especially in the near-infrared range".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
