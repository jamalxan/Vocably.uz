// Vocably Reading 69 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank, table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-69',
  title: 'Reading 69: The Science of Compost',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'compost', title: 'The Science of Compost', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r69-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Grass cuttings and food scraps are examples of carbon-rich brown waste.', 'FALSE', 'Paragraph B: they are green waste, "nitrogen-rich materials such as leaves, grass, and food scraps".', 'B'),
              q(2, 'Material that could be composted makes up roughly a fifth of what goes into landfills.', 'TRUE', 'Paragraph C: "food and other compostable materials make up about 20% of waste in landfills".', 'C'),
              q(3, 'Hot composting produces better-quality compost than slower methods.', 'NOT GIVEN', 'Paragraph F says hot composting increases "the decomposition rate, thus producing compost more quickly" – it says nothing about quality.', 'F'),
              q(4, 'Thermophilic bacteria are rarely present in ordinary soil.', 'FALSE', 'Paragraph I: they "are not active between −5 and 25 °C (23 and 77 °F), yet are found throughout soil".', 'I'),
            ],
          },
          {
            id: 'r69-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Condition', 'Effect'],
              [
                ['Temperature of the pile', 'should be kept between {{q5}} and 71 °C until the material has broken down'],
                ['Carbon-to-nitrogen ratio', 'most efficient at about {{q6}}:1'],
                ['Ratio above 30', 'the material is short of {{q7}}'],
                ['Ratio below 15', 'some nitrogen is likely to be lost as {{q8}} gas'],
                ['Very large windrow operations', 'may exceed 60 °C, which can kill useful soil microbes while {{q9}} the waste'],
              ],
              'Managing a compost pile'
            ),
            questions: [
              q(5, null, '54', 'Paragraph E: "maintaining high temperatures 130–160 °F (54–71 °C) until the materials are broken down".', 'E'),
              q(6, null, '25', 'Paragraph F: "Composting is most efficient with a carbon-to-nitrogen ratio of about 25:1."', 'F'),
              q(7, null, 'nitrogen', 'Paragraph F: "Above 30, the substrate is nitrogen starved."', 'F'),
              q(8, null, 'ammonia', 'Paragraph F: "Below 15, it is likely to outgas a portion of nitrogen as ammonia."', 'F'),
              q(9, null, 'pasteurizing', 'Paragraph I: "potentially killing beneficial soil microorganisms but also pasteurizing the waste".', 'I'),
            ],
          },
          {
            id: 'r69-endings', type: 'matching_sentence_endings',
            instructionHtml: 'Complete each sentence with the correct ending, <strong>A-G</strong>, below.',
            bank: bank([
              'break down tough materials such as paper and lignin.',
              'need temperatures below 25 °C in order to reproduce.',
              'reduce waste to smaller pieces by grinding, tearing and chewing.',
              'become active only after other bacteria have raised the temperature.',
              'are the least common organisms found in compost.',
              'are solely responsible for decomposition in semicomposting.',
              'produce most of the methane released from landfills.',
            ]),
            questions: [
              q(10, 'Physical decomposers', 'C', 'Paragraph G: physical decomposers "process the waste into smaller pieces through methods such as grinding, tearing, chewing, and digesting".', 'G'),
              q(11, 'Thermophilic bacteria', 'D', 'Paragraph I: "They activate once the mesophilic bacteria have begun to break down organic matter and increase the temperature to their optimal range."', 'I'),
              q(12, 'Actinomycetota', 'A', 'Paragraph J: "Actinomycetota are needed to break down paper products such as newspaper, bark, etc., and other large molecules such as lignin and cellulose".', 'J'),
              q(13, 'Mesophilic microorganisms', 'F', 'Paragraph K: semicomposting "does not present a thermophilic stage, because mesophilic microorganisms are the only responsible ones, for the degradation of organic matter".', 'K'),
            ],
          },
        ],
      }),
    ],
  },
};
