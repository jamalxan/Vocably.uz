// Vocably Listening 80 — audio/transkript VOA Learning English (public domain),
// savollar va javob kalitlari Vocably uchun yozilgan. Format: ../README.md ("Listening series").
import { q, voaPart } from '../_lib.mjs';
import { mc, table } from '../../_html.mjs';

const W1 = { maxWords: 1, maxNumbers: 1, label: 'ONE WORD AND/OR A NUMBER' };

export default {
  slug: 'vocably-listening-80',
  title: 'Listening 80: Voyageurs National Park',
  difficulty: 'easy',

  listening: {
    audio: 'static',
    checkTimeSec: 60,
    parts: [
      voaPart({
        order: 1, key: 'voyareurs-national-park-land-of-lakes',
        contextText: 'You will hear a talk about Voyageurs National Park, a park of lakes in the state of Minnesota.',
        questionGroups: [
          {
            id: 'l80-notes', type: 'note_completion', wordLimit: W1,
            instructionHtml: 'Complete the notes below. Write <strong>ONE WORD ONLY</strong> for each answer.',
            stemHtml: '<p><strong>The voyageurs</strong></p><ul><li>"voyageur" is a French word meaning {{q1}}</li><li>in the 1700s, French Canadian fur traders came looking for {{q2}} fur and other animal coats</li><li>they travelled around the area in {{q3}}</li><li>they became known for {{q4}} songs as they moved along the waterways</li></ul>',
            questions: [
              q(1, null, ['traveler', 'traveller'], 'The speaker says the word "is a French word meaning traveler".'),
              q(2, null, 'beaver', 'The speaker says the traders came "seeking beaver fur and other animal coats".'),
              q(3, null, ['canoes', 'canoe'], 'The speaker says "They took canoes to get around."'),
              q(4, null, 'singing', 'The speaker says "They became known for singing songs as they navigated the waterways."'),
            ],
          },
          {
            id: 'l80-table', type: 'table_completion', wordLimit: W1,
            instructionHtml: 'Complete the table below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.',
            stemHtml: table(['', 'Details'], [
              ['Size', 'almost {{q5}} hectares, about half of it water'],
              ['History', 'first proposed in 1891; became a national park in {{q6}}'],
              ['Rainy Lake', 'the biggest lake, about {{q7}} square kilometres; popular for fishing; in winter visitors can walk and drive on the ice'],
              ['Kettle Falls Hotel', 'repaired in 1987; the only {{q8}} place to stay in the area'],
            ], 'Voyageurs National Park: key facts'),
            questions: [
              q(5, null, ['88,500', '88500'], 'The speaker says "Voyageurs National Park covers almost 88,500 hectares."'),
              q(6, null, '1971', 'The speaker says "President Richard Nixon signed the bill that finally established Voyageurs as a national park in 1971."'),
              q(7, null, '930', 'The speaker says "It covers about 930 square kilometers."'),
              q(8, null, 'indoor', 'The speaker says "It is the only indoor place to stay in the area."'),
            ],
          },
          {
            id: 'l80-mc', type: 'multiple_choice_single',
            instructionHtml: 'Choose the correct letter, <strong>A, B, C or D</strong>.',
            questions: [
              mc(9, 'Who created the Ellsworth Rock Gardens?', ['a National Park Service official', 'a carpenter and artist from Chicago', 'a French Canadian fur trader', 'an Ojibwe guide'], 'B', 'The speaker says "A carpenter and artist from Chicago named Jack Ellsworth built a summer home on the lake".'),
              mc(10, 'What colours are the northern lights most often?', ['yellow and red', 'blue and purple', 'white or soft green', 'orange and pink'], 'C', 'The speaker says "The lights are most often white or soft green."'),
            ],
          },
        ],
      }),
    ],
  },
};
