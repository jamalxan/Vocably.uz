// Vocably Reading 40 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-40',
  title: 'Reading 40: The Shrinking Forests',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'deforestation', title: 'The Shrinking Forests', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r40-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Forests currently cover less than a third of the land on Earth.', 'TRUE', 'Paragraph A: "About 31% of Earth\'s land surface is covered by forests at present."', 'A'),
              q(2, 'Half of the forest lost since farming began disappeared within the last hundred years.', 'TRUE', 'Paragraph A: "This is one-third less than the forest cover before the expansion of agriculture, with half of that loss occurring in the last century."', 'A'),
              q(3, 'The share of deforestation caused by agriculture has fallen since 2012.', 'FALSE', 'Paragraph B: "In 2025 nearly 90% of global deforestation was caused by agriculture" and "this is up from more than 80% in 2012".', 'B'),
              q(4, 'Mining destroys more forest than logging does.', 'NOT GIVEN', 'Paragraph B lists "the wood industry (logging), urbanization and mining" as further drivers but does not rank them against each other.', 'B'),
              q(5, 'The rate of deforestation has risen over the past thirty years.', 'FALSE', 'Paragraph E: "the rate of deforestation has decreased over the past three decades".', 'E'),
            ],
          },
          {
            id: 'r40-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(['Measure', 'Figure'], [
              ['Total forest area worldwide', '{{q6}} billion hectares'],
              ['Forest area per person', '{{q7}} hectares'],
              ['Region with the largest forest area (25% of the total)', '{{q8}}'],
              ['Annual net forest loss, 2015–2025', '{{q9}} million hectares'],
            ], 'World forests in numbers'),
            questions: [
              q(6, null, '4.14', 'Paragraph G: "The world has a total forest area of 4.14 billion hectares (ha), which is 32% of the global land area".', 'G'),
              q(7, null, ['0.50', '0.5'], 'Paragraph G: "equivalent to 0.50 ha of forest per person".', 'G'),
              q(8, null, 'Europe', 'Paragraph G: "Of the regions, Europe has the largest forest area, accounting for 25% of the world’s total."', 'G'),
              q(9, null, '4.12', 'Paragraph H: "The annual rate of net forest loss increased in the period 2015–2025, to 4.12 million ha".', 'H'),
            ],
          },
          {
            id: 'r40-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(10, 'Which of the following is NOT mentioned in paragraph C as a consequence of deforestation?', [
                'the loss of plant and animal species',
                'the displacement of people living in forests',
                'a rise in sea levels',
                'the erosion of soil',
              ], 'C', 'Paragraph C lists "biodiversity loss", "extinction of animals and plants", "displacement of indigenous people who live in forests" and "desertification and soil erosion"; sea levels are not mentioned.', 'C'),
              mc(11, 'How does net forest change differ from deforestation?', [
                'It takes account of forest gains as well as losses.',
                'It counts only tropical forests.',
                'It is always a negative figure.',
                'It excludes losses caused by fire.',
              ], 'A', 'Paragraph F: "the latter is the sum of all forest losses (deforestation) and all forest gains (forest expansion) in a given period".', 'F'),
              mc(12, 'According to the writer, net forest loss slowed between 2000 and 2015 mainly because', [
                'deforestation in the tropics came to a halt.',
                'forest area grew substantially in four large countries.',
                'there were fewer wildfires.',
                'international agreements restricted logging.',
              ], 'B', 'Paragraph H: the decrease was "due mainly to large increases in forest area in Canada, China, the Russian Federation and the United States of America".', 'H'),
              mc(13, 'What does the writer say about forest area in Africa and South America?', [
                'It has grown slightly since 1990.',
                'It has stayed roughly the same since 1990.',
                'It fell faster in the decade to 2025 than before.',
                'It has fallen since 1990, though the decline has recently slowed.',
              ], 'D', 'Paragraph K: "Forest area has declined substantially in Africa and South America since 1990, although the rate of loss slowed in both regions in the decade to 2025."', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
