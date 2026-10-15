// Vocably Reading 4 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-4',
  title: 'Reading 4: The Safety Pin',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'safety-pin', title: 'A Small Invention with a Long History', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r4-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'a reference to disagreement about where a fashion trend originated', 'J', 'Paragraph J: "This is disputed by a number of artists from the first wave of British punks".', 'J'),
              q(2, 'the sum an inventor was paid for the rights to his design', 'G', 'Paragraph G: "Hunt sold the patent to W.R. Grace and Company for $400".', 'G'),
              q(3, 'a description of an ancient fastener with a hole at one end', 'C', 'Paragraph C: "The toggle pin was a pin characterized by an eyelet in one end".', 'C'),
              q(4, 'criticism of a symbolic use of safety pins', 'K', 'Paragraph K: "Some commentators and activists derided the wearing of safety pins".', 'K'),
              q(5, 'how safety pins are classified when they are sold', 'B', 'Paragraph B: "Safety pins are divided into numbered size categories."', 'B'),
              q(6, 'a doctor who built tools for dealing with a medical emergency', 'I', 'Paragraph I: "Dr. Chevalier Jackson devised special instruments for removing swallowed safety pins".', 'I'),
            ],
          },
          {
            id: 'r4-summary', type: 'summary_completion', wordLimit: W2,
            instructionHtml: 'Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: '<p><strong>Walter Hunt\'s invention</strong></p><p>Walter Hunt, an American {{q7}}, is credited with inventing the modern safety pin. He came up with the idea because he needed to repay a debt of {{q8}} to a friend. Using a length of {{q9}} roughly eight inches long, he twisted a coil in the middle so that the pin would spring open when released, and added a clasp to cover the sharp end. After obtaining a patent in 1849, Hunt sold it for $400; once the debt was settled he was left with {{q10}}.</p>',
            questions: [
              q(7, null, 'mechanic', 'Paragraph E: "American mechanic Walter Hunt is regarded as the inventor of the modern safety pin."', 'E'),
              q(8, null, ['$15', '15', '15 dollars'], 'Paragraph F: "Hunt made the invention in order to pay off a $15 debt to a friend."', 'F'),
              q(9, null, 'brass wire', 'Paragraph F: "He used a piece of brass wire that was about 8 inches (200 mm) long".', 'F'),
              q(10, null, ['$385', '385', '385 dollars'], 'Paragraph G: "kept the remaining amount of $385 for himself".', 'G'),
            ],
          },
          {
            id: 'r4-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(11, 'Nappy pins remove every danger that a safety pin poses to a baby.', 'FALSE', 'Paragraph B: the safety clasp, "while remaining an ingestion hazard, prevents the baby from being jabbed or pricked".', 'B'),
              q(12, 'In ancient Greece the fibula was worn by both men and women.', 'TRUE', 'Paragraph D: "Fibulae were used by Greek women and men to help secure tunics."', 'D'),
              q(13, 'Charles Rowley\'s pin sold better than Hunt\'s in Britain.', 'NOT GIVEN', 'Paragraph E says only that Rowley "independently patented a similar safety pin in October 1849, though they are no longer made"; nothing is said about sales.', 'E'),
              q(14, 'The swallowing of safety pins has ceased to be a problem.', 'FALSE', 'Paragraph I: "Safety pin ingestion is still a common problem in some countries."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
