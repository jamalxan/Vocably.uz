// Vocably Reading 125 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-125',
  title: 'Reading 125: Lipstick',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'lipstick', title: 'A Short History of Lipstick', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r125-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Time and place', 'Ingredients or form', 'Notes'],
              [
                ['Ancient Sumer', 'crushed {{q1}}', 'applied mainly to the lips and around the eyes'],
                ['Ancient Egypt', 'red dye from algae', 'worn to display {{q2}} rather than gender'],
                ['China, Tang dynasty', 'beeswax with added {{q3}}', 'made the mouth more appealing'],
                ['England, 16th century', 'beeswax and red plant stains', 'worn only by upper-class women and {{q4}}'],
                ['Paris, 1884', 'deer tallow, castor oil and beeswax', 'wrapped in {{q5}}'],
              ],
              'Lipstick through the ages',
            ),
            questions: [
              q(1, null, 'gemstones', 'Paragraph C: "Sumerians crushed gemstones and used them to decorate their faces, mainly on the lips and around the eyes."', 'C'),
              q(2, null, 'social status', 'Paragraph C: "Ancient Egyptians wore lipstick to show social status rather than gender."', 'C'),
              q(3, null, 'scented oils', 'Paragraph D: "During the Tang dynasty (618–907 CE), scented oils were added to them, which gave the mouth an enticing factor."', 'D'),
              q(4, null, 'male actors', 'Paragraph E: "Only upper-class women and male actors wore makeup."', 'E'),
              q(5, null, 'silk paper', 'Paragraph F: "It was covered in silk paper and made from deer tallow, castor oil, and beeswax."', 'F'),
            ],
          },
          {
            id: 'r125-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'For most of the 19th century, visible make-up in Britain was', ['fashionable among upper-class women.', 'linked with groups on the margins of society.', 'forbidden by the authorities.', 'regarded as a sign of good health.'], 'B', 'Paragraph F: "it was associated with marginalised groups such as actors and prostitutes".', 'F'),
              mc(7, 'What gave the Guerlain employee the idea of producing lipstick in stick form?', ['a visit to the theatre', 'warnings about the dangers of lead', 'the equipment of a candlemaker', 'a traditional Chinese recipe'], 'C', 'Paragraph F: "Seeing the candlemaker\'s tools gave the Guerlain employee the “mad” idea of creating a waxy lip cosmetic as a stick."', 'F'),
              mc(8, 'Why do cochineal insects produce carminic acid?', ['to attract a mate', 'to colour their eggs', 'to help them digest cactus plants', 'to stop other insects from eating them'], 'D', 'Paragraph G: "Cochineal insects produce carminic acid to deter predation by other insects."', 'G'),
              mc(9, 'Why was carmine lipstick disapproved of for daily wear in the late 19th century?', ['It damaged the skin.', 'It looked artificial and was costly.', 'It could only be applied by professionals.', 'Its colour faded very quickly.'], 'B', 'Paragraph H: "Carmine dye was expensive, and the look of carmine colored lipstick was considered unnatural and theatrical, so lipstick was frowned upon for everyday wear."', 'H'),
            ],
          },
          {
            id: 'r125-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'Sarah Bernhardt was criticised in the newspapers for wearing make-up in public.', 'NOT GIVEN', 'Paragraph H says that "Sarah Bernhardt, began wearing lipstick and rouge in public" but says nothing about any public or press reaction.', 'H'),
              q(11, 'Combining carmine with oil and wax gave lipstick a more natural appearance.', 'TRUE', 'Paragraph I: "carmine was mixed with an oil and wax base. The mixture gave a natural look and it was more acceptable among women."', 'I'),
              q(12, 'In the 1890s lipstick was already being sold in screw-up metal tubes.', 'FALSE', 'Paragraph I: "At that time, lipstick was not sold in screw up metal tube; it was sold in paper tubes, tinted papers, or in small pots."', 'I'),
              q(13, 'The first swivel-up lipstick tube was patented in the 1920s.', 'TRUE', 'Paragraph J: "In 1923, the first swivel-up tube was patented by James Bruce Mason Jr. in Nashville, Tennessee."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
