// Vocably Reading 156 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };
const W3 = { maxWords: 3, maxNumbers: 1, label: 'NO MORE THAN THREE WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-156',
  title: 'Reading 156: Wildfires',
  difficulty: 'easy',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'wildfire', title: 'Wildfires', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r156-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'Every natural forest ecosystem is damaged by wildfire.', 'FALSE', 'Paragraph A: "Some natural forest ecosystems depend on wildfire."', 'A'),
              q(2, 'Severe wildfires often follow a wet period and then a spell of hot, dry weather.', 'TRUE', 'Paragraph B: "Climatic cycles with wet periods that create substantial fuels, followed by drought and heat, often precede severe wildfires."', 'B'),
              q(3, 'Human activity has roughly doubled the area of land burned by wildfires.', 'TRUE', 'Paragraph D: "human practices have made the impacts of wildfire worse, with a doubling in land area burned by wildfires compared to natural levels".', 'D'),
              q(4, 'Arson is the leading cause of wildfires in Canada.', 'FALSE', 'Paragraph F: "arson is generally not the main cause of wildfires in Canada".', 'F'),
              q(5, 'The coal seam fire at Centralia has been burning for more than a century.', 'NOT GIVEN', 'Paragraph G lists "Centralia, Pennsylvania" among places where coal seam fires burn, but gives no information about how long it has been burning.', 'G'),
            ],
          },
          {
            id: 'r156-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Type of fire', 'Fuel', 'Characteristics'],
              [
                ['Ground fires', 'underground roots, {{q6}} on the forest floor, other buried organic matter', 'burn by {{q7}}; may last from days to months'],
                ['Surface fires', 'leaf and timber litter, grass, low shrubs', 'usually cooler than {{q8}} °C; spread faster on steep slopes and in {{q9}}'],
                ['Ladder fires', 'small trees, fallen logs, {{q10}}', 'encouraged by invasive climbing plants'],
              ],
              'Fire types and their fuels',
            ),
            questions: [
              q(6, null, 'duff', 'Paragraph I: "Ground fires are fed by subterranean roots, duff on the forest floor, and other buried organic matter."', 'I'),
              q(7, null, 'smoldering', 'Paragraph I: "Ground fires typically burn by smoldering, and can burn slowly for days to months".', 'I'),
              q(8, null, '400', 'Paragraph J: "This kind of fire often burns at a relatively lower temperature than crown fires (less than 400 °C or 750 °F)".', 'J'),
              q(9, null, 'wind', 'Paragraph J: "steep slopes and wind can accelerate the rate of spread".', 'J'),
              q(10, null, 'vines', 'Paragraph K: "Ladder fires consume material between low-level vegetation and tree canopies, such as small trees, downed logs, and vines."', 'K'),
            ],
          },
          {
            id: 'r156-short', type: 'short_answer', wordLimit: W3,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'Apart from health and property, what two natural resources can wildfires contaminate?', ['water and soil', 'soil and water', 'water, soil'], 'Paragraph C: "There is also the potential for contamination of water and soil."', 'C'),
              q(12, 'Which method do tropical farmers commonly use to clear fields in the dry season?', ['slash-and-burn', 'slash and burn'], 'Paragraph E: "In the tropics, farmers often practice the slash-and-burn method of clearing fields during the dry season."', 'E'),
              q(13, 'Roughly what proportion of wildfires are caused by human activities?', ['85%', '85 percent', 'approximately 85%'], 'Paragraph F: "human activities, including campfires, power line failures, and equipment use, are responsible for approximately 85% of wildfires".', 'F'),
              q(14, 'What kind of project caused the peat fires in Kalimantan and Eastern Sumatra?', ['riceland creation', 'riceland creation project'], 'Paragraph I: the peat fires "resulted from a riceland creation project that unintentionally drained and dried the peat".', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
