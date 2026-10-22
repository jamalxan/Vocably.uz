// Vocably Reading 115 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-115',
  title: 'Reading 115: The Dutch East India Company',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'dutch-east-india-company', title: 'The World\'s First Multinational', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r115-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(1, 'When the VOC was founded in 1602, it received a monopoly on Asian trade lasting ______ years.', ['21', 'twenty-one'], 'Paragraph A: "it was granted a 21-year monopoly to carry out trade activities in Asia".', 'A'),
              q(2, 'As well as waging war and founding colonies, the company was allowed to produce its own ______.', 'coins', 'Paragraph A: "The company possessed quasi-governmental powers, including the ability to wage war, imprison and execute convicts, negotiate treaties, strike its own coins, and establish colonies."', 'A'),
              q(3, 'The English East India Company carried only ______ of the tonnage of goods transported by the VOC.', ['one-fifth', 'one fifth', 'a fifth'], 'Paragraph B: the English company "was a distant second to its total traffic, with 2,690 ships and one-fifth the tonnage of goods carried by the VOC".', 'B'),
              q(4, 'For almost two centuries the VOC paid yearly dividends that averaged about ______ of its capital.', ['18%', '18 percent'], 'Paragraph C: "paid annual dividends that averaged about 18% of the capital for almost 200 years".', 'C'),
            ],
          },
          {
            id: 'r115-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'Batavia was the original name of the port that is now Jakarta.', 'FALSE', 'Paragraph C: "the VOC established a capital in the port city of Jayakarta in 1619 and changed its name to Batavia, now Jakarta".', 'C'),
              q(6, 'The VOC monogram may have been the first company logo recognised across the world.', 'TRUE', 'Paragraph D: the monogram "was possibly the first globally recognised corporate logo".', 'D'),
              q(7, 'The name \'Dutch East India Company\' helps to distinguish the VOC from similar companies in other countries.', 'TRUE', 'Paragraph E: the name "is used to make a distinction from the [British] East India Company (EIC) and other East Indian companies".', 'E'),
              q(8, 'Pepper was the most expensive spice sold in northern Europe.', 'NOT GIVEN', 'Paragraph F says that "each lag in the supply of pepper caused a sharp rise in pepper prices" but does not compare the price of pepper with that of other spices.', 'F'),
              q(9, 'Houtman\'s 1595 expedition came home without making a profit.', 'FALSE', 'Paragraph H: "Half the crew were lost before the expedition made it back to the Netherlands in 1596, but with enough spices to make a considerable profit."', 'H'),
            ],
          },
          {
            id: 'r115-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eight paragraphs, A-H. Which paragraph contains the following information? <em>Write the correct letter, A-H.</em>',
            questions: [
              q(10, 'the political reason why Portuguese possessions became a legitimate target for the Dutch', 'G', 'Paragraph G: "the Portuguese crown was united in a personal union with the Spanish crown, known as the Iberian Union, with which the Dutch Republic was at war. The Portuguese Empire thus became an appropriate target for Dutch military incursions."', 'G'),
              q(11, 'a comparison between the number of people the VOC sent to Asia and the number sent by the rest of Europe', 'B', 'Paragraph B: "the VOC sent nearly a million Europeans to work in the Asia trade" while "the rest of Europe combined sent 882,412 people from 1500 to 1795".', 'B'),
              q(12, 'the problems that led to the company going bankrupt', 'C', 'Paragraph C: "Weighed down by smuggling, corruption and growing administrative costs in the late 18th century, the company went bankrupt".', 'C'),
              q(13, 'how ordinary people were able to buy and sell shares in the company', 'A', 'Paragraph A: "Shares in the company could be purchased by any citizen of the Dutch Republic and bought and sold in open-air secondary markets".', 'A'),
            ],
          },
        ],
      }),
    ],
  },
};
