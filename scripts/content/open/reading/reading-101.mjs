// Vocably Reading 101 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { table } from '../../_html.mjs';

const W1N = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-101',
  title: 'Reading 101: Geothermal Energy',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'geothermal-energy', title: 'Heat from the Earth', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r101-info', type: 'matching_information', bankReusable: true,
            instructionHtml: 'The passage has eleven paragraphs, A-K. Which paragraph contains the following information? <em>Write the correct letter, A-K.</em>',
            questions: [
              q(1, 'an explanation of why the rock in one borehole is so hot', 'J', 'Paragraph J: the borehole "found granite with very high thorium content, whose radioactive decay is believed to power the high temperature of the rock".', 'J'),
              q(2, 'the first occasion on which people are thought to have paid for geothermal energy', 'E', 'Paragraph E: "The admission fees for these baths probably represent the first commercial use of geothermal energy."', 'E'),
              q(3, 'a figure for the number of people working in the geothermal industry', 'D', 'Paragraph D: "As of 2019 the industry employed about one hundred thousand people."', 'D'),
              q(4, 'a reference to a plant that generates electricity from unusually cool water', 'I', 'Paragraph I: a binary cycle plant in Alaska came online "producing electricity from a record low temperature".', 'I'),
            ],
          },
          {
            id: 'r101-table', type: 'table_completion', wordLimit: W1N,
            instructionHtml: 'Complete the table below. Choose <strong>ONE WORD AND/OR A NUMBER</strong> from the passage for each answer.',
            stemHtml: table(
              ['Date', 'Place', 'Event'],
              [
                ['15th century', 'Chaudes-Aigues, France', 'the oldest geothermal {{q5}} heating system in the world starts operating'],
                ['1827', 'Larderello, Italy', 'steam from geysers is used to extract {{q6}} acid from volcanic mud'],
                ['1904', 'Larderello, Italy', 'the first geothermal generator is tested and lights {{q7}} light bulbs'],
                ['{{q8}}', 'Union County, Oregon', 'the Hot Lake Hotel becomes the first known building to rely on geothermal energy for most of its heat'],
                ['1960', 'The Geysers, California', 'the first US geothermal power plant opens; its original turbine produces {{q9}} MW of net power for over 30 years'],
              ],
              'Milestones in the use of geothermal energy',
            ),
            questions: [
              q(5, null, 'district', 'Paragraph E: "The world\'s oldest geothermal district heating system, in Chaudes-Aigues, France, has been operating since the 15th century."', 'E'),
              q(6, null, 'boric', 'Paragraph E: "The earliest industrial exploitation began in 1827 with the use of geyser steam to extract boric acid from volcanic mud in Larderello, Italy."', 'E'),
              q(7, null, ['four', '4'], 'Paragraph G: Prince Piero Ginori Conti "tested the first geothermal power generator on 4 July 1904" and "It successfully lit four light bulbs."', 'G'),
              q(8, null, '1907', 'Paragraph F: "The world\'s first known building to utilize geothermal energy as its primary heat source was the Hot Lake Hotel in Union County, Oregon, beginning in 1907."', 'F'),
              q(9, null, '11', 'Paragraph H: "The original turbine lasted for more than 30 years and produced 11 MW net power."', 'H'),
            ],
          },
          {
            id: 'r101-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(10, 'The output of geothermal power stations changes with the weather.', 'FALSE', 'Paragraph B: "Geothermal power plants produce power at a constant rate, regardless of weather conditions."', 'B'),
              q(11, 'In 2025 geothermal power accounted for more than one percent of the world\'s renewable capacity.', 'FALSE', 'Paragraph D: 16 GW of geothermal power "was less than 1% of renewable power capacity".', 'D'),
              q(12, 'For almost fifty years, Larderello was the only place producing geothermal electricity on an industrial scale.', 'TRUE', 'Paragraph G: "In 1911, the world\'s first commercial geothermal power plant was built there. It was the only industrial producer of geothermal power until New Zealand built a plant in 1958."', 'G'),
              q(13, 'Binary cycle technology was developed by an international team of engineers.', 'NOT GIVEN', 'Paragraph I says the technology "was first demonstrated in 1967 in the USSR and later introduced to the US in 1981" but gives no information about who developed it.', 'I'),
            ],
          },
        ],
      }),
    ],
  },
};
