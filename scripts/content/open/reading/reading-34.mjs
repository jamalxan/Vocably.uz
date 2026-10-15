// Vocably Reading 34 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-34',
  title: 'Reading 34: The Wheelbarrow in Ancient China',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'wheelbarrow', title: 'The Wheelbarrow in Ancient China', from: 1, to: 13,
        questionGroups: [
          {
            id: 'r34-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 1-5) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank(['Liu Xiang', 'Chen Shou', 'Pei Songzhi', 'Gao Cheng', 'Andreas van Braam Houckgeest', 'Zhuge Liang']),
            questions: [
              q(1, 'gave the earliest written account of a wheelbarrow', 'A', 'Paragraph E: "The first recorded description of a wheelbarrow appears in Liu Xiang\'s work Lives of Famous Immortals."', 'E'),
              q(2, 'attributed the invention of the wheelbarrow to a senior government official', 'B', 'Paragraph F: the Sanguozhi, "compiled by the ancient historian Chen Shou (233–297 AD), credits the invention of the wheelbarrow to Prime Minister Zhuge Liang".', 'F'),
              q(3, 'explained how a wooden frame was built around a single wheel', 'C', 'Paragraph G: Pei Songzhi "described the design in detail as a large single central wheel and axle around which a wooden frame was constructed in representation of an ox".', 'G'),
              q(4, 'distinguished two early designs by the direction in which their shafts pointed', 'D', 'Paragraph G: Gao Cheng "pointed out that the third century \'gliding horse\' wheelbarrow featured the simple difference of the shaft pointing backwards".', 'G'),
              q(5, 'produced an accurate description of the Chinese wheelbarrow as a foreign visitor', 'E', 'Paragraph H: a member of the Dutch East India Company "accurately described its design and ability to hold large amounts of heavy baggage".', 'H'),
            ],
          },
          {
            id: 'r34-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(6, 'In a traditional Chinese wheelbarrow the operator carried part of the weight of the load.', 'FALSE', 'Paragraph B: "Traditional Chinese wheelbarrows, however, had a central wheel supporting the whole load."', 'B'),
              q(7, 'A single-wheeled wheelbarrow is easier to steer in a confined space than a two-wheeled one.', 'TRUE', 'Paragraph C: "the almost universal one-wheel type has better maneuverability in small spaces".', 'C'),
              q(8, 'Dong Yuan\'s father was unable to walk.', 'NOT GIVEN', 'Paragraph D mentions "the pious Dong Yuan pushing his father around in a single-wheel luche barrow" but gives no reason why his father was being pushed.', 'D'),
              q(9, 'After the third century, wheelbarrows with a central wheel became the usual type in China.', 'TRUE', 'Paragraph H: "The more common type after the third century has a large, centrally mounted wheel."', 'H'),
            ],
          },
          {
            id: 'r34-short', type: 'short_answer', wordLimit: W2,
            instructionHtml: 'Answer the questions below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(10, 'From which language does the word "barrow" come?', 'Old English', 'Paragraph A: "Barrow" is "a derivation of the Old English" word barew.', 'A'),
              q(11, 'Approximately how many litres of material does a typical wheelbarrow hold?', ['100', '100 litres'], 'Paragraph B: "Typical capacity is approximately 100 litres (3.53 cubic feet) of material."', 'B'),
              q(12, 'What did the mythological inventor Ko Yu build?', 'Wooden ox', 'Paragraph E: Liu Xiang "describes the invention of the wheelbarrow by the legendary Chinese mythological figure Ko Yu", who builds a Wooden ox.', 'E'),
              q(13, 'How many people could a central-wheeled wheelbarrow usually carry at the same time?', ['six', '6'], 'Paragraph H: "The central-wheeled wheelbarrow could generally transport six human passengers at once".', 'H'),
            ],
          },
        ],
      }),
    ],
  },
};
