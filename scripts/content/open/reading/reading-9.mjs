// Vocably Reading 9 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-9',
  title: 'Reading 9: Chewing Gum',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'chewing-gum', title: 'A Short History of Chewing Gum', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r9-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has seven paragraphs, A-G. Which paragraph contains the following information? <em>Write the correct letter, A-G.</em>',
            questions: [
              q(1, 'why the texture of gum is similar to that of rubber', 'A', 'Paragraph A: "Its texture is reminiscent of rubber because of the physical-chemical properties of its polymer, plasticizer, and resin components".', 'A'),
              q(2, 'a gum designed to exercise the mouth rather than to taste pleasant', 'D', 'Paragraph D: "Semple\'s gum was intended to clean the teeth and strengthen the chewer\'s jaw. It was not a sweet treat".', 'D'),
              q(3, 'the role of soldiers in spreading chewing gum internationally', 'F', 'Paragraph F: "Chewing gum gained worldwide popularity through American GIs in WWII, who were supplied chewing gum as a ration".', 'F'),
              q(4, 'physical evidence that people chewed gum thousands of years ago', 'C', 'Paragraph C: "5,000-year-old chewing gum made from birch bark tar, with tooth imprints, has been found in Kierikki in Finland".', 'C'),
              q(5, 'the basic motive that led early humans to chew natural substances', 'B', 'Paragraph B: each early gum "was chewed purely out of the instinctual desire to masticate".', 'B'),
              q(6, 'how rising prices disguised a fall in the amount of gum sold', 'G', 'Paragraph G: "this was the result of inflation as the average price of a pack increased".', 'G'),
            ],
          },
          {
            id: 'r9-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>The commercial beginnings of chewing gum in the United States</strong></p><p>Native Americans chewed the resin of {{q7}} trees, a habit that the New England settlers copied. In 1848 John B. Curtis sold the first commercial gum, but around 1850 it was overtaken in popularity by a gum made from {{q8}}, a product of petroleum. These early gums were not sweet, so chewers repeatedly dipped them in {{q9}}. The first flavoured gum was produced in the 1860s by John Colgan, a {{q10}} from Kentucky.</p>',
            questions: [
              q(7, null, 'spruce', 'Paragraph D: "The American Indians chewed resin made from the sap of spruce trees."', 'D'),
              q(8, null, 'paraffin wax', 'Paragraph D: "a gum made from paraffin wax, a petroleum product, was developed and soon exceeded the spruce gum in popularity".', 'D'),
              q(9, null, 'powdered sugar', 'Paragraph D: "the chewer would often make use of a plate of powdered sugar, which they would repeatedly dip the gum in".', 'D'),
              q(10, null, 'pharmacist', 'Paragraph E: "The first flavored chewing gum was created in the 1860s by John Colgan, a Louisville, Kentucky, pharmacist."', 'E'),
            ],
          },
          {
            id: 'r9-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(11, 'What does the writer say about the birch bark tar chewed in ancient Finland?', ['It was sweetened with honey.', 'It is chemically unlike most other early gums.', 'It was imported from Greece.', 'It was mainly used to glue objects together.'], 'B', 'Paragraph C: "It is chemically similar to petroleum tar and is in this way different from most other early gum."', 'C'),
              mc(12, 'Why did Santa Anna bring chicle to New York?', ['to sell it as chewing gum', 'to have it used as a substitute for rubber', 'to repay a debt to Thomas Adams', 'to set up a sweet-making business'], 'B', 'Paragraph F: "he gave it to Thomas Adams for use as a rubber substitute".', 'F'),
              mc(13, 'Why had US manufacturers switched to synthetic rubber by the 1960s?', ['Supplies of chicle had run out completely.', 'It was less expensive to produce.', 'It had a better flavour than chicle.', 'Consumers demanded it.'], 'B', 'Paragraph F: "US manufacturers had switched to butadiene-based synthetic rubber, as it was cheaper to manufacture".', 'F'),
              mc(14, 'Which explanation is given for the fall in gum sales in the United States in the early 21st century?', ['Gum was no longer sold near the checkout.', 'Smartphones reduced the number of impulse purchases.', 'Gum became associated with teenage rebellion.', 'Dentists advised people to stop chewing it.'], 'B', 'Paragraph F: "Others blamed smartphones reducing impulse purchases at the checkout."', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
