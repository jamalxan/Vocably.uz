// Vocably Listening 7 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W2 = { maxWords: 2, maxNumbers: 1, label: 'NO MORE THAN TWO WORDS AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-7',
  title: 'Listening 7: Groundhog Day',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'groundhog-day-weather-predictions-from-the-animal-world',
        contextText: 'You will hear a report about an American tradition in which animals are used to predict the weather.',
        questionGroups: [
          {
            id: 'l7-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(1, 'What did Punxsutawney Phil predict this year?', ['an early spring', 'six more weeks of winter', 'a mild winter', 'heavy snow'], 'B', 'The speaker says the groundhog "predicted that North America would have six more weeks of winter".'),
              mc(2, 'Who woke the groundhog up?', ['a group of children', 'a television weather reporter', 'men wearing black coats and top hats', 'the mayor of the town'], 'C', 'The speaker says "A group of men in black coats and top hats woke up the groundhog".'),
              mc(3, 'According to the speaker, Groundhog Day developed from', ['a Native American custom.', 'the European tradition of Candlemas Day.', 'a German farmers\' market.', 'a Canadian winter festival.'], 'B', 'The speaker says "Groundhog Day is believed to have come from the ancient European tradition of Candlemas Day."'),
              mc(4, 'In parts of Germany, which animal was believed to predict the weather?', ['a hedgehog', 'a bear', 'a fox', 'a rabbit'], 'A', 'The speaker says "people thought that if a hedgehog saw his shadow on Candlemas Day there would be" a second winter.'),
            ],
          },
          {
            id: 'l7-table', type: 'table_completion', wordLimit: W2,
            instructionHtml: 'Complete the table below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(
              ['Name', 'Animal', 'Place', 'Forecast'],
              [
                ['Staten Island Chuck', 'groundhog', 'New York', 'early spring'],
                ['Beardsley Bart', '{{q5}}', 'Bridgeport, Connecticut', 'early spring'],
                ['Scramble the Duck', 'duck', 'Eastford', 'a long {{q6}}'],
                ['Benny the Bass', 'fish', 'Ohio', 'early spring (after eating a {{q7}})'],
                ['Tad and Lil', '{{q8}}', 'Snohomish, Washington', 'early spring'],
              ],
              'Other animal weather predictors',
            ),
            questions: [
              q(5, null, 'prairie dog', 'The speaker says "Beardsley Bart, a prairie dog in Bridgeport, also predicted it would be an early spring this year."'),
              q(6, null, 'winter', 'The speaker says "Scramble the Duck, Jr. said it would be a long winter in nearby Eastford."'),
              q(7, null, 'minnow', 'The speaker says "Benny the Bass, a fish, ate a minnow".'),
              q(8, null, 'frogs', 'The speaker says "Tad and Lil, two frogs from Snohomish in the state of Washington, agreed that spring would come early".'),
            ],
          },
          {
            id: 'l7-sent', type: 'sentence_completion', wordLimit: W2,
            instructionHtml: 'Complete the sentences below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.',
            questions: [
              q(9, 'According to the National Oceanic and Atmospheric Administration, Phil has been correct ______ percent of the time.', '40', 'The speaker says "on average, Phil has gotten it right 40 percent of the time."'),
              q(10, 'Thanks to a 1993 film, Phil is still the most ______ weather predictor.', 'famous', 'The speaker says "Phil remains the most famous weather predictor thanks to the movie Groundhog Day."'),
            ],
          },
        ],
      }),
    ],
  },
};
