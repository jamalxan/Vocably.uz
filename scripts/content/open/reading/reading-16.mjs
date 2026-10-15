// Vocably Reading 16 — matn Wikipedia (CC BY-SA 4.0), savollar va javob kalitlari
// Vocably uchun yozilgan. Format: ../README.md ("Reading series").
import { q, TFNG_INSTRUCTION, wikiPassage } from '../_lib.mjs';
import { bank } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-reading-16',
  title: 'Reading 16: The Panama Canal',
  difficulty: 'medium',

  reading: {
    durationSec: 1200,
    passages: [
      wikiPassage({
        order: 1, slug: 'panama-canal', title: 'The Panama Canal: Joining Two Oceans', from: 1, to: 14,
        questionGroups: [
          {
            id: 'r16-tfng', type: 'true_false_notgiven', instructionHtml: TFNG_INSTRUCTION,
            questions: [
              q(1, 'The surface of Gatun Lake lies above sea level.', 'TRUE', 'Paragraph A: "Gatun Lake, an artificial fresh water lake 26 meters (85 ft) above sea level".', 'A'),
              q(2, 'The expansion of the canal was finished earlier than planned.', 'NOT GIVEN', 'Paragraph A says the third lane of locks "was constructed between September 2007 and May 2016" and "began commercial operation on 26 June 2016", but nothing is said about whether this was ahead of or behind schedule.', 'A'),
              q(3, 'The locks of the canal are operated using sea water.', 'FALSE', 'Paragraph A: "An average of 200,000,000 litres (52 million US gallons) of fresh water is used in a single passing of a ship."', 'A'),
              q(4, 'France gave up work on the canal partly because so many workers died.', 'TRUE', 'Paragraph C: France "stopped in 1889 because of a lack of investors\' confidence due to engineering problems and a high worker mortality rate".', 'C'),
              q(5, 'In 2017 ships took more than twelve hours on average to pass through the canal.', 'FALSE', 'Paragraph C: "In 2017, it took ships an average of 11.38 hours to pass between the canal\'s two outer locks."', 'C'),
            ],
          },
          {
            id: 'r16-people', type: 'matching_features', bankReusable: false,
            instructionHtml: 'Look at the following statements (Questions 6-10) and the list of people below. Match each statement with the correct person, <strong>A-F</strong>.',
            bank: bank([
              'Vasco Núñez de Balboa',
              'Charles V',
              'Sir Thomas Browne',
              'Alexander von Humboldt',
              'William Henry Aspinwall',
              'Cornelius Vanderbilt',
            ]),
            questions: [
              q(6, 'wrote privately about the idea of a canal but did nothing further', 'A', 'Paragraph D: Balboa "wrote in his journal the possibility of a canal but did not take action".', 'D'),
              q(7, 'wanted to make the sea journey between Spain and Peru easier', 'B', 'Paragraph D: "Charles V ordered a survey for a route through the Americas in order to ease the voyage for ships traveling between Spain and Peru".', 'D'),
              q(8, 'identified Panama as the best place to build a canal', 'C', 'Paragraph D: "Sir Thomas Browne specifically proposed the Isthmus of Panama as the most convenient place for such a canal".', 'D'),
              q(9, 'preferred a route through a different country', 'D', 'Paragraph E: Humboldt "concluded that the most promising location was across Nicaragua, traversing Lake Nicaragua".', 'E'),
              q(10, 'ran a sea service that linked up with a land crossing of Panama', 'E', 'Paragraph F: Aspinwall "ran steamship legs from New York City to Panama, and from Panama to California, with an overland portage through Panama".', 'F'),
            ],
          },
          {
            id: 'r16-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
            questions: [
              q(11, 'The canal saves ships from the dangerous voyage around the southern end of ______.', 'South America', 'Paragraph B: "enabling them to avoid the lengthy, hazardous route around the southernmost tip of South America".', 'B'),
              q(12, 'Panama\'s government took complete control of the canal in ______.', '1999', 'Paragraph C: "After a period of joint American–Panamanian control, the Panamanian government took control in 1999."', 'C'),
              q(13, 'In 1843 the British made an unsuccessful attempt to build a canal across ______.', 'Nicaragua', 'Paragraph E: "His recommendations influenced the British to attempt a canal across Nicaragua in 1843."', 'E'),
              q(14, 'Thousands of the men who built the Panama railroad died of ______.', 'tropical diseases', 'Paragraph F: "the lives of between 6,000 and 12,000 construction workers who succumbed to Tropical diseases".', 'F'),
            ],
          },
        ],
      }),
    ],
  },
};
