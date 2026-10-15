// Vocably Reading 91 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-91',
  title: 'Reading 91: The Narwhal',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'narwhal', title: 'The Narwhal: Unicorn of the Arctic', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r91-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has ten paragraphs, A-J. Which paragraph contains the following information? <em>Choose the correct letter, A-J.</em>',
            questions: [
              q(1, 'a description of how the narwhal\'s colouring changes over its lifetime', 'J', 'Paragraph J: "At birth, the skin is light grey, and when sexually mature, white patches grow on the navel and genital slit".', 'J'),
              q(2, 'the origin of the animal\'s common name', 'D', 'Paragraph D: the name "comes from the Old Norse nárhval".', 'D'),
              q(3, 'evidence that the narwhal\'s ancestors lived in warm seas', 'H', 'Paragraph H: "Fossil evidence shows that prehistoric monodontids lived in tropical waters."', 'H'),
              q(4, 'a reference to a cross-bred animal whose identity was confirmed by genetic testing', 'F', 'Paragraph F: "this was confirmed by a 2019 DNA analysis".', 'F'),
              q(5, 'an estimate of the total number of narwhals alive today', 'C', 'Paragraph C: "There are an estimated 170,000 living narwhals".', 'C'),
            ],
          },
          {
            id: 'r91-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Narwhals tend to go back to the same summer locations year after year.', 'TRUE', 'Paragraph B: "often return to the same sites in subsequent years".', 'B'),
              q(7, 'Narwhal calves are born in the same year that mating takes place.', 'FALSE', 'Paragraph B: "the young are born between July and August of the following year".', 'B'),
              q(8, 'The IUCN classifies the narwhal as an endangered species.', 'FALSE', 'Paragraph C: "the species is listed as being of least concern by the International Union for Conservation of Nature".', 'C'),
              q(9, 'Inuit hunters now sell most of the ivory they obtain to buyers overseas.', 'NOT GIVEN', 'Paragraph C says only that "regulated subsistence hunting continues to this day"; nothing is said about selling ivory abroad.', 'C'),
              q(10, 'Scientists have established whether the narwhal-beluga hybrid could reproduce.', 'FALSE', 'Paragraph F: "Whether the hybrid itself could breed remains unknown."', 'F'),
            ],
          },
          {
            id: 'r91-notes', type: 'note_completion', wordLimit: W2,
            instructionHtml: 'Complete the notes below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The narwhal\'s body</strong></p><ul><li>the male\'s tusk is in fact an enlarged left {{q11}}, 1.5-3 m long</li><li>adults weigh between 800 and {{q12}} kg</li><li>on average, males are roughly {{q13}} longer than females</li><li>the bones of the neck are {{q14}} rather than fused, giving the head more flexibility</li></ul>',
            questions: [
              q(11, null, 'canine', 'Paragraph A: the tusk "is a protruding left canine".', 'A'),
              q(12, null, ['1,600', '1600'], 'Paragraph I: adults "weigh 800 to 1,600 kg".', 'I'),
              q(13, null, ['70 cm', '70cm', '70 centimetres'], 'Paragraph I: "males are about 70 cm (28 in) longer and more than 75% heavier than females".', 'I'),
              q(14, null, 'jointed', 'Paragraph J: "The neck vertebrae are also jointed, instead of being fused as in most whales".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
