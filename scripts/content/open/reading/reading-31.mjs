// Vocably Reading 31 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-31',
  title: 'Reading 31: Why We Laugh',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'laughter', title: 'Why We Laugh', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r31-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has nine paragraphs, A-I. Which paragraph contains the following information? <em>Choose the correct letter, A-I.</em>',
            questions: [
              q(1, 'a claim that certain animals make sounds resembling laughter', 'A', 'Paragraph A: "some other species of primate (chimpanzees, gorillas and orangutans) express laughter-like vocalizations in response to physical contact".', 'A'),
              q(2, 'a disagreement about how early in life laughter first appears', 'C', 'Paragraph C: "One group of researchers speculated that noises from infants as early as 16 days old may be vocal laughing sounds or laughter. However, the weight of the evidence supports the appearance of such sounds at 15 weeks to four months of age."', 'C'),
              q(3, 'evidence that the tendency to laugh may be passed on from parents', 'E', 'Paragraph E: "Provine argues that it probably is genetic" and the twins "inherited some aspects of their laugh sound and pattern, readiness to laugh, and maybe even taste in humor".', 'E'),
              q(4, 'a description of the effect of laughter on the lining of blood vessels', 'H', 'Paragraph H: "laughter causes the dilatation of the inner lining of blood vessels, the endothelium, and increases blood flow".', 'H'),
              q(5, 'a comparison between people with and without a particular medical condition', 'I', 'Paragraph I: "people with heart disease were 40 percent less likely to laugh and be able to recognize humor in a variety of situations, compared to people of the same age without heart disease".', 'I'),
            ],
          },
          {
            id: 'r31-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'Laughter is always an expression of pleasant feelings.', 'FALSE', 'Paragraph A: "On some occasions, however, it may be caused by contrary emotional states such as embarrassment, surprise, or confusion".', 'A'),
              q(7, 'Hearing someone else laugh can make a person laugh too.', 'TRUE', 'Paragraph B: "the laughter of one person can itself provoke laughter from others as a positive feedback".', 'B'),
              q(8, 'Children who are born blind and deaf start laughing later than other children.', 'NOT GIVEN', 'Paragraph D says only that "Children who are born blind and deaf still retain the ability to laugh"; nothing is said about when they begin to laugh.', 'D'),
              q(9, 'The Giggle Twins were raised in homes where laughter was common.', 'FALSE', 'Paragraph E: the twins described their adoptive parents as "undemonstrative and dour", and "neither of these exceptionally happy ladies had known anyone who laughed as much as they did".', 'E'),
            ],
          },
          {
            id: 'r31-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Laughter activates a region at the front of the brain which produces ______.', 'endorphins', 'Paragraph F: "laughter is linked with the activation of the ventromedial prefrontal cortex, that produces endorphins".', 'F'),
              q(11, 'Within the limbic system, laughter involves the hippocampus and the ______.', 'amygdala', 'Paragraph F: "The structures in the limbic system that are involved in laughter are the hippocampus and the amygdala."', 'F'),
              q(12, 'Although laughter is controlled by structures below the cortex, the cerebral cortex is able to ______ or suppress it.', 'modulate', 'Paragraph G: "the cerebral cortex can modulate or suppress them".', 'G'),
              q(13, 'Laughter strengthens the immune system partly by making ______ more effective.', 'T-cells', 'Paragraph I: "Laughter also boosts the number of antibody-producing cells and enhances the effectiveness of T-cells, leading to a stronger immune system."', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
