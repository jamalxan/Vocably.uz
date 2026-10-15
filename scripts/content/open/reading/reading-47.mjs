// Vocably Reading 47 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-47',
  title: 'Reading 47: The History of Perfume',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'perfume', title: 'A Short History of Perfume', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r47-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Choose the correct letter, A-K.</em>',
            questions: [
              q(1, 'the origin of the word perfume', 'C', 'Paragraph C: "The word perfume is derived from the Latin perfumare".', 'C'),
              q(2, 'a claim that perfumes helped the progress of a branch of science', 'A', 'Paragraph A: Ružička stated that "perfumes have substantially contributed to the development of organic chemistry".', 'A'),
              q(3, 'a building that was said to have kept its scent for hundreds of years', 'E', 'Paragraph E: a temple "was said to have saffron blended into its wall plaster, allowing the interior to remain fragrant for 500 years".', 'E'),
              q(4, 'the reason why a secret passage was built', 'I', 'Paragraph I: "His laboratory was connected with her apartments by a secret passageway so that no formulae could be stolen en route."', 'I'),
              q(5, 'a social freedom that led women to wear perfume', 'H', 'Paragraph H: "This freedom allowed courtship to occur outside of the home. As a result, Andalusian women used perfumes for courtship."', 'H'),
            ],
          },
          {
            id: 'r47-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 6-10) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Tapputi', 'Al-Kindi', 'Ibn Sina', 'René the Florentine', 'Giovanni Paolo Feminis', 'Leopold Ružička']),
            questions: [
              q(6, 'developed a way of obtaining oil from flowers that is still the usual method', 'C', 'Paragraph G: "introduced the process of extracting oils from flowers by means of distillation, the procedure most commonly used today".', 'G'),
              q(7, 'is regarded as one of the earliest chemists on record', 'A', 'Paragraph D: "One of the world\'s first-recorded chemists is considered to be a woman named Tapputi".', 'D'),
              q(8, 'brought advanced perfume-making techniques from one country to another', 'D', 'Paragraph I: René the Florentine "took Italian refinements to France".', 'I'),
              q(9, 'wrote a book containing over a hundred recipes', 'B', 'Paragraph F: the book "contained more than a hundred recipes for fragrant oils, salves, aromatic waters, and substitutes or imitations of costly drugs".', 'F'),
              q(10, 'created a product that is now known by a different name', 'E', 'Paragraph J: "created a perfume water called Aqua Admirabilis, today best known as eau de cologne".', 'J'),
            ],
          },
          {
            id: 'r47-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Modern perfumery began when aroma compounds such as vanillin and ______ could be made commercially.', 'coumarin', 'Paragraph B: "the commercial synthesis of aroma compounds such as vanillin and coumarin".', 'B'),
              q(12, 'The ancient perfume factory found in Cyprus contained at least ______ stills.', '60', 'Paragraph E: "a 300-square-meter (3,230 sq ft) factory housing at least 60 stills".', 'E'),
              q(13, 'Before distillation was introduced, liquid perfumes were a mixture of oil and crushed herbs or ______.', 'petals', 'Paragraph G: "liquid perfumes consisted of mixtures of oil and crushed herbs or petals".', 'G'),
              q(14, 'Hungary Water was produced by blending scented oils in ______.', ['alcohol', 'alcohol solution'], 'Paragraph I: "a perfume made of scented oils blended in an alcohol solution".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
