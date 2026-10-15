// Vocably Reading 84 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-84',
  title: 'Reading 84: The Giant Panda',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'giant-panda', title: 'The Giant Panda', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r84-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Male giant pandas are usually bigger than females.', 'TRUE', 'Paragraph A: "It is sexually dimorphic, with males being typically 10–20% larger than females."', 'A'),
              q(2, 'Giant pandas live in groups for most of the year.', 'FALSE', 'Paragraph B: "It is solitary and gathers only in mating seasons."', 'B'),
              q(3, 'The survey published in 2015 included cubs that still depended on their mothers.', 'FALSE', 'Paragraph C: "the wild giant panda population aged over 1.5 years, excluding dependent young".', 'C'),
              q(4, 'The zoo involved in the Tainan fake panda incident was forced to close.', 'NOT GIVEN', 'Paragraph F says only that "a private zoo in Tainan painted a sun bear black and white and created the Tainan fake panda incident"; nothing is said about what happened to the zoo.', 'F'),
              q(5, 'Molecular research established that the giant panda belongs to the bear family.', 'TRUE', 'Paragraph G: "In 1985, molecular studies indicated that the giant panda is a true bear, part of the family Ursidae."', 'G'),
            ],
          },
          {
            id: 'r84-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Aspect', 'Details'], [
              ['Weight of adults', '100 to {{q6}} kg'],
              ['Length', '1.2 to 1.9 m'],
              ['Diet', 'almost entirely {{q7}}, including the shoots'],
              ['Habitat', 'six {{q8}} regions in China, up to 3,000 m above sea level'],
              ['Communication', 'relies on smell; leaves {{q9}} marks on rocks and trees'],
              ['Care of young', 'cubs stay with mother for 18-24 months on average'],
            ], 'The giant panda: key facts'),
            questions: [
              q(6, null, '115', 'Paragraph A: "adult individuals weigh 100 to 115 kg".', 'A'),
              q(7, null, 'bamboo', 'Paragraph A: "a diet consisting almost entirely of bamboo and bamboo shoots".', 'A'),
              q(8, null, 'montane', 'Paragraph B: "The giant panda lives exclusively in six montane regions in a few Chinese provinces".', 'B'),
              q(9, null, 'scent', 'Paragraph B: "It relies on olfactory communication and uses scent marks as chemical cues and on landmarks like rocks or trees."', 'B'),
            ],
          },
          {
            id: 'r84-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'What does the writer say about the word "panda" in older sources?', ['It referred to a different animal.', 'It was spelled in several ways.', 'It was borrowed from Chinese.', 'It described a kind of cat.'], 'A', 'Paragraph D: "In many older sources, the name "panda" or "common panda" refers to the red panda".', 'D'),
              mc(11, 'Why do some linguists prefer the Taiwanese name dàmāoxióng?', ['It is easier to pronounce.', 'It is the form used in most dictionaries.', 'It makes "bear" rather than "cat" the main noun.', 'It is older than the mainland name.'], 'C', 'Paragraph F: "Some linguists argue, in this construction, "bear" instead of "cat" is the base noun, making the name more grammatically and logically correct".', 'F'),
              mc(12, 'According to molecular studies, the giant panda', ['is more closely related to raccoons than to bears.', 'separated from the other bears earlier than any other living bear.', 'is most closely related to the sun bear.', 'first appeared about 300,000 years ago.'], 'B', 'Paragraph G: "it is the most basal member of this family and equidistant from all other extant bear species".', 'G'),
              mc(13, 'How does the Qinling panda differ from other giant pandas?', ['Its coat is always brown and white.', 'It lives at lower altitudes than any other panda.', 'It has a smaller skull and larger molars.', 'It eats less bamboo.'], 'C', 'Paragraph H: "The skull of A. m. qinlingensis is smaller than its relatives, and it has larger molars."', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
