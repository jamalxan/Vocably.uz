// Vocably Reading 10 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-10',
  title: 'Reading 10: Skyscrapers',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'skyscraper', title: 'Reaching for the Sky', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r10-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'There is one definition of a skyscraper that is accepted all over the world.', 'FALSE', 'Paragraph A: "there remains no universally accepted definition of a skyscraper, other than being a high-rise".', 'A'),
              q(2, 'In a modern skyscraper, the outer walls support the weight of the building.', 'FALSE', 'Paragraph B: "Modern skyscraper walls are not load-bearing".', 'B'),
              q(3, 'Setbacks are sometimes needed for structural reasons.', 'TRUE', 'Paragraph B: "many skyscrapers are built with setbacks, which in some cases is also structurally required".', 'B'),
              q(4, 'Most of the skyscrapers in Hong Kong were completed after the year 2000.', 'NOT GIVEN', 'Paragraph D says that skyscrapers worldwide were "most of which were built in the 21st century" and that Hong Kong has "a total of 569 skyscrapers", but gives no dates for Hong Kong\'s buildings.', 'D'),
              q(5, 'More than half of the world\'s skyscrapers over 150 m are located in Asia.', 'TRUE', 'Paragraph D: "Over three quarters of skyscrapers taller than 150 m (492 ft) are located in Asia."', 'D'),
            ],
          },
          {
            id: 'r10-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Structure', 'Date', 'Height', 'Notes'],
              [
                ['Great Pyramid of Giza', '{{q6}} century BC', '146 m', 'the tallest structure in the ancient world'],
                ['Lincoln Cathedral', '1311-1549', '160 m', 'taller than the pyramid until its central {{q7}} fell down'],
                ['Home Insurance Building, Chicago', '1885', '{{q8}} m (originally)', 'the first skyscraper with a steel frame'],
                ['Eiffel Tower', '1889', '-', 'the first {{q9}} structure ever built'],
                ['Burj Khalifa, Dubai', '-', '{{q10}} m', 'the tallest skyscraper in the world today'],
              ],
              'Record-breaking structures',
            ),
            questions: [
              q(6, null, '26th', 'Paragraph K: "the 146 m (479 ft) Great Pyramid of Giza in ancient Egypt, built in the 26th century BC".', 'K'),
              q(7, null, 'spire', 'Paragraph K: "the 160 m (520 ft) Lincoln Cathedral having exceeded it in 1311–1549, before its central spire collapsed".', 'K'),
              q(8, null, '42', 'Paragraph F: "the Home Insurance Building, originally 10 stories with a height of 42 m or 138 ft, in Chicago in 1885".', 'F'),
              q(9, null, 'supertall', 'Paragraph K: "surpassed by the Eiffel Tower in 1889, the first ever supertall structure".', 'K'),
              q(10, null, '828', 'Paragraph D: "The tallest skyscraper in the world is the Burj Khalifa in Dubai, with a height of 828 m (2,717 ft)."', 'D'),
            ],
          },
          {
            id: 'r10-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Which city has more skyscrapers than any other?', 'Hong Kong', 'Paragraph D: "The city with the most skyscrapers in the world is Hong Kong, with a total of 569 skyscrapers".', 'D'),
              q(12, 'Which building marked the practical limit of load-bearing masonry construction?', ['Monadnock Building', 'the Monadnock Building', 'Chicago\'s Monadnock Building'], 'Paragraph G: load-bearing masonry constructions "passed their practical limit in 1891 with Chicago\'s Monadnock Building".', 'G'),
              q(13, 'According to some engineers, which force must be the main load on a structure for it to count as a high-rise?', 'wind', 'Paragraph I: "any vertical construction for which wind is a more significant load factor than earthquake or weight".', 'I'),
              q(14, 'What term is used for skyscrapers that are more than 600 metres high?', 'megatall', 'Paragraph J: megatall is the term for "skyscrapers for those taller than 600 m".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
