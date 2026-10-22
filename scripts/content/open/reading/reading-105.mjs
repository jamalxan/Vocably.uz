// Vocably Reading 105 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-105',
  title: 'Reading 105: Garlic',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'garlic', title: 'Garlic', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r105-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What does the passage say about where garlic comes from?', ['It was first grown in Mediterranean Europe.', 'It is native to Central Asia and neighbouring regions.', 'It originated in the Yunnan province of China.', 'Its origin is completely unknown.'], 'B', 'Paragraph A: "Garlic is native to Central Asia, northeastern Iran and the foothills of Himalayas."', 'A'),
              mc(2, 'What causes the sharp flavour of garlic to develop?', ['damage to the plant\'s cells', 'exposure to sunlight while the bulb grows', 'the heat of cooking', 'the decay of the outer sheathing leaves'], 'A', 'Paragraph E: "The phytochemicals responsible for the sharp flavor of garlic are produced when the plant\'s cells are damaged."', 'E'),
              mc(3, 'Why do scientists think garlic produces these compounds?', ['to attract pollinating insects', 'to help the plant survive cold winters', 'to prevent fungal infections of the bulb', 'to protect the plant from being eaten'], 'D', 'Paragraph F: "these compounds are believed to have evolved as a defensive mechanism, deterring animals such as birds, insects, and worms from eating the plant".', 'F'),
              mc(4, 'Why is it hard to identify the wild ancestor of garlic?', ['All of garlic\'s wild relatives have become extinct.', 'Garlic looks nothing like any wild species.', 'Most cultivated varieties are sterile, so crossing tests are limited.', 'Garlic grows wild in too many parts of the world.'], 'C', 'Paragraph H: "Identification of the wild progenitor of common garlic is difficult due to the sterility of its many cultivars, which limits the ability to cross test with wild relatives."', 'H'),
            ],
          },
          {
            id: 'r105-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'A garlic flowering stem can grow to about one metre in height.', 'TRUE', 'Paragraph C: "It grows from a bulb, with a tall, erect flowering stem that reaches up to 1 m (3 ft)."', 'C'),
              q(6, 'All the cloves in a garlic bulb have the same shape.', 'FALSE', 'Paragraph D: "The cloves close to the center are symmetrical, and those surrounding the center can be asymmetrical."', 'D'),
              q(7, 'Garlic can be cultivated in Alaska if it is planted correctly.', 'TRUE', 'Paragraph D: "If garlic is planted at the proper time and depth, it can be grown as far north as Alaska."', 'D'),
              q(8, 'Cooked garlic has fewer health benefits than raw garlic.', 'NOT GIVEN', 'Paragraph G says "The process of cooking garlic removes allicin, thus mellowing its spiciness" but says nothing about the effect of cooking on health benefits.', 'G'),
              q(9, 'Elephant garlic is a variety of true garlic.', 'FALSE', 'Paragraph I: "So-called elephant garlic is actually a wild leek (A. ampeloprasum) and not a true garlic."', 'I'),
            ],
          },
          {
            id: 'r105-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Which compound is mainly responsible for the burning sensation of raw garlic?', 'allicin', 'Paragraph G: "Allicin has been found to be the compound most responsible for the" hot "sensation of raw garlic".', 'G'),
              q(11, 'In which Chinese province did single clove garlic originate?', ['Yunnan', 'Yunnan province'], 'Paragraph I: "Single clove garlic (also called pearl or solo garlic) originated in the Yunnan province of China."', 'I'),
              q(12, 'What is the common name of the pest Delia platura, which damages garlic seeds?', ['seed corn maggots', 'seed corn maggot'], 'Paragraph J: "a pest that damages its seeds are Delia platura, commonly known as seed corn maggots".', 'J'),
              q(13, 'What colour are the spots produced by leek rust?', ['bright orange', 'orange'], 'Paragraph J: "leek rust, which usually appears as bright orange spots".', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
