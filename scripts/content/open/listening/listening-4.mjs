// Vocably Listening 4 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-4',
  title: 'Listening 4: What Cookbooks Reveal',
  difficulty: 'medium',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'cookbooks-show-american-culture',
        contextText: 'You will hear a report about what American cookbooks tell us about history and culture.',
        questionGroups: [
          {
            id: 'l4-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(1, 'The first American cookbook was published in ______.', '1796', 'The speaker says "The first, published in 1796, started a market that continues in the 21st century".'),
              q(2, 'Megan Elias is the director of ______ at Boston University.', 'food studies', 'The speaker says "Megan Elias is the director of food studies at Boston University".'),
              q(3, 'Elias says that many recipes for ______ show that the book comes from a time without refrigeration.', 'pickles', 'Elias says "If you see a lot of recipes for things that are preserved for pickles, you know that you are looking at a time without refrigeration."'),
              q(4, 'According to Amy Bentley, old cookbooks even told readers what to do if a child had been ______.', 'poisoned', 'Bentley says "what to do when your child has been poisoned".'),
            ],
          },
          {
            id: 'l4-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(5, 'According to Elias, cookbooks from the South tried to', ['explain the causes of the Civil War.', 'present an attractive picture of the old South.', 'record the recipes of enslaved people.', 'raise money for soldiers.'], 'B', 'Elias says Southern cookbooks tried to offer "a beautiful version of the old South that will kind of heal over the wounds of the Civil War".'),
              mc(6, 'Why did some communities produce a group cookbook?', ['to collect money', 'to welcome new residents', 'to protect old traditions', 'to compete with publishers'], 'A', 'The speaker says "Some communities would put together a group cookbook to raise money."'),
              mc(7, 'What happened in the 1930s?', ['Bacteria in food became more dangerous.', 'Refrigerators became common in American homes.', 'Publishers lost control of cookbook content.', 'The first food websites appeared.'], 'B', 'The speaker says "in the 1930s, refrigerators became common objects in American homes".'),
            ],
          },
          {
            id: 'l4-people', type: 'matching_features', bankReusable: true,
            instructionHtml: 'Which person is connected with each of the following statements? Choose the correct letter, <strong>A, B or C</strong>. You may use any letter more than once.',
            bank: bank(['Megan Elias', 'Amy Bentley', 'Amelia Simmons']),
            questions: [
              q(8, 'wrote the first cookbook published in the United States', 'C', 'The speaker says "American Cookery by Amelia Simmons is the first cookbook published in the United States."'),
              q(9, 'says the main aim of publishing companies is to make money', 'A', 'The speaker says "Elias said publishing companies mostly control cookbook content" and that "their main goal is to make money from book sales".'),
              q(10, 'says printed cookbooks make good presents', 'B', 'The speaker says "Physical cookbooks are still highly desirable as well, Bentley says." and she adds "They\'re very good to give as gifts."'),
            ],
          },
        ],
      }),
    ],
  },
};
