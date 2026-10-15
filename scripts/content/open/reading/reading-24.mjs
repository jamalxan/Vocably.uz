// Vocably Reading 24 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, wikiPassage } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-24',
  title: 'Reading 24: Permafrost',
  difficulty: 'hard',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'permafrost', title: 'Permafrost: The Frozen Ground Beneath Our Feet', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r24-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has six paragraphs, A-F. Which paragraph contains the following information? <em>Choose the correct letter, A-F.</em>',
            questions: [
              q(1, 'a comparison between emissions from thawing permafrost and the emissions of particular countries', 'C', 'Paragraph C: "the annual permafrost emissions are likely comparable with global emissions from deforestation, or to annual emissions of large countries such as Russia, the United States or China".', 'C'),
              q(2, 'a reference to how long the oldest frozen ground has existed', 'A', 'Paragraph A: "the oldest permafrost has been continuously frozen for around 700,000 years".', 'A'),
              q(3, 'an estimate of the proportion of buildings and structures threatened by thaw', 'D', 'Paragraph D: "Estimates suggest nearly 70% of such infrastructure is at risk by 2050".', 'D'),
              q(4, 'an explanation of where plant roots are able to grow', 'E', 'Paragraph E: the active layer "can support plant growth, as the roots can only take hold in the soil that\'s thawed".', 'E'),
              q(5, 'the locations of the relatively small amount of permafrost south of the equator', 'B', 'Paragraph B: "Only a minority of permafrost exists in the Southern Hemisphere, where it is consigned to mountain slopes like in the Andes of Patagonia, the Southern Alps of New Zealand, or the highest mountains of Antarctica."', 'B'),
            ],
          },
          {
            id: 'r24-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(6, 'According to the passage, the ground beneath glaciers and ice sheets', [
                'contains the deepest permafrost.',
                'is not normally classed as permafrost.',
                'freezes and thaws with the seasons.',
                'is where the oldest permafrost is found.',
              ], 'B', 'Paragraph A: "The ground beneath glaciers and ice sheets is not usually defined as permafrost".', 'A'),
              mc(7, 'What does the writer say about predicting emissions from thawing permafrost?', [
                'They will probably be larger than emissions caused by humans.',
                'They are expected to trigger runaway warming.',
                'They are hard to estimate because the thaw processes are not well understood.',
                'They will have no measurable effect on global carbon budgets.',
              ], 'C', 'Paragraph C: "It is difficult to accurately predict how much greenhouse gases the permafrost releases because the different thaw processes are still uncertain."', 'C'),
              mc(8, 'Why does ground that was once frozen sometimes collapse when it thaws?', [
                'The ice inside it releases more water than the ground can hold.',
                'Toxic waste dissolves the soil.',
                'Heat from inside the Earth rises to the surface.',
                'Buildings are too heavy for the softened soil.',
              ], 'A', 'Paragraph D: "Formerly frozen ground often contains enough ice that when it thaws, hydraulic saturation is suddenly exceeded, so the ground shifts substantially and may even collapse outright."', 'D'),
              mc(9, 'What is said about disease-causing microbes in permafrost?', [
                'They have already caused a pandemic.',
                'Scientists regard the danger as small.',
                'They are the most serious consequence of thaw.',
                'They cannot survive the thawing process.',
              ], 'B', 'Paragraph D: "concerns have been raised about the potential for pathogenic microorganisms surviving the thaw" but "this is considered unlikely".', 'D'),
            ],
          },
          {
            id: 'r24-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['The active layer', 'Details'],
              [
                ['When its thickness is measured', 'at its greatest extent, at the end of {{q10}}'],
                ['Average thickness in the Northern Hemisphere (2018)', 'about {{q11}} cm'],
                ['Northeastern Siberia, Alaska and Greenland', 'below {{q12}} cm on average, sometimes only 30 cm'],
                ['Southern Norway and the Mongolian Plateau', 'deeper than 600 cm; the record is {{q13}} m'],
                ['Boundary with the permafrost beneath', 'sometimes called the permafrost {{q14}}'],
              ],
            ),
            questions: [
              q(10, null, 'summer', 'Paragraph E: "Active layer thickness is measured during its maximum extent at the end of summer".', 'E'),
              q(11, null, '145', 'Paragraph E: "the average thickness in the Northern Hemisphere is ~145 centimetres (4.76 ft)".', 'E'),
              q(12, null, '50', 'Paragraph E: "Northeastern Siberia, Alaska and Greenland have the most solid permafrost with the lowest extent of active layer (less than 50 centimetres (1.6 ft) on average, and sometimes only 30 centimetres".', 'E'),
              q(13, null, '10', 'Paragraph E: "southern Norway and the Mongolian Plateau are the only areas where the average active layer is deeper than 600 centimetres (20 ft), with the record of 10 metres (33 ft)".', 'E'),
              q(14, null, 'table', 'Paragraph E: "The border between active layer and permafrost itself is sometimes called permafrost table."', 'E'),
            ],
          },
        ],
      }),
    ],
  },
};
