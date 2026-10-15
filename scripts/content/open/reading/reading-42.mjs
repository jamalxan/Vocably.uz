// Vocably Reading 42 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { mc } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-42',
  title: 'Reading 42: Insulin',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'insulin', title: 'Insulin: The Hormone That Controls Blood Sugar', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r42-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'According to the passage, what happens when the level of insulin in the blood is low?', ['The liver stops releasing glucose.', 'Stored body fat starts to be broken down.', 'Muscles absorb more glucose from the blood.', 'The production of proteins increases.'], 'B', 'Paragraph A: "Low insulin in the blood has the opposite effect, promoting widespread catabolism, especially of reserve body fat."', 'A'),
              mc(2, 'The alpha cells of the pancreas', ['release glucagon when blood glucose is high.', 'are destroyed by the immune system in type 1 diabetes.', 'respond to signals coming from the beta cells.', 'convert glucose into glycogen in the liver.'], 'C', 'Paragraph B: "Their neighboring alpha cells, by taking their cues from the beta cells, secrete glucagon into the blood in the opposite manner".', 'B'),
              mc(3, 'Which statement about type 2 diabetes is true according to the passage?', ['It is the result of an autoimmune reaction.', 'The body completely stops secreting insulin.', 'Scientists fully understand how it develops.', 'Glucagon secretion does not react to blood glucose levels.'], 'D', 'Paragraph C: "Type 2 diabetes is characterized by increased glucagon secretion which is unaffected by, and unresponsive to the concentration of blood glucose."', 'C'),
              mc(4, 'Why was insulin from pigs widely used in the past?', ['It was cheaper than insulin from other animals.', 'It is very similar to the human form.', 'It was the first insulin to be isolated.', 'It works better than human insulin.'], 'B', 'Paragraph D: "Porcine insulin is especially close to the human version, and was widely used to treat type 1 diabetics before human insulin could be produced in large quantities".', 'D'),
            ],
          },
          {
            id: 'r42-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(5, 'The structure of insulin is exactly the same in every animal species.', 'FALSE', 'Paragraph D: "Insulin\'s structure varies slightly between species of animals."', 'D'),
              q(6, 'Banting and Best received a Nobel Prize for their discovery.', 'NOT GIVEN', 'Paragraph E says they "were the first to isolate insulin from dog pancreas in 1921" but says nothing about any prize.', 'E'),
              q(7, 'Insulin was the first protein whose complete amino acid sequence was worked out.', 'TRUE', 'Paragraph E: Sanger\'s work "made insulin the first protein to be fully sequenced".', 'E'),
              q(8, 'Proteins resembling insulin exist only in animals.', 'FALSE', 'Paragraph F: "insulin-like proteins are also known to exist in fungi and protists".', 'F'),
              q(9, 'The insulin in cone snail venom is more like the insulin of fish than that of the snails themselves.', 'TRUE', 'Paragraph G: "The insulin toxin, closer in structure to fishes\' than to snails\' native insulin, slows down the prey fishes".', 'G'),
            ],
          },
          {
            id: 'r42-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'Insulin is described as an ______ hormone because it helps build large molecules from small ones.', 'anabolic', 'Paragraph A: "It is thus an anabolic hormone, promoting the conversion of small molecules in the blood into large molecules in the cells."', 'A'),
              q(11, 'In type 2 diabetes, a build-up of ______ in the pancreatic islets probably damages their structure and function.', 'amyloid', 'Paragraph C: "there is an accumulation of amyloid in the pancreatic islets, which likely disrupts their anatomy and physiology".', 'C'),
              q(12, 'A molecule of human insulin is made up of ______ amino acids.', '51', 'Paragraph D: "The human insulin protein is composed of 51 amino acids".', 'D'),
              q(13, 'In certain teleost fish, insulin is produced by a structure called the ______.', 'Brockmann body', 'Paragraph G: "by the Brockmann body in some teleost fish".', 'G'),
            ],
          },
        ],
      }),
    ],
  },
};
