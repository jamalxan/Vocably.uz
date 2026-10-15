// Vocably Reading 25 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-25',
  title: 'Reading 25: The Potato',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'potato', title: 'The Potato: From the Andes to the World', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r25-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Wild potatoes grow naturally only in South America.', 'FALSE', 'Paragraph B: "Wild potato species can be found from the southern United States to southern Chile."', 'B'),
              q(2, 'The cultivated potato was domesticated in more than one place.', 'FALSE', 'Paragraph B: "Genetic studies show that the cultivated potato has a single origin, in the area of present-day southern Peru and extreme northwestern Bolivia."', 'B'),
              q(3, 'In 2023, China and India produced more potatoes than any other countries.', 'TRUE', 'Paragraph C: "with China and India leading the world production as of 2023".', 'C'),
              q(4, 'Potatoes that have been kept in the light can become poisonous.', 'TRUE', 'Paragraph D: "if sprouts and potato skins are exposed to light, tubers can become toxic".', 'D'),
              q(5, 'The word "spud" was first applied to the vegetable in Denmark.', 'NOT GIVEN', 'Paragraph E links the word to a knife "probably related to Danish spyd" and says the meaning "was transferred to the tuber from around 1840", but does not say where this first happened.', 'E'),
            ],
          },
          {
            id: 'r25-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(6, 'Roughly how many varieties of potato exist today?', ['5,000', '5000', 'over 5,000', 'over 5000'], 'Paragraph C: "there are now over 5,000 different varieties of potatoes".', 'C'),
              q(7, 'Which parts of the potato plant contain solanine?', 'aerial parts', 'Paragraph D: "The aerial parts of the potato contain the toxin solanine."', 'D'),
              q(8, 'What is the maximum height of a potato plant?', ['one metre', '1 metre', '1 m', 'three feet', '3 feet'], 'Paragraph F: "Potato plants are herbaceous perennials that grow up to one metre (three feet) high."', 'F'),
              q(9, 'What name is given to the small holes through which a tuber breathes?', 'lenticels', 'Paragraph G: "the tubers have small holes that allow breathing, called lenticels".', 'G'),
            ],
          },
          {
            id: 'r25-ends', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'are suited to regions where the days are long.',
              'are in fact stems rather than roots.',
              'has been greatly reduced in commercial varieties.',
              'descend from a single point within one wild species.',
              'is adapted to places where the days are short.',
              'contain 24 chromosomes.',
              'were brought to Europe by the Portuguese.',
            ]),
            questions: [
              q(10, 'Potato tubers', 'B', 'Paragraph G: "These are not roots but stems that form from thickened rhizomes at the tips of long thin stolons."', 'G'),
              q(11, 'The tendency of tubers to form as days get shorter', 'C', 'Paragraph G: "Tubers form in response to decreasing day length, although this tendency has been minimized in commercial varieties."', 'G'),
              q(12, 'The Andean subspecies of the potato', 'E', 'Paragraph J: "The Andean potato, S. tuberosum andigena, is adapted to the short-day conditions prevalent in the mountainous equatorial and tropical regions where it originated."', 'J'),
              q(13, 'According to a 2025 study, all potato landraces', 'D', 'Paragraph K: "the study posits that all landraces branch out from a single point within Solanum candolleanum".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
