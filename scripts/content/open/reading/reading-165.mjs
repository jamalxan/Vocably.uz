// Vocably Reading 165 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-165',
  title: 'Reading 165: Vanilla',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'vanilla', title: 'Vanilla: From Mexican Forests to the World', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r165-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Charles Morren', 'Edmond Albius', 'Jean Michel Claude Richard', 'Hernán Cortés', 'Hugh Morgan', 'Philip Miller']),
            questions: [
              q(1, 'wrongly asserted that he had found a technique before anyone else', 'C', 'Paragraph A: "Jean Michel Claude Richard falsely claimed to have discovered the technique three or four years earlier".', 'A'),
              q(2, 'devised a way of pollinating the plant that was too costly to use', 'A', 'Paragraph A: Morren "pioneered a method of artificially pollinating the plant" but "The method proved financially unworkable and was not deployed commercially."', 'A'),
              q(3, 'made a discovery as a child that allowed the plant to be grown worldwide', 'B', 'Paragraph A: "Edmond Albius, a 12-year-old enslaved child who lived on the French island of Réunion in the Indian Ocean, discovered that the plant could be hand-pollinated. Hand-pollination allowed global cultivation of the plant."', 'A'),
              q(4, 'created vanilla-flavoured sweets that contained no chocolate', 'E', 'Paragraph F: "Hugh Morgan, a creative apothecary in the employ of Queen Elizabeth I, created chocolate-free, vanilla-flavored" sweetmeats.', 'F'),
              q(5, 'is believed to have brought vanilla to Europe', 'D', 'Paragraph F: "Hernán Cortés is credited with introducing both vanilla and chocolate to Europe in the 1520s."', 'F'),
            ],
          },
          {
            id: 'r165-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Most of the world\'s vanilla comes from the species V. pompona.', 'FALSE', 'Paragraph B: "The majority of the world\'s vanilla is the V. planifolia species, more commonly known as Bourbon vanilla".', 'B'),
              q(7, 'Vanilla is the most expensive spice in the world by weight.', 'FALSE', 'Paragraph C: "vanilla is the world\'s second-most expensive spice after saffron".', 'C'),
              q(8, 'The Totonacs used vanilla for purposes other than flavouring food.', 'TRUE', 'Paragraph D: "The Totonac used vanilla as a fragrance in temples and as a good-luck charm in amulets, as well as flavoring for food and beverages."', 'D'),
              q(9, 'The Aztecs sweetened their vanilla and cocoa drink with sugar.', 'FALSE', 'Paragraph E: "sugarcane was not harvested in these regions at the time and there were no other sweeteners available".', 'E'),
              q(10, 'Hugh Morgan\'s vanilla sweets were popular at the English court.', 'NOT GIVEN', 'Paragraph F says he "created chocolate-free, vanilla-flavored" sweetmeats while working for Queen Elizabeth I, but says nothing about how popular they were.', 'F'),
            ],
          },
          {
            id: 'r165-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Period', 'Price movement', 'Cause'],
              [
                ['late 1970s - early 1980s', 'rose sharply and stayed high', 'a tropical {{q11}} destroyed key croplands'],
                ['mid-1980s onwards', 'fell by {{q12}}% to nearly US$20 per kg', 'the cartel that had controlled prices since 1930 broke up'],
                ['2004', 'climbed to US${{q13}} per kg', 'cyclone Hudah, political instability and bad weather'],
                ['mid-2005', 'dropped to around US$40 per kg', 'a good harvest and lower demand because of {{q14}} vanilla'],
              ],
              'The price of vanilla',
            ),
            questions: [
              q(11, null, 'cyclone', 'Paragraph G: "After a tropical cyclone ravaged key croplands, the market price of vanilla rose sharply in the late 1970s".', 'G'),
              q(12, null, '70', 'Paragraph G: "Prices dropped 70% over the next few years, to nearly US$20 per kilogram".', 'G'),
              q(13, null, '500', 'Paragraph G: "The cyclone, political instability, and poor weather in the third year drove vanilla prices to US$500/kg in 2004".', 'G'),
              q(14, null, 'imitation', 'Paragraph G: "A good crop, coupled with decreased demand caused by the production of imitation vanilla, pushed the market price down to the $40/kg range in the middle of 2005."', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
