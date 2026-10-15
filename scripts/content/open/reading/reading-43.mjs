// Vocably Reading 43 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-43',
  title: 'Reading 43: The Amazon Rainforest',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'amazon-rainforest', title: 'The Amazon: A Forest Shaped by People', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r43-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Francisco de Orellana', 'Betty Meggers', 'Percy Fawcett', 'Ondemar Dias', 'Alceu Ranzi', 'Michael Heckenberger']),
            questions: [
              q(1, 'argued that the forest could feed only a very small number of people per square kilometre', 'B', 'Paragraph G: "She claimed that a population density of 0.2 inhabitants per square kilometre (0.52/sq mi) is the maximum that can be sustained in the rainforest through hunting".', 'G'),
              q(2, 'is credited with being the first to notice large shapes cut into the land', 'D', 'Paragraph J: "Ondemar Dias is accredited with first discovering the geoglyphs in 1977".', 'J'),
              q(3, 'vanished while searching for an ancient civilisation', 'C', 'Paragraph I: "The results of his expeditions were inconclusive, and he disappeared mysteriously on his last trip."', 'I'),
              q(4, 'named the region after a fight in which women took part', 'A', 'Paragraph E: "Orellana derived the name Amazonas from the Amazons of Greek mythology".', 'E'),
              q(5, 'led a group that found the remains of roads and public squares', 'F', 'Paragraph J: settlements "were found in 2003 by Michael Heckenberger and colleagues of the University of Florida. Among those were evidence of roads, bridges and large plazas."', 'J'),
            ],
          },
          {
            id: 'r43-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'More than half of the Amazon rainforest lies within Brazil.', 'TRUE', 'Paragraph B: "The majority of the forest, 60%, is in Brazil".', 'B'),
              q(7, 'Most of the isolated indigenous groups are located in Brazil.', 'NOT GIVEN', 'Paragraph C says only that "60 groups remain largely isolated"; it does not say where they live.', 'C'),
              q(8, 'The economic damage caused by deforestation in Brazil may far exceed the value of what is produced on the cleared land.', 'TRUE', 'Paragraph D: "Economic losses due to deforestation in Brazil could be approximately 7 times higher in comparison to the cost of all commodities produced through deforestation."', 'D'),
              q(9, 'People first settled in the Amazon region around AD 1250.', 'FALSE', 'Paragraph F: "human inhabitants first settled in the Amazon region at least 11,200 years ago".', 'F'),
              q(10, 'The indigenous population of the Amazon grew between 1500 and 1900.', 'FALSE', 'Paragraph H: "Some 5 million people may have lived in the Amazon region in AD 1500" but "By 1900, the native indigenous population had fallen to 1 million".', 'H'),
            ],
          },
          {
            id: 'r43-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Which sites in eastern Ecuador are older than every other known complex society in the Amazon?', ['the Upano Valley', 'Upano Valley', 'Upano Valley sites'], 'Paragraph G: "The Upano Valley sites in present-day eastern Ecuador predate all known complex Amazonian societies."', 'G'),
              q(12, 'In what year did a European first travel the entire length of the Amazon River?', '1542', 'Paragraph I: "The first European to travel the length of the Amazon River was Francisco de Orellana in 1542."', 'I'),
              q(13, 'Which disease is given as an example of what destroyed the early Amazonian civilisation?', 'smallpox', 'Paragraph I: "devastated by the spread of diseases from Europe, such as smallpox".', 'I'),
              q(14, 'What type of fertile soil is now accepted as the product of indigenous land management?', 'terra preta', 'Paragraph J: "Terra preta is found over large areas in the Amazon forest; and is now widely accepted as a product of indigenous soil management."', 'J'),
            ],
          },
        ],
      }),
    ],
  },
};
