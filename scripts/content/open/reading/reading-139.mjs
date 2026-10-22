// Vocably Reading 139 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD ONLY' };
const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS' };

export default {
  slug: 'vocably-reading-139',
  title: 'Reading 139: Cheese',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'cheese', title: 'Cheese: From Accident to Art', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r139-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Cheese is occasionally made from the milk of water buffalo.', 'TRUE', 'Paragraph A: milk "usually from cows, goats or sheep, and sometimes of water buffalo".', 'A'),
              q(2, 'A cheesemonger is a person who manufactures cheese.', 'FALSE', 'Paragraph B: "A cheesemonger, or specialist seller of cheeses".', 'B'),
              q(3, 'Some vegetarian rennet is produced with the help of a fungus.', 'TRUE', 'Paragraph C: "Vegetarian varieties of rennet are available; most are produced through fermentation by the fungus Mucor miehei".', 'C'),
              q(4, 'Soft cheeses such as Brie keep for longer than hard cheeses.', 'FALSE', 'Paragraph D: "Hard cheeses, such as Cheddar and Parmesan, last longer than soft cheeses, such as Brie or goat\'s milk cheese."', 'D'),
              q(5, 'The Arab trader in the legend was travelling across a desert.', 'NOT GIVEN', 'Paragraph F mentions "a legend—with variations—about the discovery of cheese by an Arab trader" but says nothing about where he was travelling.', 'F'),
            ],
          },
          {
            id: 'r139-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Place', 'Evidence'],
              [
                ['5500 BCE', 'Kuyavia, {{q6}}', 'strainers coated with milk-fat molecules'],
                ['5200 BCE', 'Dalmatian coast, Croatia', 'earliest evidence of cheesemaking in the {{q7}}'],
                ['c. 2000 BCE', 'Egypt', 'cheese shown in tomb {{q8}}'],
                ['1615 BCE', 'Xiaohe Cemetery, China', 'the oldest {{q9}} cheese ever found, discovered on mummies'],
              ],
              'Early evidence of cheesemaking',
            ),
            questions: [
              q(6, null, 'Poland', 'Paragraph G: "found in what is now Kuyavia, Poland, where strainers coated with milk-fat molecules have been found".', 'G'),
              q(7, null, 'Mediterranean', 'Paragraph G: "The earliest evidence of cheesemaking in the Mediterranean dates back to 5200 BCE, on the coast of the Dalmatia region of Croatia."', 'G'),
              q(8, null, 'murals', 'Paragraph H: "Early archeological evidence of Egyptian cheese has been found in Egyptian tomb murals, dating to about 2000 BCE."', 'H'),
              q(9, null, 'preserved', 'Paragraph H: "The earliest ever discovered preserved cheese was found on mummies in Xiaohe Cemetery in the Taklamakan Desert in Xinjiang, China".', 'H'),
            ],
          },
          {
            id: 'r139-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Cheese in the Roman world</strong></p><p>A description of cheesemaking involving rennet, pressing, salting and ageing appears in the work of {{q10}}, written around 65 CE. According to Pliny the Elder, the finest cheeses came from villages near {{q11}}, but they had to be eaten quickly because they did not keep. One cheese from Liguria was made largely from the milk of {{q12}}, and some cheeses produced in the area reportedly weighed as much as a thousand pounds each. Cheese made from goats\' milk had only recently become popular in Rome; the Romans improved on the Gaulish version by {{q13}} it.</p>',
            questions: [
              q(10, null, ['Columella', 'Columella\'s'], 'Paragraph K: "Columella\'s De Re Rustica (c. 65 CE) details a cheesemaking process involving rennet coagulation, pressing of the curd, salting, and aging."', 'K'),
              q(11, null, ['Nîmes', 'Nimes'], 'Paragraph K: "He stated that the best cheeses came from the villages near Nîmes, but did not keep long and had to be eaten fresh."', 'K'),
              q(12, null, 'sheep', 'Paragraph K: "A Ligurian cheese was noted for being made mostly from sheep\'s milk".', 'K'),
              q(13, null, 'smoking', 'Paragraph K: goats\' milk cheese was "improved over the" medicinal taste "of Gaul\'s similar cheeses by smoking".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
